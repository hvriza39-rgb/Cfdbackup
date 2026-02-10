import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const normalizeStatus = (value?: string | null) => {
  if (!value) return null;
  const upper = value.toUpperCase();
  return upper === 'OPEN' || upper === 'CLOSED' ? upper : null;
};

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

    const role = typeof decoded.role === 'string' ? decoded.role.toLowerCase() : '';
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = normalizeStatus(searchParams.get('status'));

    const tickets = await prisma.supportTicket.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Admin Support Ticket List Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
