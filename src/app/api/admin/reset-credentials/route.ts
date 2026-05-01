import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const uri = process.env.MONGODB_URI;

    if (!email || !password || !uri) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    const result = await db.collection('users').updateOne(
      { email, role: 'admin' },
      { $set: { password: hashedPassword } }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Credentials reset successfully' });

  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
