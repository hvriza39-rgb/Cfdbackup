import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verify } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    
    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { 
      action,     // "BUY" or "SELL"
      asset,      // "BTC", "AAPL"
      amount,     // This is the MARGIN input from user
      price,      // Current market price
      leverage,   // e.g., 10
      marginType, // "ISOLATED"
      marketType  // "CRYPTO" or "STOCKS"
    } = body;

    const marginAmount = parseFloat(amount);
    const tradeLeverage = parseInt(leverage) || 1;
    const totalExposure = marginAmount * tradeLeverage;

    // Validate balance (User only needs the Margin amount to open the position)
    if (action === 'BUY' && user.portfolioBalance < marginAmount) {
      return NextResponse.json({ error: 'Insufficient balance for margin' }, { status: 400 });
    }

    // Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Trade Record
      const trade = await tx.transaction.create({
        data: {
          userId: user.id,
          type: action.toLowerCase(), // "buy" or "sell"
          amount: marginAmount,
          asset: asset,
          status: 'Completed',
          leverage: tradeLeverage,
          entryPrice: parseFloat(price),
          exposure: totalExposure,
          marginType: marginType,
          marketType: marketType,
        },
      });

      // 2. Update User Balance (Deduct the Margin)
      await tx.user.update({
        where: { id: user.id },
        data: {
          portfolioBalance: {
            [action === 'BUY' ? 'decrement' : 'increment']: marginAmount,
          },
        },
      });

      return trade;
    });

    return NextResponse.json({ success: true, trade: result });

  } catch (error) {
    console.error('Trade Error:', error);
    return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 });
  }
}
