import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Forbidden: Faculty access only' }, { status: 403 })
    }

    const requests = await prisma.extraLecture.findMany({
      where: { facultyId: authUser.id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        division: { select: { id: true, name: true, semester: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      requests: requests.map((r) => ({
        id: r.id,
        subjectId: r.subjectId,
        subjectName: r.subject.name,
        subjectCode: r.subject.code,
        divisionId: r.divisionId,
        divisionName: r.division.name,
        date: r.date.toISOString().split('T')[0],
        startTime: r.startTime,
        endTime: r.endTime,
        roomNumber: r.roomNumber,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch (err: any) {
    console.error('Error loading faculty extra lectures:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch extra lecture requests' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Forbidden: Faculty access only' }, { status: 403 })
    }

    const body = await req.json()
    const { subjectId, divisionId, date, startTime, endTime, roomNumber, reason } = body

    if (!subjectId || !divisionId || !date || !startTime || !endTime || !roomNumber || !reason) {
      return NextResponse.json(
        { error: 'All fields are required (subject, division, date, startTime, endTime, roomNumber, reason)' },
        { status: 400 }
      )
    }

    // Verify date is valid
    const parsedDate = new Date(date + 'T12:00:00.000Z')
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const extraLecture = await prisma.extraLecture.create({
      data: {
        subjectId,
        divisionId,
        facultyId: authUser.id,
        date: parsedDate,
        startTime,
        endTime,
        roomNumber,
        reason,
        status: 'PENDING',
      },
      include: {
        subject: true,
        division: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Extra lecture request submitted successfully for Admin approval',
        extraLecture: {
          id: extraLecture.id,
          subjectId: extraLecture.subjectId,
          subjectName: extraLecture.subject.name,
          subjectCode: extraLecture.subject.code,
          divisionName: extraLecture.division.name,
          date: extraLecture.date.toISOString().split('T')[0],
          startTime: extraLecture.startTime,
          endTime: extraLecture.endTime,
          roomNumber: extraLecture.roomNumber,
          reason: extraLecture.reason,
          status: extraLecture.status,
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Error creating extra lecture request:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to submit extra lecture request' },
      { status: 500 }
    )
  }
}
