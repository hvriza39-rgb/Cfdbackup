import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const normalizeStatus = (value?: string | null) => {
  if (!value) return null;
  const upper = value.toUpperCase();
  return upper === 'OPEN' || upper === 'CLOSED' ? upper : null;
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Admin Support Ticket Detail Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const { status } = await req.json();
    const nextStatus = normalizeStatus(status);
    if (!nextStatus) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: nextStatus },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Admin Support Ticket Update Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
