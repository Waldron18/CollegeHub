import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access course materials.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId')

    let whereClause: any = {}

    if (subjectId) {
      whereClause.subjectId = subjectId
    }

    if (auth.role === 'STUDENT') {
      // Students can only access materials for subjects they are enrolled in
      whereClause.subject = {
        enrollments: {
          some: { studentId: auth.id },
        },
      }
    } else if (auth.role === 'FACULTY') {
      // Faculty see materials they uploaded or for subjects they instruct
      whereClause.OR = [
        { uploadedById: auth.id },
        {
          subject: {
            timetableSlots: {
              some: { facultyId: auth.id },
            },
          },
        },
      ]
    }
    // Admins can see all materials

    const materials = await prisma.courseMaterial.findMany({
      where: whereClause,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      materials: materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl,
        fileType: m.fileType,
        fileSize: m.fileSize || 'N/A',
        subjectId: m.subjectId,
        subjectName: m.subject.name,
        subjectCode: m.subject.code,
        uploadedById: m.uploadedById,
        uploadedByName: m.uploadedBy.name,
        uploadedByRole: m.uploadedBy.role,
        createdAt: m.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Error in course-materials GET:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching course materials.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'FACULTY' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Only instructors and administrators can upload course materials.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, fileUrl, fileType, fileSize, subjectId } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Material title is required.' },
        { status: 400 }
      )
    }

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required.' },
        { status: 400 }
      )
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found.' },
        { status: 404 }
      )
    }

    const material = await prisma.courseMaterial.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        fileUrl: fileUrl || `${title.replace(/\s+/g, '_')}.${fileType === 'PPT' ? 'pptx' : 'pdf'}`,
        fileType: (fileType || 'PDF').toUpperCase(),
        fileSize: fileSize || '3.5 MB',
        subjectId,
        uploadedById: auth.id,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Course material uploaded successfully.',
      material: {
        id: material.id,
        title: material.title,
        description: material.description,
        fileUrl: material.fileUrl,
        fileType: material.fileType,
        fileSize: material.fileSize,
        subjectId: material.subjectId,
        subjectName: material.subject.name,
        subjectCode: material.subject.code,
        uploadedById: material.uploadedById,
        uploadedByName: material.uploadedBy.name,
        createdAt: material.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error in course-materials POST:', error)
    return NextResponse.json(
      { error: 'Internal server error uploading course material.' },
      { status: 500 }
    )
  }
}
