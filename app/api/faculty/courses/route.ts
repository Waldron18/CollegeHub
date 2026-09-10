import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
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

    const faculty = await prisma.user.findUnique({
      where: { id: auth.id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        taughtSlots: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            division: {
              select: {
                id: true,
                name: true,
                semester: true,
                users: {
                  where: { role: 'STUDENT' },
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    prnNumber: true,
                  },
                  orderBy: { prnNumber: 'asc' },
                },
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })

    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty profile not found.' },
        { status: 404 }
      )
    }

    // Extract unique courses
    const courseMap = new Map<string, { id: string; name: string; code: string; divisionName: string }>()
    faculty.taughtSlots.forEach((slot) => {
      if (!courseMap.has(slot.subject.id)) {
        courseMap.set(slot.subject.id, {
          id: slot.subject.id,
          name: slot.subject.name,
          code: slot.subject.code,
          divisionName: slot.division.name,
        })
      }
    })

    // Extract unique divisions and unified roster
    const divisionsMap = new Map<string, { id: string; name: string; semester: number; students: any[] }>()
    faculty.taughtSlots.forEach((slot) => {
      if (!divisionsMap.has(slot.division.id)) {
        divisionsMap.set(slot.division.id, {
          id: slot.division.id,
          name: slot.division.name,
          semester: slot.division.semester,
          students: slot.division.users,
        })
      }
    })

    // Format timetable slots
    const timetable = faculty.taughtSlots.map((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      roomNumber: slot.roomNumber,
      subjectId: slot.subject.id,
      subjectName: slot.subject.name,
      subjectCode: slot.subject.code,
      divisionId: slot.division.id,
      divisionName: slot.division.name,
      studentCount: slot.division.users.length,
    }))

    return NextResponse.json({
      success: true,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department?.name || 'Computer Engineering',
      },
      courses: Array.from(courseMap.values()),
      divisions: Array.from(divisionsMap.values()),
      timetable,
    })
  } catch (error: any) {
    console.error('Error fetching faculty courses:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching courses.' },
      { status: 500 }
    )
  }
}
