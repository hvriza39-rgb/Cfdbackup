import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming data
    const body = await req.json();
    const { amount, address, network } = body;

    // 2. Validate inputs
    if (!amount || !address || !network) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Validate the Token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Get user (replace with your JWT logic)
    const user = await prisma.user.findFirst(); 

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 5. Validate amount
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    // 6. Get current balance as number
    const currentBalance = Number(user.portfolioBalance) || 0;

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ 
        error: 'Insufficient funds',
        currentBalance,
        requested: withdrawAmount
      }, { status: 400 });
    }

    // 7. Calculate new balance
    const newBalance = currentBalance - withdrawAmount;

    // 8. Update balance - Use number directly (not Decimal)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioBalance: parseFloat(newBalance.toFixed(2)) // Send as number
      }
    });

    // 9. Optional: Create withdrawal record
    // await prisma.withdrawal.create({
    //   data: {
    //     userId: user.id,
    //     amount: withdrawAmount,
    //     address,
    //     network,
    //     status: 'PENDING',
    //   }
    // });

    // 10. Return success with new balance
    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      newBalance: Number(updatedUser.portfolioBalance)
    });

  } catch (error) {
    console.error("❌ Withdrawal API Error:", error);
    
    // Return detailed error in development
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}