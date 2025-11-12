import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { missingPersons } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const reportedBy = searchParams.get('reportedBy');

    let query = db.select().from(missingPersons);
    const conditions = [];

    if (status) {
      conditions.push(eq(missingPersons.status, status));
    }

    if (reportedBy) {
      const reportedByInt = parseInt(reportedBy);
      if (!isNaN(reportedByInt)) {
        conditions.push(eq(missingPersons.reportedBy, reportedByInt));
      }
    }

    if (search) {
      conditions.push(
        or(
          like(missingPersons.fullName, `%${search}%`),
          like(missingPersons.lastSeenLocation, `%${search}%`),
          like(missingPersons.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(missingPersons.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      reportedBy,
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

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json(
        { error: 'Full name is required', code: 'MISSING_FULL_NAME' },
        { status: 400 }
      );
    }

    if (!lastSeenLocation || lastSeenLocation.trim() === '') {
      return NextResponse.json(
        { error: 'Last seen location is required', code: 'MISSING_LAST_SEEN_LOCATION' },
        { status: 400 }
      );
    }

    if (!lastSeenDate || lastSeenDate.trim() === '') {
      return NextResponse.json(
        { error: 'Last seen date is required', code: 'MISSING_LAST_SEEN_DATE' },
        { status: 400 }
      );
    }

    if (!contactInfo || contactInfo.trim() === '') {
      return NextResponse.json(
        { error: 'Contact information is required', code: 'MISSING_CONTACT_INFO' },
        { status: 400 }
      );
    }

    if (reportedBy === undefined || reportedBy === null) {
      return NextResponse.json(
        { error: 'Reported by user ID is required', code: 'MISSING_REPORTED_BY' },
        { status: 400 }
      );
    }

    if (typeof reportedBy !== 'number' && isNaN(parseInt(reportedBy))) {
      return NextResponse.json(
        { error: 'Reported by must be a valid integer', code: 'INVALID_REPORTED_BY' },
        { status: 400 }
      );
    }

    if (status && !['active', 'found', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be one of: active, found, closed', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const reportedByInt = typeof reportedBy === 'number' ? reportedBy : parseInt(reportedBy);

    const insertData: any = {
      reportedBy: reportedByInt,
      fullName: fullName.trim(),
      lastSeenLocation: lastSeenLocation.trim(),
      lastSeenDate: lastSeenDate.trim(),
      contactInfo: contactInfo.trim(),
      status: status ? status.trim() : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (age !== undefined && age !== null) {
      insertData.age = typeof age === 'number' ? age : parseInt(age);
    }

    if (gender) {
      insertData.gender = gender.trim();
    }

    if (height) {
      insertData.height = height.trim();
    }

    if (weight) {
      insertData.weight = weight.trim();
    }

    if (hairColor) {
      insertData.hairColor = hairColor.trim();
    }

    if (eyeColor) {
      insertData.eyeColor = eyeColor.trim();
    }

    if (complexion) {
      insertData.complexion = complexion.trim();
    }

    if (distinguishingMarks) {
      insertData.distinguishingMarks = distinguishingMarks.trim();
    }

    if (description) {
      insertData.description = description.trim();
    }

    if (imageUrl) {
      insertData.imageUrl = imageUrl.trim();
    }

    const newReport = await db.insert(missingPersons)
      .values(insertData)
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}