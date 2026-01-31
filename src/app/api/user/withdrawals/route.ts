import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    console.log("1. Processing Withdrawal Request...");

    // 1. Authenticate
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      console.log("❌ Invalid token");
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;
    
    // 2. Parse Body
    const body = await request.json();
    console.log("2. Request Body:", body);

    const { amount, network, address } = body;
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 3. Check Balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (Number(user.portfolioBalance) < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    console.log("3. User has funds. Creating transaction...");

    // 4. Run Transaction (Update Balance + Create Record)
    const result = await prisma.$transaction([
      // Deduct Balance
      prisma.user.update({
        where: { id: userId },
        data: { 
          portfolioBalance: { decrement: withdrawAmount }
        }
      }),
      // Create History Record
      prisma.transaction.create({
        data: {
          userId: userId,
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'Pending',
          asset: 'USD',
          network: network || 'Bank',
          address: address || 'N/A'
        }
      })
    ]);

    console.log("✅ Withdrawal Successful:", result);

    return NextResponse.json({ 
      success: true, 
      newBalance: Number(result[0].portfolioBalance)
    });

  } catch (error: any) {
    console.error("❌ WITHDRAWAL API CRASH:", error); // Look for this in your terminal!
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}