import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Force fresh data (No Caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }, // Newest first
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Admin Transactions Error:", error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}