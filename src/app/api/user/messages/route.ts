import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email'); // We will pass email from frontend

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch Messages for this User
    const messages = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' } // Newest first
    });

    return NextResponse.json({ success: true, messages });

  } catch (error) {
    console.error("Messages Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}