import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    // 1. Authenticate User
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id; // Adjust based on your token payload
    const body = await request.json();
    const { amount, network, address } = body;
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 2. Check Balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = Number(user.portfolioBalance);

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 3. Process Withdrawal (Deduct Money)
    const newBalance = currentBalance - withdrawAmount;

    // Transaction: Update User Balance & Create Record
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { portfolioBalance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'Pending', // Withdrawals usually need admin approval
          asset: 'USD',
          // You can add network/address fields to your schema if you want to save them
        }
      })
    ]);

    // 4. Return new balance
    return NextResponse.json({ 
      success: true, 
      newBalance: result[0].portfolioBalance 
    });

  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}