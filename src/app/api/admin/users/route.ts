import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// ⚠️ THIS LINE FIXES THE "ZERO BALANCE" BUG
// It forces Next.js to fetch fresh data from the DB every time you refresh.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        portfolioBalance: true, // Getting the real balance
        availableBalance: true,
        
        createdAt: true,
        // Add any other fields your admin table needs
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin Users Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}