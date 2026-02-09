import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

type Action = 'APPROVE' | 'REJECT';

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
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const role = typeof decoded.role === 'string' ? decoded.role.toLowerCase() : '';
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const action = body?.action as Action | undefined;
    const note = typeof body?.note === 'string' ? body.note.trim() : null;

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const submission = await prisma.kycSubmission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const nextUserStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

    const updated = await prisma.kycSubmission.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        note,
      },
    });

    await prisma.user.update({
      where: { id: submission.userId },
      data: { kycStatus: nextUserStatus },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error('Admin KYC Update Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
