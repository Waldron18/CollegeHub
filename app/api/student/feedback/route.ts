import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view feedback status.' },
        { status: 401 }
      )
    }

    // Fetch student's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: auth.id },
      include: {
        subject: {
          include: {
            timetableSlots: {
              include: {
                faculty: {
                  select: { name: true },
                },
              },
              take: 1,
            },
          },
        },
      },
    })

    // Fetch existing feedbacks by student
    const existingFeedbacks = await prisma.courseFeedback.findMany({
      where: { studentId: auth.id },
    })

    const feedbackMap = new Map(existingFeedbacks.map((f) => [f.subjectId, f]))

    const subjects = enrollments.map((e) => {
      const fb = feedbackMap.get(e.subjectId)
      return {
        subjectId: e.subject.id,
        subjectName: e.subject.name,
        subjectCode: e.subject.code,
        facultyName: e.subject.timetableSlots[0]?.faculty.name || 'Prof. Rajesh Kulkarni',
        isSubmitted: !!fb,
        feedback: fb
          ? {
              id: fb.id,
              rating: fb.rating,
              feedback: fb.feedback,
              createdAt: fb.createdAt.toISOString(),
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      subjects,
    })
  } catch (error: any) {
    console.error('Error fetching feedback status:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching feedback status.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to submit feedback.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { subjectId, rating, feedback } = body

    if (!subjectId || !rating || !feedback) {
      return NextResponse.json(
        { error: 'Subject ID, rating (1-5), and feedback comments are required.' },
        { status: 400 }
      )
    }

    const numRating = Number(rating)
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 }
      )
    }

    // Check if subject exists (by id or code)
    const subject = await prisma.subject.findFirst({
      where: {
        OR: [{ id: subjectId }, { code: subjectId }],
      },
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found.' },
        { status: 404 }
      )
    }

    // Check if duplicate feedback exists
    const existing = await prisma.courseFeedback.findUnique({
      where: {
        subjectId_studentId: {
          subjectId: subject.id,
          studentId: auth.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Feedback has already been submitted for this course.' },
        { status: 409 }
      )
    }

    // Create feedback
    const newFeedback = await prisma.courseFeedback.create({
      data: {
        subjectId: subject.id,
        studentId: auth.id,
        rating: Math.round(numRating),
        feedback: feedback.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Course feedback recorded successfully.',
      feedback: {
        id: newFeedback.id,
        subjectId: newFeedback.subjectId,
        rating: newFeedback.rating,
        feedback: newFeedback.feedback,
        createdAt: newFeedback.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error submitting course feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error while submitting course feedback.' },
      { status: 500 }
    )
  }
}
