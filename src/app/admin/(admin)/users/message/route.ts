import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'; // ✅ Fixed Import

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, message } = body;

    console.log("Sending Message to:", userId); // Debug Log

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 });
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        title: title || 'Admin Message',
        message: message,
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, notification });

  } catch (error: any) {
    console.error("Message Error:", error);
    // Return the ACTUAL error message so we can see it in the browser
    return NextResponse.json({ error: error.message || 'Failed to send' }, { status: 500 });
  }
}
