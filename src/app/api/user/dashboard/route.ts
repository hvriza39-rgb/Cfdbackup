import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // In a real app, verify token here. For demo, we get the first user.
    // If you are using JWT, decode it to get the userId.
    
    // NOTE: To make this dynamic for the logged-in user, we assume the token IS the email 
    // or we fetch the user by the email stored in the token. 
    // Since we are simulating auth, let's find the user by the common email '2@3.3' or just the first user.
    
    // For a robust fix, let's just get the First User for now (like previous steps)
    // OR if you are sending email in headers, use that.
    const user = await prisma.user.findFirst(); 

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ FETCH RECENT TRANSACTIONS
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      take: 5,                  // Limit to 5
      orderBy: { createdAt: 'desc' } // Newest first
    });

    return NextResponse.json({ 
      user, 
      transactions: recentTransactions 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}