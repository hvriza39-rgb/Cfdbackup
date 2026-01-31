import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

// 1. GET User Details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        portfolioBalance: true,
        createdAt: true,
        // Removed 'status' and 'verified' because they don't exist in your DB yet
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // We manually add default values for the missing DB fields
    // so the Frontend doesn't break
    return NextResponse.json({
      ...user,
      status: 'Active',      // Default value
      verified: true,        // Default value
      portfolioBalance: Number(user.portfolioBalance)
    });

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. PUT (Update) User Profile
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // We only update the fields that ACTUALLY exist in your database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        country: body.country,
        // We removed 'status' and 'verified' from here to fix the build error
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}