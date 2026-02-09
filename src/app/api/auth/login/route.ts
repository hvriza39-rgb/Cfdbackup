import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    });

    // Verify credentials
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // ✅ FIXED: We MUST send the token in the body for the frontend to use
    const response = NextResponse.json({ 
      success: true,
      token: token, // <--- ADD THIS LINE
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set Cookie (Keep this, it's perfect for Middleware)
    response.cookies.set('token', token, {
      httpOnly: true,                                        
      secure: process.env.NODE_ENV === 'production',    
      sameSite: 'lax',                                        
      path: '/',                                             
      maxAge: 3600,                                         
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' }, 
      { status: 500 }
    );
  }
}
