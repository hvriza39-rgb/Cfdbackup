import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verify } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
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
    // Destructuring new fields from the frontend
    const { action, asset, amount, price, leverage = 1, marginType = 'ISOLATED' } = body;

    if (!action || !asset || !amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const marginAmount = parseFloat(amount); // The actual cash the user puts up
    const tradeLeverage = parseInt(leverage);
    const totalExposure = marginAmount * tradeLeverage; // The actual value of the position

    // Validation for BUY orders
    if (action === 'BUY' && user.portfolioBalance < marginAmount) {
      return NextResponse.json({ error: 'Insufficient balance for this margin' }, { status: 400 });
    }

    // Logic: We only deduct the MARGIN from the balance, not the total exposure.
    // However, the transaction record should show the full context.
    const [trade] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: action === 'BUY' ? 'Buy' : 'Sell',
          asset: asset, // Works for both 'BTC' and 'AAPL'
          amount: marginAmount, 
          // Suggestion: Add these fields to your Prisma schema if they don't exist:
          // leverage: tradeLeverage,
          // exposure: totalExposure,
          // entryPrice: parseFloat(price),
          status: 'Completed',
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          portfolioBalance: {
            [action === 'BUY' ? 'decrement' : 'increment']: marginAmount,
          },
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      trade,
      details: {
        marginUsed: marginAmount,
        leverage: `${tradeLeverage}x`,
        totalPositionValue: totalExposure
      }
    });

  } catch (error) {
    console.error('Trade error:', error);
    return NextResponse.json({ error: 'Trade failed' }, { status: 500 });
  }
}
