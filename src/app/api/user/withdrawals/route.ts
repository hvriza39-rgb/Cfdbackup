import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 1. Safe Prisma Initialization
// This prevents "Too many connections" errors during development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  console.log("----- WITHDRAWAL REQUEST STARTED -----");

  try {
    // 2. Parse Body
    const body = await req.json();
    console.log("Received Body:", body);
    
    const { amount, address, network } = body;

    // 3. Validation
    if (!amount || !address || !network) {
      console.log("Error: Missing fields");
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Get User (HARDCODED FOR SAFETY if Auth fails)
    // In a real app, extract ID from the 'authorization' header token.
    // For now, we find the first user to make the demo work.
    let user = await prisma.user.findFirst();

    if (!user) {
      console.log("Error: No user found in database");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`User Found: ${user.email} | Balance: ${user.portfolioBalance}`);

    // 5. Check Balance
    const withdrawAmount = parseFloat(amount);
    const currentBalance = Number(user.portfolioBalance);

    if (currentBalance < withdrawAmount) {
      console.log("Error: Insufficient funds");
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 6. Update Database
    console.log(`Deducting $${withdrawAmount}...`);
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioBalance: currentBalance - withdrawAmount
      }
    });

    console.log("Success! New Balance:", updatedUser.portfolioBalance);
    console.log("----- WITHDRAWAL REQUEST ENDED -----");

    return NextResponse.json({
      message: 'Withdrawal successful',
      newBalance: updatedUser.portfolioBalance
    });

  } catch (error: any) {
    console.error("CRITICAL BACKEND ERROR:", error);
    return NextResponse.json({ 
      error: 'Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}