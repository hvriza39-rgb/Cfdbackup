import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, action, asset, amount, price } = body;

    if (!userId || !action || !asset || !amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalCost = parseFloat(amount) * parseFloat(price);

    // Fetch user and check balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'BUY' && user.balance < totalCost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Record trade and update balance atomically
    const [trade] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          type: action === 'BUY' ? 'Buy' : 'Sell',
          asset,
          amount: parseFloat(amount),
          status: 'Completed',
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            [action === 'BUY' ? 'decrement' : 'increment']: totalCost,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, trade });

  } catch (error) {
    console.error('Trade error:', error);
    return NextResponse.json({ error: 'Trade failed' }, { status: 500 });
  }
}
