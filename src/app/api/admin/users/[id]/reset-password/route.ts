import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const password = body.password || 'Password123!';

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id },
      data: { hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
