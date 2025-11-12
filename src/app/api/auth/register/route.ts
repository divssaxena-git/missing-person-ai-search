import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { 
          error: 'Email, password, and full name are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters',
          code: 'PASSWORD_TOO_SHORT'
        },
        { status: 400 }
      );
    }

    // Validate fullName is not empty
    if (fullName.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Full name cannot be empty',
          code: 'INVALID_FULL_NAME'
        },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingEmailUser = await db
      .select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (existingEmailUser.length > 0) {
      return NextResponse.json(
        { 
          error: 'Email already registered',
          code: 'EMAIL_ALREADY_EXISTS'
        },
        { status: 409 }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const sanitizedPhone = phone.trim();
      const existingPhoneUser = await db
        .select()
        .from(users)
        .where(eq(users.phone, sanitizedPhone))
        .limit(1);

      if (existingPhoneUser.length > 0) {
        return NextResponse.json(
          { 
            error: 'Phone number already registered',
            code: 'PHONE_ALREADY_EXISTS'
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user data
    const userData: any = {
      email: sanitizedEmail,
      passwordHash,
      fullName: fullName.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Add phone if provided
    if (phone) {
      userData.phone = phone.trim();
    }

    // Insert user into database
    const newUser = await db
      .insert(users)
      .values(userData)
      .returning();

    // Remove passwordHash from response
    const userResponse = { ...newUser[0] };
    delete userResponse.passwordHash;

    return NextResponse.json(userResponse, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}