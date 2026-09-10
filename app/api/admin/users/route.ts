import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser()

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrative privileges required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get('role')
    const search = searchParams.get('search')?.trim().toLowerCase()
    const departmentId = searchParams.get('departmentId')

    const where: any = {}

    if (roleParam && roleParam !== 'ALL') {
      where.role = roleParam as Role
    }

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { prnNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, departments, divisions] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          prnNumber: true,
          role: true,
          createdAt: true,
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
          enrollments: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.department.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
      }),
      prisma.division.findMany({
        select: { id: true, name: true, semester: true, departmentId: true },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        prnNumber: u.prnNumber,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        department: u.department?.name || 'Unassigned',
        departmentCode: u.department?.code || 'N/A',
        departmentId: u.department?.id || null,
        division: u.division?.name || 'Unassigned',
        divisionId: u.division?.id || null,
        enrolledCount: u.enrollments.length,
      })),
      departments,
      divisions,
    })
  } catch (error: any) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching user directory.' },
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

    if (auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrative privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, prnNumber, role, departmentId, divisionId, password } = body

    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Name, email, role, and password are required.' },
        { status: 400 }
      )
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 409 }
      )
    }

    // Check duplicate PRN if provided
    if (prnNumber) {
      const existingPrn = await prisma.user.findUnique({
        where: { prnNumber: prnNumber.trim() },
      })
      if (existingPrn) {
        return NextResponse.json(
          { error: 'A user with this PRN / Employee ID already exists.' },
          { status: 409 }
        )
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const userRole = (role as Role) || Role.STUDENT

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        prnNumber: prnNumber ? prnNumber.trim() : null,
        passwordHash,
        role: userRole,
        departmentId: departmentId || null,
        divisionId: divisionId || null,
      },
      include: {
        department: true,
        division: true,
      },
    })

    // If new student has a department, auto-enroll into core subjects
    let enrolledSubjectsCount = 0
    if (userRole === Role.STUDENT && departmentId) {
      const coreSubjects = await prisma.subject.findMany({
        where: { departmentId },
      })

      for (const subj of coreSubjects) {
        await prisma.enrollment.upsert({
          where: {
            studentId_subjectId: {
              studentId: newUser.id,
              subjectId: subj.id,
            },
          },
          update: {},
          create: {
            studentId: newUser.id,
            subjectId: subj.id,
          },
        })
        enrolledSubjectsCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${newUser.name} provisioned successfully (${newUser.role}).`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        prnNumber: newUser.prnNumber,
        role: newUser.role,
        department: newUser.department?.name || null,
        division: newUser.division?.name || null,
        enrolledSubjectsCount,
      },
    })
  } catch (error: any) {
    console.error('Error provisioning user:', error)
    return NextResponse.json(
      { error: 'Internal server error provisioning user.' },
      { status: 500 }
    )
  }
}
