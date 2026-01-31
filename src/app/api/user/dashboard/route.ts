import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Get Token from Header (NOT Cookies)
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1]; // Remove "Bearer " prefix

    // 2. Verify Token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 3. Fetch User
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        portfolioBalance: true, // The Real Admin Number
        availableBalance: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Fetch Transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 5. Prepare Response
    const secureBalance = user.portfolioBalance || 0;
    const profit = secureBalance * 0.15; // Simulated Profit

    return NextResponse.json({
      user: user,
      balance: secureBalance, 
      profit: profit,
      profitPercent: secureBalance > 0 ? "15.0" : "0",
      transactions: transactions || []
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}