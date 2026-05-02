import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verify } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    
    // Using userId from token for better security/performance
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } }); 
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { 
      action,     
      asset,      // Now handles "USOIL", "UKOIL", "EURUSD", etc.
      amount,     
      price,      
      leverage,   
      marginType, 
      marketType  
    } = body;

    // Clean the asset name (e.g., remove "USD" suffix or TradingView "!" for DB consistency)
    const cleanAsset = asset.replace('USD', '').replace('!', '');
    
    const marginAmount = parseFloat(amount);
    const tradeLeverage = parseInt(leverage) || 1;
    const totalExposure = marginAmount * tradeLeverage;

    // VALIDATION: Ensure user can afford the margin
    if (user.portfolioBalance < marginAmount) {
      return NextResponse.json({ error: 'Insufficient balance to cover margin' }, { status: 400 });
    }

    // Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Trade Record
      const trade = await tx.transaction.create({
        data: {
          userId: user.id,
          type: action.toLowerCase(), 
          amount: marginAmount,
          asset: cleanAsset, // Stores "USOIL" instead of "CL1!"
          status: 'Completed',
          leverage: tradeLeverage,
          entryPrice: parseFloat(price),
          exposure: totalExposure,
          marginType: marginType,
          marketType: marketType,
        },
      });

      // 2. Update User Balance
      // Both BUY and SELL (Long/Short) deduct margin from available balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          portfolioBalance: {
            decrement: marginAmount,
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
