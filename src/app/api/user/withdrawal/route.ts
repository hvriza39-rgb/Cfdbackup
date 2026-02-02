import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 1. Safe Prisma Initialization
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // The frontend sends: { amount, address, network }
    const { amount, address, network } = body;

    // 2. Validate Input
    if (!amount || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Find the User
    // (In a real app, you would verify the token here. For now, we find the first user.)
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Check Funds
    const withdrawAmount = parseFloat(amount);
    const currentBalance = Number(user.portfolioBalance) || 0;

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 5. Create "Pending" Transaction (So Admin sees it)
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'Withdrawal',
        amount: withdrawAmount,
        status: 'Pending',
        asset: network || 'USD',
      }
    });

    // 6. Deduct Balance Immediately
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioBalance: { decrement: withdrawAmount }
      }
    });

    return NextResponse.json({ 
      success: true, 
      newBalance: updatedUser.portfolioBalance,
      transaction 
    });

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
  }
}