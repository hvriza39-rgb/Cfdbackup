import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received Settings Update:", body); // 🔍 This prints to your terminal

    // Check if settings row exists
    const existing = await prisma.settings.findFirst();

    let saved;
    if (existing) {
      // Update existing
      saved = await prisma.settings.update({
        where: { id: existing.id },
        data: {
          btcAddress: body.btcAddress,
          ethAddress: body.ethAddress, // We use this for the "EVM" address
          // usdtAddress is optional, we can ignore it if you only use EVM
        }
      });
    } else {
      // Create new
      saved = await prisma.settings.create({
        data: {
          btcAddress: body.btcAddress,
          ethAddress: body.ethAddress,
        }
      });
    }

    return NextResponse.json(saved);

  } catch (error) {
    console.error("❌ SETTINGS SAVE ERROR:", error); // 🔍 Check your VS Code terminal for this!
    return NextResponse.json({ error: 'Server failed to save' }, { status: 500 });
  }
}