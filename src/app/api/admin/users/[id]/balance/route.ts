import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount, type } = body;

    // 1. Validate Input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 2. Get Current Balance
    const currentUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = Number(currentUser.portfolioBalance) || 0;
    let newBalance = currentBalance;

    // 3. Calculate New Balance
    if (type === 'add') {
      newBalance = currentBalance + amount;
    } else if (type === 'subtract') {
      newBalance = currentBalance - amount;
    }

    // 4. Update Database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        portfolioBalance: newBalance
      }
    });

    // 5. Create Transaction Record
    await prisma.transaction.create({
      data: {
        userId: id,
        type: type === 'add' ? 'deposit' : 'withdrawal',
        amount: amount,
        status: 'Completed',
        asset: 'USD',
        // REMOVED: date: new Date() (Prisma uses createdAt automatically)
      }
    });

    console.log(`Balance updated. Old: ${currentBalance}, New: ${newBalance}`);

    // 6. Return the UPDATED user
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Balance API Error:", error);
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
  }
}