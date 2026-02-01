import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma (or import your existing instance if you have one)
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming data
    const body = await req.json();
    const { amount, address, network } = body;

    // 2. Validate the Token (Basic Check)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ⚠️ IMPORTANT: In a real app, verify the JWT token here to get the real User ID.
    // For now, we will assume the token *contains* the User ID or we fetch a demo user.
    // If you have a verifyToken function, use it here.
    
    // --- DEMO LOGIC (Replace with your real User ID logic) ---
    // This finds the first user in the database to simulate the action.
    const user = await prisma.user.findFirst(); 

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Check if they have enough balance
    const currentBalance = Number(user.portfolioBalance) || 0;
    const withdrawAmount = Number(amount);

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 4. Perform the Transaction (Deduct Balance)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioBalance: currentBalance - withdrawAmount
      }
    });

    // 5. (Optional) Save a "Withdrawal Request" record in the database
    // await prisma.withdrawal.create({ ... })

    // 6. Return the success and new balance
    return NextResponse.json({
      message: 'Withdrawal successful',
      newBalance: updatedUser.portfolioBalance
    });

  } catch (error) {
    console.error("Withdrawal API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}