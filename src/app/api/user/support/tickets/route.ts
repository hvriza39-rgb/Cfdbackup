import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const normalizeStatus = (value?: string | null) => {
  if (!value) return null;
  const upper = value.toUpperCase();
  return upper === 'OPEN' || upper === 'CLOSED' ? upper : null;
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { subject, body, priority } = await req.json();
    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: subject.trim(),
        status: 'OPEN',
        priority: typeof priority === 'string' && priority.trim() ? priority.trim() : null,
        messages: {
          create: {
            sender: 'USER',
            body: body.trim(),
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error('Support Ticket Create Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = normalizeStatus(searchParams.get('status'));

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: user.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Support Ticket List Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
