import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs'; // 👈 Import bcrypt to check passwords

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 👇 We now expect 'password' in the body
    const { amount, address, network, email, password } = body; 

    if (!amount || !address || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. 🔒 VERIFY PASSWORD
    // This compares the typed password with the hashed one in the database
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // 3. Check Funds
    const withdrawAmount = parseFloat(amount);
    const currentBalance = Number(user.portfolioBalance) || 0;

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 4. Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'Withdrawal',
        amount: withdrawAmount,
        status: 'Pending',
        asset: network || 'USD',
      }
    });

    // 5. Deduct Balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioBalance: { decrement: withdrawAmount }
      }
    });

    return NextResponse.json({ 
      success: true, 
      newBalance: updatedUser.portfolioBalance,
      transaction 
    });

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
  }
}