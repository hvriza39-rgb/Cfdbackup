import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

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

    const count = await prisma.message.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Unread Count Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
