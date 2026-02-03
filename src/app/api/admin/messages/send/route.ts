import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, subject, body: messageBody } = body; // 'body' is a reserved word, so we rename it

    if (!userId || !subject || !messageBody) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Create the message in the database
    const newMessage = await prisma.message.create({
      data: {
        userId,
        subject,
        body: messageBody,
        isRead: false
      }
    });

    return NextResponse.json({ success: true, message: newMessage });

  } catch (error) {
    console.error("Send Message Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}