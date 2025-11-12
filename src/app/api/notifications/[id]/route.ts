import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { 
          error: 'Invalid notification ID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    let readValue = true;
    try {
      const body = await request.json();
      if (body.read !== undefined) {
        if (typeof body.read !== 'boolean') {
          return NextResponse.json(
            { 
              error: 'Read field must be a boolean',
              code: 'INVALID_READ_VALUE'
            },
            { status: 400 }
          );
        }
        readValue = body.read;
      }
    } catch (error) {
      readValue = true;
    }

    const updated = await db
      .update(notifications)
      .set({ read: readValue })
      .where(eq(notifications.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}