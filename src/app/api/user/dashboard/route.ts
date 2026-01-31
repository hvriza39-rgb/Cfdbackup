import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// ⚠️ FORCE DYNAMIC: Prevents showing old cached "0" balance
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 1. Fetch User Data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        portfolioBalance: true, // ✅ This is the number the Admin sees
        availableBalance: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch Recent Transactions (Last 5)
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 3. Prepare Data for Frontend
    // ✅ FIX: Force the frontend to use portfolioBalance (matches Admin)
    const mainBalance = user.portfolioBalance || 0;
    
    // Optional: Fake profit calculation for demo (15% of balance)
    const estimatedProfit = mainBalance * 0.15; 

    return NextResponse.json({
      user,
      balances: {
        available: mainBalance, // <--- This ensures User sees what Admin sees
        profit: estimatedProfit,
        profitPercent: mainBalance > 0 ? "15.0" : "0"
      },
      transactions: transactions || []
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}