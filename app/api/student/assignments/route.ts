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

    const assignments = await prisma.assignment.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        submissions: {
          where: {
            studentId: auth.id,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    const data = assignments.map((asg) => {
      const userSub = asg.submissions[0] || null
      return {
        id: asg.id,
        title: asg.title,
        description: asg.description,
        subjectId: asg.subject.id,
        subjectName: asg.subject.name,
        subjectCode: asg.subject.code,
        dueDate: asg.dueDate.toISOString(),
        isSubmitted: !!userSub,
        submission: userSub
          ? {
              id: userSub.id,
              submittedAt: userSub.submittedAt.toISOString(),
              fileUrl: userSub.fileUrl,
              grade: userSub.grade,
              feedback: userSub.feedback,
              feedbackDate: userSub.feedbackDate ? userSub.feedbackDate.toISOString() : null,
            }
          : null,
      }
    })

    return NextResponse.json({ assignments: data })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching assignments' },
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

    const body = await request.json()
    const { assignmentId, fileUrl, notes } = body

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Upsert submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: auth.id,
        },
      },
      update: {
        fileUrl: fileUrl || `submission_${Date.now()}.pdf`,
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId: auth.id,
        fileUrl: fileUrl || `submission_${Date.now()}.pdf`,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        submittedAt: submission.submittedAt.toISOString(),
        fileUrl: submission.fileUrl,
        grade: submission.grade,
        feedback: submission.feedback,
        feedbackDate: submission.feedbackDate ? submission.feedbackDate.toISOString() : null,
      },
    })
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error submitting assignment' },
      { status: 500 }
    )
  }
}
