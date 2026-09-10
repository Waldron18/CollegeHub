import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const DAY_ORDER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, role: true, divisionId: true, departmentId: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let whereClause: any = {}

    if (user.role === 'STUDENT') {
      if (!user.divisionId) {
        return NextResponse.json({ timetable: [], isFixedWeekly: true })
      }
      whereClause = { divisionId: user.divisionId }
    } else if (user.role === 'FACULTY') {
      whereClause = { facultyId: user.id }
    } else if (user.role === 'ADMIN') {
      const { searchParams } = new URL(req.url)
      const divisionId = searchParams.get('divisionId')
      if (divisionId) {
        whereClause = { divisionId }
      }
    }

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause,
      include: {
        subject: {
          select: { id: true, name: true, code: true },
        },
        division: {
          select: { id: true, name: true, semester: true },
        },
        faculty: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    })

    const sortedSlots = [...slots].sort((a, b) => {
      const dayA = DAY_ORDER[a.dayOfWeek] || 99
      const dayB = DAY_ORDER[b.dayOfWeek] || 99
      if (dayA !== dayB) return dayA - dayB
      return a.startTime.localeCompare(b.startTime)
    })

    return NextResponse.json({
      success: true,
      isFixedWeekly: true,
      notice: 'Permanent Semester Timetable • Fixed (Monday–Friday)',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timetable: sortedSlots.map((slot) => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        roomNumber: slot.roomNumber,
        subjectId: slot.subjectId,
        subjectName: slot.subject.name,
        subjectCode: slot.subject.code,
        divisionId: slot.divisionId,
        divisionName: slot.division.name,
        semester: slot.division.semester,
        facultyId: slot.facultyId,
        facultyName: slot.faculty.name,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching static timetable:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch timetable' },
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

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Access denied. Modifications to the permanent semester timetable are restricted strictly to the Registrar / Admin Office.',
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { divisionId, subjectId, facultyId, dayOfWeek, startTime, endTime, roomNumber } = body

    if (!divisionId || !subjectId || !facultyId || !dayOfWeek || !startTime || !endTime || !roomNumber) {
      return NextResponse.json({ error: 'Missing required timetable fields' }, { status: 400 })
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        divisionId,
        subjectId,
        facultyId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
      },
      include: {
        subject: true,
        division: true,
        faculty: true,
      },
    })

    return NextResponse.json({ success: true, slot }, { status: 201 })
  } catch (err: any) {
    console.error('Error creating static timetable slot:', err)
    return NextResponse.json({ error: err?.message || 'Failed to create slot' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Access denied. Modifications to the permanent semester timetable are restricted strictly to the Registrar / Admin Office.',
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { id, dayOfWeek, startTime, endTime, roomNumber, facultyId } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing timetable slot ID' }, { status: 400 })
    }

    const updated = await prisma.timetableSlot.update({
      where: { id },
      data: {
        ...(dayOfWeek ? { dayOfWeek } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
        ...(roomNumber ? { roomNumber } : {}),
        ...(facultyId ? { facultyId } : {}),
      },
      include: {
        subject: true,
        division: true,
        faculty: true,
      },
    })

    return NextResponse.json({ success: true, slot: updated })
  } catch (err: any) {
    console.error('Error updating timetable slot:', err)
    return NextResponse.json({ error: err?.message || 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Access denied. Modifications to the permanent semester timetable are restricted strictly to the Registrar / Admin Office.',
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing timetable slot ID' }, { status: 400 })
    }

    await prisma.timetableSlot.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Timetable slot removed successfully' })
  } catch (err: any) {
    console.error('Error deleting timetable slot:', err)
    return NextResponse.json({ error: err?.message || 'Failed to delete slot' }, { status: 500 })
  }
}
