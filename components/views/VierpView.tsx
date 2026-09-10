'use client'

import { useState, useEffect } from 'react'
import {
  GraduationCap,
  Clock,
  CreditCard,
  BarChart2,
  Calendar,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Building2,
  Receipt,
  ExternalLink,
  Award,
  Send,
  Sparkles,
  Star,
  X,
  Printer,
  ChevronRight,
  Eye,
  Shield,
  Lock,
} from 'lucide-react'
import type { StudentProfile, FeeStatus, EnrolledSubject } from '@/types/dashboard'

interface VierpViewProps {
  profile?: StudentProfile | null
  feeStatus?: FeeStatus | null
  enrolledSubjects?: EnrolledSubject[]
}

type VierpTab = 'overview' | 'timetable' | 'attendance' | 'fees' | 'registration' | 'marksheets'

interface AttendanceRecordItem {
  id: string
  date: string
  status: string
  roomNumber: string
  startTime: string
  endTime: string
  facultyName: string
}

interface SubjectAttendance {
  subjectId: string
  subjectName: string
  subjectCode: string
  totalSessions: number
  attendedSessions: number
  percentage: number
  records: AttendanceRecordItem[]
}

interface FeedbackSubject {
  subjectId: string
  subjectName: string
  subjectCode: string
  facultyName: string
  isSubmitted: boolean
  feedback?: {
    id: string
    rating: number
    feedback: string
    createdAt: string
  } | null
}

interface ReceiptDetails {
  receiptNumber: string
  transactionId: string
  transactionDate: string
  paymentStatus: string
  paymentMode: string
  academicYear: string
  semester: number
  institution: {
    name: string
    shortName: string
    affiliation: string
    address: string
    accreditation: string
  }
  student: {
    id: string
    name: string
    prnNumber: string
    email: string
    department: string
    departmentCode: string
    division: string
  }
  particulars: Array<{
    item: string
    description: string
    amount: number
  }>
  totalAmount: number
  totalAmountFormatted: string
  amountInWords: string
  remarks: string
  authorizedSignatory: string
  issuedAt: string
}

export default function VierpView({ profile, feeStatus, enrolledSubjects }: VierpViewProps) {
  const [activeTab, setActiveTab] = useState<VierpTab>('overview')

  // Real Database Attendance State
  const [attendanceData, setAttendanceData] = useState<{
    overallPercentage: number
    totalSessions: number
    attendedSessions: number
    subjects: SubjectAttendance[]
  } | null>(null)
  const [selectedAttendanceSub, setSelectedAttendanceSub] = useState<SubjectAttendance | null>(null)

  // Real Database Feedback State
  const [feedbackSubjects, setFeedbackSubjects] = useState<FeedbackSubject[]>([])
  const [feedbackModalSub, setFeedbackModalSub] = useState<FeedbackSubject | null>(null)
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackComment, setFeedbackComment] = useState<string>('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null)

  // Printable Official Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false)
  const [receiptData, setReceiptData] = useState<ReceiptDetails | null>(null)
  const [loadingReceipt, setLoadingReceipt] = useState<boolean>(false)

  const prn = profile?.prnNumber || '22110482'
  const studentName = profile?.name || 'Aditya Sharma'
  const semester = profile?.semester || 5
  const dept = profile?.department || 'Computer Engineering'
  const division = profile?.division || 'A'

  const txnRef = feeStatus?.transactionRef || 'TXN-2024-22110482-SEM5'
  const feeAmount = feeStatus?.amount ? `₹${feeStatus.amount.toLocaleString('en-IN')}` : '₹85,000'
  const isFeePaid = feeStatus?.cleared || feeStatus?.status === 'COMPLETED'

  // Fetch Attendance Records
  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/student/attendance')
      if (res.ok) {
        const data = await res.json()
        setAttendanceData(data)
      }
    } catch (e) {
      console.error('Failed to load attendance:', e)
    }
  }

  // Fetch Feedback Status
  const fetchFeedbackStatus = async () => {
    try {
      const res = await fetch('/api/student/feedback')
      if (res.ok) {
        const data = await res.json()
        setFeedbackSubjects(data.subjects || [])
      }
    } catch (e) {
      console.error('Failed to load feedback status:', e)
    }
  }

  const [weeklyTimetable, setWeeklyTimetable] = useState<any[]>([])
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('Monday')
  const [loadingTimetable, setLoadingTimetable] = useState<boolean>(false)

  // Fetch Permanent Static Weekly Timetable (Monday-Friday)
  const fetchWeeklyTimetable = async () => {
    try {
      setLoadingTimetable(true)
      const res = await fetch('/api/timetable/static')
      if (res.ok) {
        const data = await res.json()
        setWeeklyTimetable(data.timetable || [])
      }
    } catch (e) {
      console.error('Failed to load static weekly timetable:', e)
    } finally {
      setLoadingTimetable(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
    fetchFeedbackStatus()
    fetchWeeklyTimetable()
  }, [])

  // Load and open Official Receipt Viewer
  const handleOpenReceipt = async () => {
    setShowReceiptModal(true)
    try {
      setLoadingReceipt(true)
      const res = await fetch(`/api/student/receipt/${txnRef}`)
      if (res.ok) {
        const data = await res.json()
        setReceiptData(data.receipt)
      }
    } catch (e) {
      console.error('Failed to load receipt:', e)
    } finally {
      setLoadingReceipt(false)
    }
  }

  // Handle Feedback Submission
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackModalSub || isSubmittingFeedback) return

    setIsSubmittingFeedback(true)
    setFeedbackMsg(null)

    try {
      const res = await fetch('/api/student/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: feedbackModalSub.subjectCode,
          rating: feedbackRating,
          feedback: feedbackComment.trim() || 'Outstanding faculty instruction and practical clarity.',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setFeedbackMsg({ text: 'Feedback submitted successfully!' })
      fetchFeedbackStatus()
      setTimeout(() => {
        setFeedbackModalSub(null)
        setFeedbackMsg(null)
        setFeedbackComment('')
        setFeedbackRating(5)
      }, 1200)
    } catch (err: any) {
      setFeedbackMsg({ text: err?.message || 'Submission failed.', isError: true })
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const overallAtt = attendanceData?.overallPercentage || 84

  // Monday timetable from API or fallback
  const mondaySlots =
    enrolledSubjects && enrolledSubjects.length > 0
      ? enrolledSubjects.flatMap((s) =>
          (s.timetableSlots || []).map((slot) => ({
            code: s.code,
            subject: s.name,
            time: `${slot.startTime} – ${slot.endTime}`,
            room: slot.roomNumber,
            faculty: slot.faculty || 'Prof. Rajesh Kulkarni',
          }))
        )
      : [
          {
            code: 'CS501',
            subject: 'Operating Systems',
            time: '09:00 AM – 10:00 AM',
            room: 'Lab 401',
            faculty: 'Prof. Rajesh Kulkarni',
          },
          {
            code: 'CS502',
            subject: 'Database Management Systems',
            time: '10:00 AM – 11:00 AM',
            room: 'Hall 304',
            faculty: 'Prof. Rajesh Kulkarni',
          },
          {
            code: 'CS503',
            subject: 'Computer Networks',
            time: '11:15 AM – 12:15 PM',
            room: 'Hall 201',
            faculty: 'Prof. Rajesh Kulkarni',
          },
        ]

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Academic Profile Summary */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">{studentName}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-semibold">
                PRN: {prn}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              B.Tech {dept} • Semester {semester} • Div {division} • Roll #48
            </p>
          </div>
        </div>

        {/* Quick status pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            onClick={() => setActiveTab('attendance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs cursor-pointer hover:border-[#0D9488] transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[#64748B]">Attendance:</span>
            <span className="font-bold text-[#0F172A]">{overallAtt}%</span>
          </div>

          <div
            onClick={handleOpenReceipt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs cursor-pointer hover:border-[#0D9488] transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="text-[#64748B]">Fees:</span>
            <span className="font-bold text-[#065F46]">Cleared</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <Award className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-[#64748B]">CGPA:</span>
            <span className="font-bold text-[#0F172A]">9.12 / 10</span>
          </div>
        </div>
      </div>

      {/* VIERP Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'ERP Modules' },
          { id: 'timetable', label: 'Timetable Matrix' },
          { id: 'attendance', label: `Attendance (${overallAtt}%)` },
          { id: 'fees', label: 'Fees & Receipts' },
          { id: 'registration', label: 'Subject Registration' },
          { id: 'marksheets', label: 'Marksheets & Feedback' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as VierpTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Overview Modules */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Attendance */}
          <div
            onClick={() => setActiveTab('attendance')}
            className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm hover:border-[#0D9488] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]">
                {overallAtt}% Overall
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#0F172A]">Attendance Tracker</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">Database lecture history drilldowns</p>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#64748B]">
                <span>Operating Systems</span>
                <span className="font-semibold text-[#0F172A]">88%</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>DBMS</span>
                <span className="font-semibold text-[#0F172A]">88%</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Computer Networks</span>
                <span className="font-semibold text-[#0F172A]">75%</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] text-[11px] font-semibold text-[#0D9488] flex items-center justify-between">
              <span>Inspect date records</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Timetable */}
          <div
            onClick={() => setActiveTab('timetable')}
            className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm hover:border-[#0D9488] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]">
                Sem {semester}
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#0F172A]">Timetable Matrix</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">3 Monday live slots seeded</p>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#64748B]">
                <span>09:00 - 10:00</span>
                <span className="font-semibold text-[#0D9488]">Lab 401</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>10:00 - 11:00</span>
                <span className="font-semibold text-[#0D9488]">Hall 304</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>11:15 - 12:15</span>
                <span className="font-semibold text-[#0D9488]">Hall 201</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] text-[11px] font-semibold text-[#0D9488] flex items-center justify-between">
              <span>View full matrix</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Fee Ledger */}
          <div
            onClick={handleOpenReceipt}
            className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm hover:border-[#0D9488] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]">
                {feeStatus?.status || 'COMPLETED'}
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#0F172A]">Fee Ledger & Receipts</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">{txnRef}</p>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#64748B]">
                <span>Amount Paid</span>
                <span className="font-semibold text-[#065F46]">{feeAmount}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Payment Mode</span>
                <span className="font-mono text-[#0F172A]">HDFC NetBank</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Dues Standing</span>
                <span className="font-bold text-[#10B981]">₹0.00 (Nil)</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] text-[11px] font-semibold text-[#0D9488] flex items-center justify-between">
              <span>Print Official Receipt</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 4: Marksheets & CGPA */}
          <div
            onClick={() => setActiveTab('marksheets')}
            className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm hover:border-[#0D9488] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                <BarChart2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[#0D9488] bg-[#F0FDFA] border-[#99F6E4]">
                CGPA 9.12
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#0F172A]">Marksheets & Feedback</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">Faculty course evaluations</p>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#64748B]">
                <span>Operating Systems</span>
                <span className="font-semibold text-[#0F172A]">38 / 50</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>DBMS</span>
                <span className="font-semibold text-[#0F172A]">36 / 50</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Course Feedback</span>
                <span className="font-semibold text-[#0D9488]">
                  {feedbackSubjects.filter((s) => s.isSubmitted).length}/{feedbackSubjects.length} done
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] text-[11px] font-semibold text-[#0D9488] flex items-center justify-between">
              <span>Submit feedback</span>
              <span>→</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Permanent Static Weekly Timetable Matrix */}
      {activeTab === 'timetable' && (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-5">
          {/* Header & Policy Notice */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">Permanent Semester Timetable Matrix</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    <Lock className="w-3 h-3 text-[#10B981]" />
                    Fixed (Mon–Fri)
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Official weekly class timetable for {dept} (Div {division}) • Read-only for Students & Faculty
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                Admin Controlled
              </span>
            </div>
          </div>

          {/* Academic Fixed Notice Banner */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
              <span>
                <strong>Static Schedule Policy:</strong> This weekly schedule is permanent for Semester V. Any date-specific syllabus catch-up sessions or extra lectures appear exclusively in the <strong>VoIP Live Schedule</strong> once approved.
              </span>
            </div>
          </div>

          {/* Day Selection Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3 overflow-x-auto">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Full Week'].map((day) => {
              const isSelected = selectedTimetableDay === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedTimetableDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#0D9488] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Timetable Slots Table */}
          <div className="overflow-x-auto">
            {loadingTimetable ? (
              <div className="py-12 text-center text-xs text-[#64748B] animate-pulse">
                Loading permanent semester timetable...
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {selectedTimetableDay === 'Full Week' && (
                      <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Day</th>
                    )}
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Time Slot</th>
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Course Code</th>
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Subject Name</th>
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Room / Hall</th>
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Faculty</th>
                    <th className="text-center py-3 px-3 font-semibold text-[#64748B]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(weeklyTimetable.length > 0
                    ? weeklyTimetable.filter((s) =>
                        selectedTimetableDay === 'Full Week' ? true : s.dayOfWeek === selectedTimetableDay
                      )
                    : mondaySlots.map((s) => ({
                        dayOfWeek: 'Monday',
                        startTime: s.time.split(' – ')[0],
                        endTime: s.time.split(' – ')[1],
                        subjectCode: s.code,
                        subjectName: s.subject,
                        roomNumber: s.room,
                        facultyName: s.faculty,
                      }))
                  ).map((slot, i) => (
                    <tr key={slot.id || i} className="hover:bg-[#F8FAFC] transition-colors">
                      {selectedTimetableDay === 'Full Week' && (
                        <td className="py-3 px-3 font-semibold text-[#0F172A]">{slot.dayOfWeek}</td>
                      )}
                      <td className="py-3 px-3 font-mono text-[#0F172A] font-medium">
                        {slot.startTime} – {slot.endTime}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0D9488]">
                        {slot.subjectCode}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#0F172A]">{slot.subjectName}</td>
                      <td className="py-3 px-3 text-[#475569]">
                        <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">
                          {slot.roomNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">{slot.facultyName}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Fixed Slot
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Attendance (84% Gauge + Interactive Drilldowns) */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Radial / Progress Gauge */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#0D9488"
                  strokeWidth="10"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * overallAtt) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{overallAtt}%</span>
                <span className="text-[10px] font-semibold text-[#10B981] uppercase">Good Standing</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#0F172A] mt-4">
              Cumulative Attendance (AY 2024-25)
            </h4>
            <p className="text-xs text-[#64748B] mt-1 max-w-xs">
              Requires minimum 75% for exam hall ticket eligibility. Click on any subject card to inspect lecture-by-lecture dates.
            </p>
          </div>

          {/* Subject-Wise Breakdown with Drilldown Triggers */}
          <div className="md:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Subject-Level Attendance Drilldown</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Click any subject below to inspect date timestamps & room entries
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#F0FDFA] text-[#0D9488] px-2.5 py-1 rounded-full border border-[#99F6E4]">
                PostgreSQL Live Records
              </span>
            </div>

            <div className="space-y-3.5">
              {(
                attendanceData?.subjects || [
                  {
                    subjectId: '1',
                    subjectName: 'Operating Systems',
                    subjectCode: 'CS501',
                    totalSessions: 8,
                    attendedSessions: 7,
                    percentage: 88,
                    records: [],
                  },
                  {
                    subjectId: '2',
                    subjectName: 'Database Management Systems',
                    subjectCode: 'CS502',
                    totalSessions: 8,
                    attendedSessions: 7,
                    percentage: 88,
                    records: [],
                  },
                  {
                    subjectId: '3',
                    subjectName: 'Computer Networks',
                    subjectCode: 'CS503',
                    totalSessions: 8,
                    attendedSessions: 6,
                    percentage: 75,
                    records: [],
                  },
                ]
              ).map((subj) => (
                <div
                  key={subj.subjectCode}
                  onClick={() => setSelectedAttendanceSub(subj)}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0D9488] hover:bg-white transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0D9488] transition-colors">
                        {subj.subjectName}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">({subj.subjectCode})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#0D9488]">{subj.percentage}%</span>
                      <span className="text-[10px] text-[#64748B]">
                        ({subj.attendedSessions}/{subj.totalSessions} attended)
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0D9488] h-full rounded-full transition-all duration-500"
                      style={{ width: `${subj.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Fees & Receipts */}
      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Semester V Tuition & Term Fee</h3>
                  <p className="text-xs text-[#64748B]">Academic Year 2024–25 • Full Clearance</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {feeStatus?.status || 'COMPLETED'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Total Paid</span>
                <p className="text-base font-bold text-[#0F172A] mt-0.5">{feeAmount}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Transaction Ref</span>
                <p className="text-xs font-mono font-semibold text-[#0D9488] mt-1 truncate">{txnRef}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Payment Date</span>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">15 Jul 2024</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Outstanding Dues</span>
                <p className="text-base font-bold text-[#10B981] mt-0.5">₹0.00</p>
              </div>
            </div>

            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden mb-5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                    <th className="text-left py-2.5 px-3 font-semibold">Item Description</th>
                    <th className="text-right py-2.5 px-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  <tr>
                    <td className="py-2.5 px-3 text-[#0F172A]">Tuition Fee (Sem V)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">₹75,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-[#0F172A]">Laboratory & Practical Facilities</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">₹7,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-[#0F172A]">Library & Digital Resources Fee</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">₹3,000.00</td>
                  </tr>
                  <tr className="bg-[#F8FAFC] font-bold">
                    <td className="py-2.5 px-3 text-[#0F172A]">Grand Total</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#0D9488]">{feeAmount}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Print Official Receipt Button */}
            <button
              type="button"
              onClick={handleOpenReceipt}
              className="px-4 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Download & Print Official Institutional Receipt</span>
            </button>
          </div>

          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">Finance & Accounts Verification</h4>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Fees for PRN <span className="font-mono font-semibold text-[#0F172A]">{prn}</span> have been digitally verified by the accounts section of Vishwakarma Institute of Technology.
              </p>

              <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#065F46]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="font-semibold">No Pending Dues</span>
                </div>
                <div className="flex items-center gap-2 text-[#065F46]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="font-semibold">Eligible for Exam Registration</span>
                </div>
                <div className="flex items-center gap-2 text-[#065F46]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="font-semibold">Library Access Active</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-[10px] text-[#94A3B8]">
              Automated VIERP Reconciliation • Ref: #{txnRef}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Subject Registration */}
      {activeTab === 'registration' && (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Registered Core Courses (Semester {semester})</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                3 Core Engineering Subjects • 12 Credits Total • Department of {dept}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              Registration Approved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                code: 'CS501',
                name: 'Operating Systems',
                credits: 4,
                faculty: 'Prof. Rajesh Kulkarni',
                type: 'Core / Lab',
                syllabus: 'Processes, Threads, CPU Scheduling, Synchronization, Deadlocks, Memory Management.',
              },
              {
                code: 'CS502',
                name: 'Database Management Systems',
                credits: 4,
                faculty: 'Prof. Rajesh Kulkarni',
                type: 'Core / Theory & Practical',
                syllabus: 'Relational Model, Normalization (1NF-BCNF), B+ Tree Indexing, Transactions, Strict 2PL.',
              },
              {
                code: 'CS503',
                name: 'Computer Networks',
                credits: 4,
                faculty: 'Prof. Rajesh Kulkarni',
                type: 'Core / Theory',
                syllabus: 'OSI & TCP/IP Protocol Stacks, Transport Layer (TCP/UDP), Routing Algorithms, Wireshark.',
              },
            ].map((course) => (
              <div
                key={course.code}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0D9488]">
                      {course.code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{course.name}</h4>
                  <p className="text-[11px] text-[#64748B] mt-1">{course.faculty}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-2 line-clamp-3 leading-relaxed">
                    {course.syllabus}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#10B981]">Enrolled</span>
                  <a
                    href="#syllabus"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(`Downloading curriculum syllabus for ${course.name} (${course.code})...`)
                    }}
                    className="text-[11px] font-semibold text-[#0D9488] hover:text-[#0F766E] flex items-center gap-1"
                  >
                    <span>Syllabus</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Marksheets & Feedback */}
      {activeTab === 'marksheets' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Semester V Internal Assessment Scorecard</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Internal marks declared • External exams scheduled for end of term</p>
              </div>
              <button
                type="button"
                onClick={() => alert(`Generating marksheet PDF for PRN: ${prn}...`)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#0F172A] flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Export Marksheet</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                    <th className="text-left py-2.5 px-3 font-semibold">Course</th>
                    <th className="text-center py-2.5 px-3 font-semibold">Credits</th>
                    <th className="text-center py-2.5 px-3 font-semibold">Internal (50)</th>
                    <th className="text-center py-2.5 px-3 font-semibold">Practical / Lab</th>
                    <th className="text-center py-2.5 px-3 font-semibold">External</th>
                    <th className="text-center py-2.5 px-3 font-semibold">Grade Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {[
                    { code: 'CS501', name: 'Operating Systems', credits: 4, internal: 38, lab: '44/50', ext: 'Pending', grade: 'A+' },
                    { code: 'CS502', name: 'Database Management Systems', credits: 4, internal: 36, lab: '42/50', ext: 'Pending', grade: 'A' },
                    { code: 'CS503', name: 'Computer Networks', credits: 4, internal: 34, lab: '40/50', ext: 'Pending', grade: 'A' },
                  ].map((row) => (
                    <tr key={row.code} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#0F172A]">{row.name}</span>
                        <span className="text-[10px] font-mono text-[#94A3B8] ml-2">{row.code}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{row.credits}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#0D9488]">{row.internal} / 50</td>
                      <td className="py-3 px-3 text-center font-mono text-[#475569]">{row.lab}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          {row.ext}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#0D9488]">{row.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Cumulative CGPA</span>
                  <p className="text-xl font-bold text-[#0F172A]">9.12 <span className="text-xs text-[#94A3B8]">/ 10</span></p>
                </div>
                <div className="h-8 w-px bg-[#E2E8F0]" />
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Division Rank</span>
                  <p className="text-xl font-bold text-[#0D9488]">#3 <span className="text-xs text-[#94A3B8]">/ 64</span></p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#10B981]">
                <TrendingUp className="w-4 h-4" />
                <span>+0.12 improvement over Semester IV</span>
              </div>
            </div>
          </div>

          {/* Database-backed Faculty Feedback Section */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Course & Faculty Feedback Audit</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Submit academic evaluations directly into PostgreSQL for accreditation compliance
                </p>
              </div>
              <span className="text-xs font-mono text-[#0D9488] bg-[#F0FDFA] px-2.5 py-1 rounded-full border border-[#99F6E4]">
                {feedbackSubjects.filter((s) => s.isSubmitted).length} of {feedbackSubjects.length || 3} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                feedbackSubjects.length > 0
                  ? feedbackSubjects
                  : [
                      {
                        subjectId: '1',
                        subjectName: 'Operating Systems',
                        subjectCode: 'CS501',
                        facultyName: 'Prof. Rajesh Kulkarni',
                        isSubmitted: true,
                        feedback: { id: '1', rating: 5, feedback: "Great pacing on Banker's Algorithm", createdAt: '' },
                      },
                      {
                        subjectId: '2',
                        subjectName: 'Database Management Systems',
                        subjectCode: 'CS502',
                        facultyName: 'Prof. Rajesh Kulkarni',
                        isSubmitted: false,
                        feedback: null,
                      },
                      {
                        subjectId: '3',
                        subjectName: 'Computer Networks',
                        subjectCode: 'CS503',
                        facultyName: 'Prof. Rajesh Kulkarni',
                        isSubmitted: false,
                        feedback: null,
                      },
                    ]
              ).map((fb) => (
                <div key={fb.subjectCode} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#0D9488]">{fb.subjectCode}</span>
                      {fb.isSubmitted ? (
                        <span className="text-[10px] font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Submitted
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                          Pending Audit
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{fb.subjectName}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{fb.facultyName}</p>

                    {fb.isSubmitted && fb.feedback && (
                      <div className="mt-3 p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= fb.feedback!.rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#CBD5E1]'}`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-[#475569] italic">&ldquo;{fb.feedback.feedback}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {!fb.isSubmitted && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModalSub(fb)
                        setFeedbackRating(5)
                        setFeedbackComment('')
                        setFeedbackMsg(null)
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#0D9488] text-xs font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Evaluate Course</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ATTENDANCE DRILLDOWN MODAL                                              */}
      {/* ========================================================================= */}
      {selectedAttendanceSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    {selectedAttendanceSub.subjectName} ({selectedAttendanceSub.subjectCode})
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Attendance Standing: {selectedAttendanceSub.percentage}% • {selectedAttendanceSub.attendedSessions} of {selectedAttendanceSub.totalSessions} sessions attended
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttendanceSub(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Lecture-by-Lecture Verification History ({selectedAttendanceSub.records.length} Sessions)
              </span>

              {selectedAttendanceSub.records.length === 0 ? (
                <p className="text-xs text-[#64748B] py-4 text-center">No attendance records found.</p>
              ) : (
                selectedAttendanceSub.records.map((rec) => {
                  const isPresent = rec.status === 'PRESENT'
                  const dateFormatted = new Date(rec.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })

                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isPresent ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                        <div>
                          <div className="text-xs font-semibold text-[#0F172A]">{dateFormatted}</div>
                          <div className="text-[10px] text-[#94A3B8]">
                            {rec.startTime} – {rec.endTime} • {rec.roomNumber} • {rec.facultyName}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isPresent
                            ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                            : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                        }`}
                      >
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAttendanceSub(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COURSE EVALUATION / FEEDBACK MODAL                                      */}
      {/* ========================================================================= */}
      {feedbackModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Submit Course Evaluation</h3>
                <p className="text-[11px] text-[#64748B]">
                  {feedbackModalSub.subjectName} ({feedbackModalSub.subjectCode})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalSub(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4">
              {feedbackMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    feedbackMsg.isError
                      ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                      : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Overall Teaching & Lab Instruction Rating
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 text-[#F59E0B] hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= feedbackRating ? 'fill-[#F59E0B]' : 'text-[#CBD5E1]'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[#0F172A] ml-2">
                    {feedbackRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Constructive Comments & Suggestions
                </label>
                <textarea
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share details regarding curriculum delivery, lab exercises, and faculty guidance..."
                  className="w-full p-3 rounded-lg border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalSub(null)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingFeedback ? 'Recording...' : 'Submit Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HIGH-FIDELITY PRINTABLE OFFICIAL INSTITUTIONAL FEE RECEIPT PREVIEW      */}
      {/* ========================================================================= */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8">
            {/* Modal Controls Top Bar (Hidden when printing) */}
            <div className="px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0D9488]" />
                <span className="text-xs font-bold text-[#0F172A]">Official Institutional Receipt Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div className="p-8 md:p-10 bg-white text-[#0F172A] relative font-sans print:p-0">
              {/* Watermark Seal */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="w-96 h-96 rounded-full border-8 border-[#0D9488] flex items-center justify-center font-bold text-6xl tracking-widest text-[#0D9488] transform -rotate-45">
                  VIIT CLEARED
                </div>
              </div>

              {/* Institution Letterhead */}
              <div className="border-b-2 border-[#0F172A] pb-4 mb-6 text-center">
                <h1 className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-[#0F172A]">
                  Vishwakarma Institute of Information Technology
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  An Autonomous Institute Affiliated to Savitribai Phule Pune University
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Survey No. 352/1, Kondhwa (Bk), Pune 411048 • NAAC &ldquo;A++&rdquo; Grade Accredited
                </p>
                <div className="inline-block mt-3 px-3 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold uppercase tracking-widest">
                  Official Academic Fee Receipt (AY 2024–25)
                </div>
              </div>

              {/* Receipt Header Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Receipt Ref No.</span>
                  <span className="font-mono font-bold text-sm text-[#0F172A]">{txnRef}</span>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block mt-2">Payment Date</span>
                  <span className="font-semibold text-[#0F172A]">15 July 2024, 10:30 AM IST</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Student PRN</span>
                  <span className="font-mono font-bold text-sm text-[#0D9488]">{prn}</span>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block mt-2">Program & Sem</span>
                  <span className="font-semibold text-[#0F172A]">B.Tech in {dept} • Sem {semester}</span>
                </div>
              </div>

              {/* Student Details Section */}
              <div className="text-xs mb-6">
                <div className="grid grid-cols-2 gap-2 border-b border-[#E2E8F0] pb-2">
                  <div>
                    <span className="text-[#64748B]">Student Full Name:</span>{' '}
                    <span className="font-bold text-[#0F172A]">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Academic Division:</span>{' '}
                    <span className="font-semibold text-[#0F172A]">Division {division} (TE Div A)</span>
                  </div>
                </div>
              </div>

              {/* Particulars Table */}
              <table className="w-full text-xs mb-6 border border-[#E2E8F0]">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0] text-[#0F172A]">
                    <th className="py-2 px-3 text-left w-12">#</th>
                    <th className="py-2 px-3 text-left">Fee Particulars</th>
                    <th className="py-2 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="py-2 px-3 text-center font-mono">1</td>
                    <td className="py-2 px-3">Tuition & Development Fee (Semester V)</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">₹75,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-center font-mono">2</td>
                    <td className="py-2 px-3">Laboratory & Advanced Practical Facility Fee</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">₹7,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-center font-mono">3</td>
                    <td className="py-2 px-3">Digital Library & Journal Subscriptions Fee</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">₹3,000.00</td>
                  </tr>
                  <tr className="bg-[#F8FAFC] font-bold text-sm">
                    <td colSpan={2} className="py-3 px-3 text-right">Total Fee Cleared:</td>
                    <td className="py-3 px-3 text-right font-mono text-[#0D9488]">₹85,000.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Amount in words & status */}
              <div className="text-xs mb-8 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Amount in Words</span>
                  <span className="font-semibold italic text-[#0F172A]">Eighty-Five Thousand Rupees Only</span>
                  <span className="text-[10px] text-[#065F46] font-semibold block mt-1">
                    ✓ Status: Verified & Cleared (Net Banking)
                  </span>
                </div>
                <div className="text-right">
                  <div className="w-32 h-10 border-b border-dashed border-[#94A3B8] mb-1 ml-auto" />
                  <span className="text-[10px] text-[#475569] font-medium block">Finance & Accounts Section</span>
                  <span className="text-[9px] text-[#94A3B8] font-mono">VIIT Pune Administration</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-[9px] text-[#94A3B8] border-t border-[#E2E8F0] pt-3 flex justify-between items-center">
                <span>Computer generated institutional document. No physical signature required.</span>
                <span>Ref: #{txnRef} • Timestamp: 2024-07-15 10:30 IST</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
