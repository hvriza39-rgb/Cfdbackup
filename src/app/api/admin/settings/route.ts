import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

// 1. GET Current Settings
export async function GET() {
  try {
    // We just grab the first settings row we find
    const settings = await prisma.settings.findFirst();
    
    return NextResponse.json(settings || {
      btcAddress: '',
      ethAddress: '',
      usdtAddress: ''
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// 2. POST (Save) Settings
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if settings exist
    const existing = await prisma.settings.findFirst();

    let saved;
    if (existing) {
      // Update existing
      saved = await prisma.settings.update({
        where: { id: existing.id },
        data: {
          btcAddress: body.btcAddress,
          ethAddress: body.ethAddress,
          usdtAddress: body.usdtAddress,
        }
      });
    } else {
      // Create new
      saved = await prisma.settings.create({
        data: {
          btcAddress: body.btcAddress,
          ethAddress: body.ethAddress,
          usdtAddress: body.usdtAddress,
        }
      });
    }

    return NextResponse.json(saved);

  } catch (error) {
    console.error("Settings Save Error:", error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}