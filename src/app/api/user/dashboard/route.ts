import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// ⚠️ FORCE FRESH DATA (Critical for balance updates)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 1. Fetch the User
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

    // 2. Fetch Transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 3. Define the Balance securely
    // We use portfolioBalance because that is what the Admin Panel updates.
    const secureBalance = user.portfolioBalance || 0;
    const profit = secureBalance * 0.15; // Simulated 15% profit

    // 4. Send the Response (Simplified)
    return NextResponse.json({
      user: user,
      // We send 'balance' at the top level to make it easy to find
      balance: secureBalance, 
      profit: profit,
      profitPercent: secureBalance > 0 ? "15.0" : "0",
      transactions: transactions || []
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}