import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view fee receipt.' },
        { status: 401 }
      )
    }

    const { transactionId } = await params
    const decodedRef = decodeURIComponent(transactionId)

    // Lookup transaction belonging to the logged-in student
    const transaction = await prisma.feeTransaction.findFirst({
      where: {
        AND: [
          { userId: auth.id },
          {
            OR: [
              { id: decodedRef },
              { transactionRef: decodedRef },
            ],
          },
        ],
      },
      include: {
        user: {
          include: {
            department: true,
            division: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: `Fee transaction "${transactionId}" not found for this account.` },
        { status: 404 }
      )
    }

    const student = transaction.user
    const tuitionAmount = 75000
    const labAmount = 7000
    const libraryAmount = 3000
    const totalAmount = transaction.amount || 85000

    return NextResponse.json({
      success: true,
      receipt: {
        receiptNumber: transaction.transactionRef,
        transactionId: transaction.id,
        transactionDate: transaction.createdAt.toISOString(),
        paymentStatus: transaction.status,
        paymentMode: 'Net Banking / HDFC Gateway',
        academicYear: '2024–25',
        semester: student.division?.semester || 5,
        institution: {
          name: 'Vishwakarma Institute of Information Technology',
          shortName: 'VIIT Pune',
          affiliation: 'An Autonomous Institute Affiliated to Savitribai Phule Pune University',
          address: 'Survey No. 352/1, Kondhwa (Bk), Pune, Maharashtra 411048',
          accreditation: 'NAAC "A++" Grade Accredited • Approved by AICTE',
        },
        student: {
          id: student.id,
          name: student.name,
          prnNumber: student.prnNumber || '22110482',
          email: student.email,
          department: student.department?.name || 'Computer Engineering',
          departmentCode: student.department?.code || 'CE',
          division: student.division?.name || 'TE Div A',
        },
        particulars: [
          {
            item: '1',
            description: 'Tuition & Development Fee (Semester V)',
            amount: tuitionAmount,
          },
          {
            item: '2',
            description: 'Laboratory & Advanced Computing Facility Fee',
            amount: labAmount,
          },
          {
            item: '3',
            description: 'Digital Library & Journal Subscriptions Fee',
            amount: libraryAmount,
          },
        ],
        totalAmount,
        totalAmountFormatted: `₹${totalAmount.toLocaleString('en-IN')}`,
        amountInWords: 'Eighty-Five Thousand Rupees Only',
        remarks: 'Full Semester Fee Cleared. No Outstanding Dues.',
        authorizedSignatory: 'Finance & Accounts Officer, VIIT Pune',
        issuedAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error fetching fee receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching fee receipt.' },
      { status: 500 }
    )
  }
}
