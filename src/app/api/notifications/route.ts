import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const unreadOnly = searchParams.get('unreadOnly');

    // Validate userId is provided
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'Invalid user ID',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate limit and offset
    if (isNaN(limit) || isNaN(offset)) {
      return NextResponse.json(
        { 
          error: 'Invalid limit or offset',
          code: 'INVALID_PAGINATION'
        },
        { status: 400 }
      );
    }

    // Build query with userId filter
    let query = db.select()
      .from(notifications)
      .where(eq(notifications.userId, parsedUserId))
      .orderBy(desc(notifications.createdAt));

    // Add unread filter if specified
    if (unreadOnly === 'true') {
      query = db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, parsedUserId),
            eq(notifications.read, false)
          )
        )
        .orderBy(desc(notifications.createdAt));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}