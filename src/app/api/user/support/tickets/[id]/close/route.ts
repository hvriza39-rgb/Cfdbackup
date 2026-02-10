import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

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

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'CLOSED' },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Support Ticket Close Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
