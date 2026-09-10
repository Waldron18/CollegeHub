import { NextRequest, NextResponse } from 'next/server'
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

    // Get subjects taught by faculty
    const slots = await prisma.timetableSlot.findMany({
      where: { facultyId: auth.id },
      select: { subjectId: true },
    })
    const subjectIds = Array.from(new Set(slots.map((s) => s.subjectId)))

    const assignments = await prisma.assignment.findMany({
      where: {
        subjectId: { in: subjectIds },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        submissions: {
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
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    const formatted = assignments.map((asg) => ({
      id: asg.id,
      title: asg.title,
      description: asg.description,
      subjectId: asg.subject.id,
      subjectName: asg.subject.name,
      subjectCode: asg.subject.code,
      dueDate: asg.dueDate.toISOString(),
      submissionsCount: asg.submissions.length,
      gradedCount: asg.submissions.filter((s) => !!s.grade).length,
      submissions: asg.submissions.map((sub) => ({
        id: sub.id,
        assignmentId: sub.assignmentId,
        studentId: sub.student.id,
        studentName: sub.student.name,
        prnNumber: sub.student.prnNumber,
        email: sub.student.email,
        submittedAt: sub.submittedAt.toISOString(),
        fileUrl: sub.fileUrl,
        grade: sub.grade,
        feedback: sub.feedback,
        feedbackDate: sub.feedbackDate ? sub.feedbackDate.toISOString() : null,
      })),
    }))

    return NextResponse.json({
      success: true,
      assignments: formatted,
    })
  } catch (error: any) {
    console.error('Error fetching faculty assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching assignments.' },
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
    const { subjectId, title, description, dueDate } = body

    if (!subjectId || !title || !dueDate) {
      return NextResponse.json(
        { error: 'subjectId, title, and dueDate are required.' },
        { status: 400 }
      )
    }

    const assignment = await prisma.assignment.create({
      data: {
        subjectId,
        title: title.trim(),
        description: description ? description.trim() : null,
        dueDate: new Date(dueDate),
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully.',
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subjectId: assignment.subject.id,
        subjectName: assignment.subject.name,
        subjectCode: assignment.subject.code,
        dueDate: assignment.dueDate.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error creating assignment.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
    const { submissionId, grade, feedback } = body

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId is required.' },
        { status: 400 }
      )
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: grade ? String(grade).trim() : null,
        feedback: feedback ? String(feedback).trim() : null,
        feedbackDate: grade || feedback ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Grade and feedback recorded successfully.',
      submission: {
        id: updated.id,
        assignmentId: updated.assignmentId,
        studentId: updated.studentId,
        grade: updated.grade,
        feedback: updated.feedback,
        feedbackDate: updated.feedbackDate ? updated.feedbackDate.toISOString() : null,
      },
    })
  } catch (error: any) {
    console.error('Error grading assignment submission:', error)
    return NextResponse.json(
      { error: 'Internal server error recording grade.' },
      { status: 500 }
    )
  }
}
