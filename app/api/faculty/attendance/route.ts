import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { AttendanceStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser()

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'FACULTY') {
      return NextResponse.json(
        { error: 'Access denied. Faculty privileges required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timetableSlotId = searchParams.get('timetableSlotId')
    const dateParam = searchParams.get('date')

    if (!timetableSlotId) {
      return NextResponse.json(
        { error: 'timetableSlotId query parameter is required.' },
        { status: 400 }
      )
    }

    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const records = await prisma.attendanceRecord.findMany({
      where: {
        timetableSlotId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            prnNumber: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      records: records.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.student.name,
        prnNumber: r.student.prnNumber,
        status: r.status,
        date: r.date.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching attendance.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser()

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'FACULTY') {
      return NextResponse.json(
        { error: 'Access denied. Faculty privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { timetableSlotId, date, attendanceList } = body

    if (!timetableSlotId || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload. timetableSlotId and non-empty attendanceList are required.' },
        { status: 400 }
      )
    }

    // Verify slot belongs to faculty
    const slot = await prisma.timetableSlot.findFirst({
      where: {
        id: timetableSlotId,
        facultyId: auth.id,
      },
    })

    if (!slot) {
      return NextResponse.json(
        { error: 'Timetable slot not found or not assigned to this faculty.' },
        { status: 404 }
      )
    }

    const recordDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(recordDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(recordDate)
    endOfDay.setHours(23, 59, 59, 999)

    const updatedRecords = []

    for (const item of attendanceList) {
      const { studentId, status } = item
      if (!studentId || !status) continue

      const validStatus = status as AttendanceStatus

      // Check existing record for that student on that slot & date
      const existing = await prisma.attendanceRecord.findFirst({
        where: {
          studentId,
          timetableSlotId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      if (existing) {
        const updated = await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            status: validStatus,
            date: recordDate,
          },
        })
        updatedRecords.push(updated)
      } else {
        const created = await prisma.attendanceRecord.create({
          data: {
            studentId,
            timetableSlotId,
            status: validStatus,
            date: recordDate,
            durationMinutes: 60,
          },
        })
        updatedRecords.push(created)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated attendance for ${updatedRecords.length} students.`,
      count: updatedRecords.length,
    })
  } catch (error: any) {
    console.error('Error recording faculty attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error saving attendance.' },
      { status: 500 }
    )
  }
}
