import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    const { body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Message body required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const [message] = await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          sender: 'ADMIN',
          body: body.trim(),
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('Admin Support Ticket Message Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
