import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Check against Environment Variables (Simple & Secure)
    // You can set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPass) {
      // Login Success
      return NextResponse.json({ success: true, message: "Admin Login Successful" });
    }

    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}