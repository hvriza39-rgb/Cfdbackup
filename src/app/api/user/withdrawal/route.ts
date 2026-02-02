import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, address, network, email } = body; // 👈 Now receiving Email

    if (!amount || !address || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ FIX: Find the SPECIFIC user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check Funds
    const withdrawAmount = parseFloat(amount);
    const currentBalance = Number(user.portfolioBalance) || 0;

    // Debug Log (Optional - view in terminal)
    console.log(`Processing withdraw for: ${email}`);
    console.log(`Current Balance: ${currentBalance}, Request: ${withdrawAmount}`);

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'Withdrawal',
        amount: withdrawAmount,
        status: 'Pending',
        asset: network || 'USD',
      }
    });

    // Deduct Balance
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