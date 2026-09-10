import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access student dashboard.' },
        { status: 401 }
      )
    }

    const student = await prisma.user.findUnique({
      where: { id: auth.id },
      include: {
        department: {
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
          },
        },
        feeTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        enrollments: {
          include: {
            subject: {
              include: {
                timetableSlots: {
                  where: {
                    dayOfWeek: 'Monday',
                  },
                  include: {
                    faculty: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found. Please run seed.' },
        { status: 404 }
      )
    }

    const latestFee = student.feeTransactions[0]

    return NextResponse.json({
      success: true,
      profile: {
        id: student.id,
        name: student.name,
        email: student.email,
        prnNumber: student.prnNumber,
        role: student.role,
        department: student.department?.name ?? 'N/A',
        departmentCode: student.department?.code ?? 'N/A',
        division: student.division?.name ?? 'N/A',
        semester: student.division?.semester ?? null,
      },
      feeStatus: {
        status: latestFee?.status ?? 'NO_RECORD',
        amount: latestFee?.amount ?? 0,
        transactionRef: latestFee?.transactionRef ?? null,
        cleared: latestFee?.status === 'COMPLETED',
      },
      enrolledSubjects: student.enrollments.map((enrollment) => ({
        id: enrollment.subject.id,
        name: enrollment.subject.name,
        code: enrollment.subject.code,
        timetableSlots: (enrollment.subject.timetableSlots || []).map((slot) => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: slot.roomNumber,
          faculty: slot.faculty?.name || 'Faculty Instructor',
        })),
      })),
    })
  } catch (error: any) {
    console.error('Failed to fetch student dashboard data:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
