import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verify } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    
    // FIX 1: Find by email if userId isn't in token. 
    // Also, MongoDB IDs in Prisma are usually referenced via the 'id' field in the query.
    const user = await prisma.user.findUnique({ 
      where: { email: decoded.email } 
    });

    if (!user) {
      console.error("Trade Fail: User not found for email", decoded.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { 
      action,     
      asset,      
      amount,     
      price,      
      leverage,   
      marginType, 
      marketType  
    } = body;

    const marginAmount = parseFloat(amount);
    const tradeLeverage = parseInt(leverage) || 1;
    const totalExposure = marginAmount * tradeLeverage;

    // Validation
    if (user.portfolioBalance < marginAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Trade Record
      const trade = await tx.transaction.create({
        data: {
          userId: user.id,
          type: action.toLowerCase(), 
          amount: marginAmount,
          asset: asset.replace('USD', ''), // Clean up asset name
          status: 'Completed',
          leverage: tradeLeverage,
          entryPrice: parseFloat(price),
          exposure: totalExposure,
          marginType: marginType || "ISOLATED",
          marketType: marketType || "CRYPTO", // Fallback to avoid null
        },
      });

      // 2. Deduct Margin
      await tx.user.update({
        where: { id: user.id },
        data: {
          portfolioBalance: { decrement: marginAmount },
        },
      });

      return trade;
    });

    return NextResponse.json({ success: true, trade: result });

  } catch (error: any) {
    // FIX 2: Detailed logging to see exactly what Prisma doesn't like
    console.error('DATABASE TRADE ERROR:', error);
    return NextResponse.json({ 
      error: 'Trade failed', 
      message: error.message 
    }, { status: 500 });
  }
}
