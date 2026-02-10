import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma';
import { cloudinary, isCloudinaryConfigured } from '../../../../../lib/cloudinary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export async function POST(req: Request) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

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

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const docType = formData.get('docType');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'kyc-documents',
      resource_type: 'auto',
    });

    const submission = await prisma.kycSubmission.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        docType: typeof docType === 'string' ? docType : null,
        fileUrl: uploadResult.secure_url,
        fileId: uploadResult.public_id,
        fileMime: file.type,
        fileName: file.name,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: 'PENDING' },
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error('KYC Upload Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
