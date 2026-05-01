import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    return NextResponse.json({ success: true, count: users.length });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
