import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { missingPersons } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const report = await db
      .select()
      .from(missingPersons)
      .where(eq(missingPersons.id, id))
      .limit(1);

    if (report.length === 0) {
      return NextResponse.json(
        { error: 'Report not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(report[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
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
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Extract updatable fields
    const {
      fullName,
      age,
      gender,
      height,
      weight,
      hairColor,
      eyeColor,
      complexion,
      distinguishingMarks,
      lastSeenLocation,
      lastSeenDate,
      description,
      imageUrl,
      status,
      contactInfo,
    } = body;

    // Build updates object with only provided fields
    const updates: any = {};

    if (fullName !== undefined) updates.fullName = fullName;
    if (age !== undefined) updates.age = age;
    if (gender !== undefined) updates.gender = gender;
    if (height !== undefined) updates.height = height;
    if (weight !== undefined) updates.weight = weight;
    if (hairColor !== undefined) updates.hairColor = hairColor;
    if (eyeColor !== undefined) updates.eyeColor = eyeColor;
    if (complexion !== undefined) updates.complexion = complexion;
    if (distinguishingMarks !== undefined) updates.distinguishingMarks = distinguishingMarks;
    if (lastSeenLocation !== undefined) updates.lastSeenLocation = lastSeenLocation;
    if (lastSeenDate !== undefined) updates.lastSeenDate = lastSeenDate;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (status !== undefined) updates.status = status;
    if (contactInfo !== undefined) updates.contactInfo = contactInfo;

    // Check if at least one field is provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update', code: 'NO_FIELDS_PROVIDED' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['active', 'found', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status must be one of: active, found, closed', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
    }

    // Check if report exists
    const existingReport = await db
      .select()
      .from(missingPersons)
      .where(eq(missingPersons.id, id))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { error: 'Report not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update the report
    const updated = await db
      .update(missingPersons)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(missingPersons.id, id))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if report exists
    const existingReport = await db
      .select()
      .from(missingPersons)
      .where(eq(missingPersons.id, id))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { error: 'Report not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the report
    const deleted = await db
      .delete(missingPersons)
      .where(eq(missingPersons.id, id))
      .returning();

    return NextResponse.json(
      {
        message: 'Report deleted successfully',
        deletedReport: deleted[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}