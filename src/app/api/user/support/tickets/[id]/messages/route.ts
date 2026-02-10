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

    const { body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Message body required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'CLOSED') {
      return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 });
    }

    const [message] = await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          sender: 'USER',
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
    console.error('Support Ticket Message Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
