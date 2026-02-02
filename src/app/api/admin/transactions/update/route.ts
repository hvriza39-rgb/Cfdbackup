import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactionId, action } = body; // action = 'approve' or 'reject'

    if (!transactionId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Find the Transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'Pending') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    // 2. Handle Logic based on Action
    let newStatus = '';

    if (action === 'approve') {
      newStatus = 'Success';
      // Money was already deducted upon request, so we just update status.
    } 
    else if (action === 'reject') {
      newStatus = 'Failed';
      // REFUND THE USER: Add the amount back to their balance
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          portfolioBalance: { increment: transaction.amount }
        }
      });
    }

    // 3. Update Transaction Status
    const updatedTx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: newStatus }
    });

    return NextResponse.json({ success: true, transaction: updatedTx });

  } catch (error: any) {
    console.error("Transaction Update Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}