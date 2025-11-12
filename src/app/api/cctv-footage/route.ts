import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cctvFootage } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      reportId, 
      submittedByUserId, 
      location, 
      footageDate, 
      footageTime, 
      description, 
      videoUrl, 
      contactInfo, 
      status 
    } = body;

    // Validate required fields
    if (!location || location.trim() === '') {
      return NextResponse.json({ 
        error: "Location is required",
        code: "MISSING_LOCATION" 
      }, { status: 400 });
    }

    if (!footageDate || footageDate.trim() === '') {
      return NextResponse.json({ 
        error: "Footage date is required",
        code: "MISSING_FOOTAGE_DATE" 
      }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['pending', 'reviewed', 'matched'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: pending, reviewed, matched",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate integer IDs if provided
    if (reportId !== undefined && reportId !== null && isNaN(parseInt(reportId))) {
      return NextResponse.json({ 
        error: "Report ID must be a valid integer",
        code: "INVALID_REPORT_ID" 
      }, { status: 400 });
    }

    if (submittedByUserId !== undefined && submittedByUserId !== null && isNaN(parseInt(submittedByUserId))) {
      return NextResponse.json({ 
        error: "Submitted by user ID must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: any = {
      location: location.trim(),
      footageDate: footageDate.trim(),
      status: status || 'pending',
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (reportId !== undefined && reportId !== null) {
      insertData.reportId = parseInt(reportId);
    }

    if (submittedByUserId !== undefined && submittedByUserId !== null) {
      insertData.submittedByUserId = parseInt(submittedByUserId);
    }

    if (footageTime !== undefined && footageTime !== null) {
      insertData.footageTime = footageTime.trim();
    }

    if (description !== undefined && description !== null) {
      insertData.description = description.trim();
    }

    if (videoUrl !== undefined && videoUrl !== null) {
      insertData.videoUrl = videoUrl.trim();
    }

    if (contactInfo !== undefined && contactInfo !== null) {
      insertData.contactInfo = contactInfo.trim();
    }

    // Insert into database
    const newFootage = await db.insert(cctvFootage)
      .values(insertData)
      .returning();

    return NextResponse.json(newFootage[0], { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const reportId = searchParams.get('reportId');
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [];

    if (reportId) {
      if (isNaN(parseInt(reportId))) {
        return NextResponse.json({ 
          error: "Report ID must be a valid integer",
          code: "INVALID_REPORT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(cctvFootage.reportId, parseInt(reportId)));
    }

    if (status) {
      const validStatuses = ['pending', 'reviewed', 'matched'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: "Status must be one of: pending, reviewed, matched",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      conditions.push(eq(cctvFootage.status, status));
    }

    // Execute query
    let query = db.select().from(cctvFootage);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(cctvFootage.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}