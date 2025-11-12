import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cctvFootage } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const footageId = parseInt(id);

    // Check if footage exists
    const existingFootage = await db
      .select()
      .from(cctvFootage)
      .where(eq(cctvFootage.id, footageId))
      .limit(1);

    if (existingFootage.length === 0) {
      return NextResponse.json(
        { error: 'CCTV footage not found', code: 'FOOTAGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Prevent updating protected fields
    const protectedFields = [
      'id',
      'submittedByUserId',
      'submitted_by_user_id',
      'location',
      'footageDate',
      'footage_date',
      'footageTime',
      'footage_time',
      'contactInfo',
      'contact_info',
      'createdAt',
      'created_at'
    ];

    const hasProtectedField = protectedFields.some(field => field in body);
    if (hasProtectedField) {
      return NextResponse.json(
        {
          error: 'Cannot update protected fields (id, submittedByUserId, location, footageDate, footageTime, contactInfo, createdAt)',
          code: 'PROTECTED_FIELD_UPDATE_ATTEMPT'
        },
        { status: 400 }
      );
    }

    // Extract only allowed fields for update
    const { status, description, videoUrl, reportId } = body;

    // Build update object with only provided fields
    const updates: any = {};

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['pending', 'reviewed', 'matched'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status. Must be one of: pending, reviewed, matched',
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // Add other fields if provided
    if (description !== undefined) {
      updates.description = description;
    }

    if (videoUrl !== undefined) {
      updates.videoUrl = videoUrl;
    }

    if (reportId !== undefined) {
      // Validate reportId is a valid integer if provided and not null
      if (reportId !== null && (isNaN(parseInt(reportId)) || parseInt(reportId) <= 0)) {
        return NextResponse.json(
          {
            error: 'Invalid reportId. Must be a valid positive integer or null',
            code: 'INVALID_REPORT_ID'
          },
          { status: 400 }
        );
      }
      updates.reportId = reportId === null ? null : parseInt(reportId);
    }

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: 'No valid fields provided for update',
          code: 'NO_UPDATE_FIELDS'
        },
        { status: 400 }
      );
    }

    // Perform update
    const updatedFootage = await db
      .update(cctvFootage)
      .set(updates)
      .where(eq(cctvFootage.id, footageId))
      .returning();

    if (updatedFootage.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update CCTV footage', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedFootage[0], { status: 200 });
  } catch (error: any) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}