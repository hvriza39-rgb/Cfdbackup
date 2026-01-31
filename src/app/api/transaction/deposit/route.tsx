import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, asset } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Update Balance & Create Transaction
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { 
          portfolioBalance: { increment: parseFloat(amount) }
        }
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'Completed',
          asset: asset || 'USD',
          // REMOVED: description: 'Deposit via Wallet' (This caused the error)
        }
      })
    ]);

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: 'Deposit failed' }, { status: 500 });
  }
}