import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const { materialId } = await params
    const material = await prisma.courseMaterial.findUnique({
      where: { id: materialId },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Course material not found.' },
        { status: 404 }
      )
    }

    // Only material owner or ADMIN can delete
    if (material.uploadedById !== auth.id && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to delete this course material.' },
        { status: 403 }
      )
    }

    await prisma.courseMaterial.delete({
      where: { id: materialId },
    })

    return NextResponse.json({
      success: true,
      message: 'Course material deleted successfully.',
    })
  } catch (error: any) {
    console.error('Error in course-materials DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error deleting course material.' },
      { status: 500 }
    )
  }
}
