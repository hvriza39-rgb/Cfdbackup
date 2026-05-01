import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const uri = process.env.MONGODB_URI;

    console.log('Reset attempt:', { email, hasPassword: !!password, hasUri: !!uri });

    if (!email || !password || !uri) {
      console.log('Missing env vars');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB connected');

    const db = client.db();
    const result = await db.collection('users').updateOne(
      { email, role: 'admin' },
      { $set: { hashedPassword } }
    );

    await client.close();
    console.log('Update result:', result.matchedCount, result.modifiedCount);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Credentials reset successfully' });

  } catch (error: any) {
    console.error('Reset error full:', error?.message, error?.stack);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
} 
