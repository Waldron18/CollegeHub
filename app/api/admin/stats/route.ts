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

    if (auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrative privileges required.' },
        { status: 403 }
      )
    }

    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalSubjects,
      totalDivisions,
      feeAggregate,
      recentUsers,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.department.count(),
      prisma.subject.count(),
      prisma.division.count(),
      prisma.feeTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          prnNumber: true,
          role: true,
          createdAt: true,
          department: { select: { name: true, code: true } },
          division: { select: { name: true } },
        },
      }),
      prisma.feeTransaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              prnNumber: true,
              email: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalSubjects,
        totalDivisions,
        totalFeeRevenue: feeAggregate._sum.amount || 0,
        recentUsers,
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          studentName: tx.user.name,
          prnNumber: tx.user.prnNumber,
          amount: tx.amount,
          status: tx.status,
          ref: tx.transactionRef,
          date: tx.createdAt.toISOString(),
        })),
      },
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching institutional statistics.' },
      { status: 500 }
    )
  }
}
