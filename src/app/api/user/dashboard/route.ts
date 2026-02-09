import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken'; // You might need to install: npm install jsonwebtoken @types/jsonwebtoken

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1]; // Remove "Bearer "
    let decoded: any;

    if (!SECRET_KEY) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    try {
      decoded = verify(token, SECRET_KEY);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Now we use the ID/Email from the token to find the REAL user
    const user = await prisma.user.findUnique({
      where: { email: decoded.email }, // Assumes your token stores 'email'
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        portfolioBalance: true,
        availableBalance: true,
        pnl: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's specific transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ user, transactions: recentTransactions });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
