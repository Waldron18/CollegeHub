import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 })
    }

    const requests = await prisma.extraLecture.findMany({
      include: {
        subject: { select: { id: true, name: true, code: true } },
        division: { select: { id: true, name: true, semester: true } },
        faculty: { select: { id: true, name: true, email: true } },
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
        facultyId: r.facultyId,
        facultyName: r.faculty.name,
        facultyEmail: r.faculty.email,
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
    console.error('Error fetching admin extra lecture requests:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch extra lecture requests' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 })
    }

    const body = await req.json()
    const { requestId, status } = body

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Missing requestId or status' }, { status: 400 })
    }

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Invalid status. Must be APPROVED or REJECTED' }, { status: 400 })
    }

    const updated = await prisma.extraLecture.update({
      where: { id: requestId },
      data: { status },
      include: {
        subject: true,
        division: true,
        faculty: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Extra lecture request successfully ${status.toLowerCase()}`,
      request: {
        id: updated.id,
        subjectCode: updated.subject.code,
        subjectName: updated.subject.name,
        date: updated.date.toISOString().split('T')[0],
        status: updated.status,
      },
    })
  } catch (err: any) {
    console.error('Error updating extra lecture status:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to update extra lecture request' },
      { status: 500 }
    )
  }
}
