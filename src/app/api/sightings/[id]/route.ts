import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sightings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const sighting = await db
      .select()
      .from(sightings)
      .where(eq(sightings.id, parseInt(id)))
      .limit(1);

    if (sighting.length === 0) {
      return NextResponse.json(
        { error: 'Sighting not found', code: 'SIGHTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(sighting[0], { status: 200 });
  } catch (error: any) {
    console.error('GET sighting error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate that only allowed fields are being updated
    const disallowedFields = [
      'id',
      'reportId',
      'report_id',
      'reportedByUserId',
      'reported_by_user_id',
      'sightingLocation',
      'sighting_location',
      'sightingDate',
      'sighting_date',
      'createdAt',
      'created_at',
    ];

    const providedFields = Object.keys(body);
    const invalidFields = providedFields.filter((field) =>
      disallowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot update fields: ${invalidFields.join(', ')}`,
          code: 'INVALID_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate verified field if provided
    if ('verified' in body && typeof body.verified !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Verified field must be a boolean',
          code: 'INVALID_VERIFIED_TYPE',
        },
        { status: 400 }
      );
    }

    // Check if sighting exists
    const existingSighting = await db
      .select()
      .from(sightings)
      .where(eq(sightings.id, parseInt(id)))
      .limit(1);

    if (existingSighting.length === 0) {
      return NextResponse.json(
        { error: 'Sighting not found', code: 'SIGHTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only allowed fields
    const updateData: {
      verified?: boolean;
      description?: string | null;
      contactInfo?: string | null;
      imageUrl?: string | null;
    } = {};

    if ('verified' in body) {
      updateData.verified = body.verified;
    }
    if ('description' in body) {
      updateData.description =
        body.description === null ? null : String(body.description).trim();
    }
    if ('contactInfo' in body) {
      updateData.contactInfo =
        body.contactInfo === null ? null : String(body.contactInfo).trim();
    }
    if ('imageUrl' in body) {
      updateData.imageUrl =
        body.imageUrl === null ? null : String(body.imageUrl).trim();
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'No valid fields to update',
          code: 'NO_VALID_FIELDS',
        },
        { status: 400 }
      );
    }

    const updated = await db
      .update(sightings)
      .set(updateData)
      .where(eq(sightings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PATCH sighting error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}