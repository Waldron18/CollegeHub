import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view attendance records.' },
        { status: 401 }
      )
    }

    // Fetch student's attendance records with slot and subject info
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: auth.id },
      include: {
        timetableSlot: {
          include: {
            subject: true,
            faculty: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Group records by subject
    const subjectMap: Record<
      string,
      {
        subjectId: string
        subjectName: string
        subjectCode: string
        totalSessions: number
        attendedSessions: number
        percentage: number
        records: Array<{
          id: string
          date: string
          status: string
          roomNumber: string
          startTime: string
          endTime: string
          facultyName: string
        }>
      }
    > = {}

    let totalAttended = 0

    for (const r of records) {
      const sub = r.timetableSlot.subject
      if (!subjectMap[sub.id]) {
        subjectMap[sub.id] = {
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          totalSessions: 0,
          attendedSessions: 0,
          percentage: 0,
          records: [],
        }
      }

      subjectMap[sub.id].totalSessions += 1
      if (r.status === 'PRESENT') {
        subjectMap[sub.id].attendedSessions += 1
        totalAttended += 1
      }

      subjectMap[sub.id].records.push({
        id: r.id,
        date: r.date.toISOString(),
        status: r.status,
        roomNumber: r.timetableSlot.roomNumber,
        startTime: r.timetableSlot.startTime,
        endTime: r.timetableSlot.endTime,
        facultyName: r.timetableSlot.faculty.name,
      })
    }

    const subjects = Object.values(subjectMap).map((sub) => ({
      ...sub,
      percentage:
        sub.totalSessions > 0
          ? Math.round((sub.attendedSessions / sub.totalSessions) * 100)
          : 0,
    }))

    const totalRecords = records.length
    const overallPercentage =
      totalRecords > 0 ? Math.round((totalAttended / totalRecords) * 100) : 0

    return NextResponse.json({
      success: true,
      overallPercentage,
      totalSessions: totalRecords,
      attendedSessions: totalAttended,
      subjects,
    })
  } catch (error: any) {
    console.error('Error fetching student attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching attendance.' },
      { status: 500 }
    )
  }
}
