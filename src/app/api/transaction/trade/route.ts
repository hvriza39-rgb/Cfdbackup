import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verify } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    // Get userId from token instead of body
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, asset, amount, price } = body;

    if (!action || !asset || !amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalCost = parseFloat(amount); // amount is already in USD

    if (action === 'BUY' && user.portfolioBalance < totalCost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const [trade] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: action === 'BUY' ? 'Buy' : 'Sell',
          asset,
          amount: parseFloat(amount),
          status: 'Completed',
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          portfolioBalance: {
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
