import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sightings, missingPersons } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, sightingLocation, sightingDate, reportedByUserId, description, contactInfo, imageUrl } = body;

    // Validate required fields
    if (!reportId) {
      return NextResponse.json({ 
        error: "reportId is required",
        code: "MISSING_REPORT_ID" 
      }, { status: 400 });
    }

    if (!sightingLocation || sightingLocation.trim() === '') {
      return NextResponse.json({ 
        error: "sightingLocation is required and cannot be empty",
        code: "MISSING_SIGHTING_LOCATION" 
      }, { status: 400 });
    }

    if (!sightingDate || sightingDate.trim() === '') {
      return NextResponse.json({ 
        error: "sightingDate is required and cannot be empty",
        code: "MISSING_SIGHTING_DATE" 
      }, { status: 400 });
    }

    // Validate reportId is a valid integer
    const parsedReportId = parseInt(reportId);
    if (isNaN(parsedReportId)) {
      return NextResponse.json({ 
        error: "reportId must be a valid integer",
        code: "INVALID_REPORT_ID" 
      }, { status: 400 });
    }

    // Validate reportedByUserId if provided
    let parsedReportedByUserId = null;
    if (reportedByUserId !== undefined && reportedByUserId !== null) {
      parsedReportedByUserId = parseInt(reportedByUserId);
      if (isNaN(parsedReportedByUserId)) {
        return NextResponse.json({ 
          error: "reportedByUserId must be a valid integer or null",
          code: "INVALID_REPORTED_BY_USER_ID" 
        }, { status: 400 });
      }
    }

    // Verify that the missing person report exists
    const reportExists = await db.select()
      .from(missingPersons)
      .where(eq(missingPersons.id, parsedReportId))
      .limit(1);

    if (reportExists.length === 0) {
      return NextResponse.json({ 
        error: "Missing person report not found",
        code: "REPORT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Create new sighting
    const newSighting = await db.insert(sightings)
      .values({
        reportId: parsedReportId,
        reportedByUserId: parsedReportedByUserId,
        sightingLocation: sightingLocation.trim(),
        sightingDate: sightingDate.trim(),
        description: description ? description.trim() : null,
        contactInfo: contactInfo ? contactInfo.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        verified: false,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newSighting[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate reportId is provided
    if (!reportId) {
      return NextResponse.json({ 
        error: "reportId query parameter is required",
        code: "MISSING_REPORT_ID" 
      }, { status: 400 });
    }

    // Validate reportId is a valid integer
    const parsedReportId = parseInt(reportId);
    if (isNaN(parsedReportId)) {
      return NextResponse.json({ 
        error: "reportId must be a valid integer",
        code: "INVALID_REPORT_ID" 
      }, { status: 400 });
    }

    // Fetch sightings for the specified report
    const results = await db.select()
      .from(sightings)
      .where(eq(sightings.reportId, parsedReportId))
      .orderBy(desc(sightings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}