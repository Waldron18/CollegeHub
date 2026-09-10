'use client'

import { useState, useEffect } from 'react'
import {
  Video,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import type { ActiveView } from '@/components/Sidebar'
import type { StudentProfile } from '@/types/dashboard'
import DepartmentNoticesCard from '@/components/common/DepartmentNoticesCard'

interface FacultyHomeOverviewProps {
  onNavigate: (view: ActiveView, subTab?: string, slotId?: string) => void
  profile?: StudentProfile | null
}

interface TimetableSlotItem {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  roomNumber: string
  subjectId: string
  subjectName: string
  subjectCode: string
  divisionId: string
  divisionName: string
  studentCount: number
}

interface DailyScheduleSlot {
  id: string
  subjectId: string
  subjectName: string
  subjectCode: string
  divisionId: string
  divisionName: string
  facultyId: string
  facultyName: string
  dayOfWeek: string
  startTime: string
  endTime: string
  roomNumber: string
  topic?: string
  isExtra?: boolean
  reason?: string | null
}

interface CourseItem {
  id: string
  name: string
  code: string
  divisionName: string
}

interface FacultyAssignmentItem {
  id: string
  title: string
  subjectName: string
  subjectCode: string
  dueDate: string
  submissionsCount: number
  gradedCount: number
  submissions: Array<{
    id: string
    studentName: string
    prnNumber: string
    submittedAt: string
    grade: string | null
  }>
}

export default function FacultyHomeOverview({ onNavigate, profile }: FacultyHomeOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [timetable, setTimetable] = useState<TimetableSlotItem[]>([])
  const [dailySchedule, setDailySchedule] = useState<DailyScheduleSlot[]>([])
  const [assignments, setAssignments] = useState<FacultyAssignmentItem[]>([])
  const [currentDayName, setCurrentDayName] = useState<string>('Wednesday')
  const [headerDateStr, setHeaderDateStr] = useState<string>('Wednesday, 9 Sept')

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true)

        // Derive active day & date matching Header.tsx ("Wednesday, 9 Sept")
        const now = new Date()
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const activeDay = days[now.getDay()]
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const activeDate = `${yyyy}-${mm}-${dd}`

        const dateFormatted = now.toLocaleDateString('en-IN', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
        setHeaderDateStr(dateFormatted)
        setCurrentDayName(activeDay)

        const [coursesRes, asgRes, scheduleRes] = await Promise.all([
          fetch('/api/faculty/courses'),
          fetch('/api/faculty/assignments'),
          fetch(`/api/voip/schedule?day=${activeDay}&date=${activeDate}`),
        ])

        if (coursesRes.ok) {
          const cData = await coursesRes.json()
          setCourses(cData.courses || [])
          setTimetable(cData.timetable || [])
        }

        if (asgRes.ok) {
          const aData = await asgRes.json()
          setAssignments(aData.assignments || [])
        }

        if (scheduleRes.ok) {
          const sData = await scheduleRes.json()
          if (sData.success && Array.isArray(sData.schedule)) {
            setDailySchedule(sData.schedule)
            if (sData.day) setCurrentDayName(sData.day)
          }
        }
      } catch (err) {
        console.error('Failed to load faculty home overview:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOverviewData()
  }, [])

  // Derived metrics
  const totalStudents = 68
  const pendingGradingCount = assignments.reduce(
    (acc, cur) => acc + (cur.submissionsCount - cur.gradedCount),
    0
  )
  const activeSlot = dailySchedule.length > 0 ? dailySchedule[0] : null

  // Pending submissions list across all assignments
  const pendingSubmissions = assignments
    .flatMap((asg) =>
      asg.submissions
        .filter((s) => !s.grade)
        .map((s) => ({
          ...s,
          assignmentTitle: asg.title,
          subjectCode: asg.subjectCode,
        }))
    )
    .slice(0, 4)

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin mb-3" />
        <h3 className="text-sm font-semibold text-[#0F172A]">Loading Faculty Overview...</h3>
        <p className="text-xs text-[#64748B] mt-1">Gathering lecture schedules and academic pending items</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-[#334155] p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/40 text-[#2DD4BF] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Faculty Workspace • Academic Session 2026-27</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, {profile?.name || 'Prof. Rajesh Kulkarni'}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-xl">
              Associate Professor & Division Mentor • Dept. of Computer Engineering • TE Division A
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('voip')}
              className="px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Video className="w-4 h-4" />
              <span>Launch Live Lecture</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('vierp')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Courses Taught */}
        <div
          onClick={() => onNavigate('voip')}
          className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0D9488] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Assigned Courses</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">{courses.length} Courses</div>
          <span className="text-[11px] text-[#0D9488] font-medium mt-1 flex items-center gap-1">
            OS • DBMS • CN <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        {/* Total Enrolled Students */}
        <div
          onClick={() => onNavigate('vierp')}
          className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0D9488] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">{totalStudents} Students</div>
          <span className="text-[11px] text-[#64748B] mt-1 block">
            TE Computer Eng • Div A
          </span>
        </div>

        {/* Pending Grading */}
        <div
          onClick={() => onNavigate('voip', 'grading')}
          className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#F59E0B] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Pending Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#B45309]">
            {pendingGradingCount} Pending
          </div>
          <span className="text-[11px] text-[#B45309] font-medium mt-1 flex items-center gap-1">
            Needs Review in VoIP <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        {/* Today's Lectures */}
        <div
          onClick={() => onNavigate('voip', 'lecture-hub', activeSlot?.id)}
          className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0D9488] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Scheduled Today</span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#065F46]">
            {dailySchedule.length} {dailySchedule.length === 1 ? 'Session' : 'Sessions'}
          </div>
          <span className="text-[11px] text-[#10B981] font-medium mt-1 block">
            {activeSlot ? `Next: ${activeSlot.startTime} (${activeSlot.roomNumber})` : 'No sessions today'}
          </span>
        </div>
      </div>

      {/* Hero Quick Lecture Launcher */}
      {activeSlot ? (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 border border-[#0D9488]/20 flex items-center justify-center text-[#0D9488] flex-shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0D9488]/15 text-[#0D9488]">
                    {activeSlot.subjectCode}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    {activeSlot.divisionName}
                  </span>
                  {activeSlot.isExtra && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Extra Session
                    </span>
                  )}
                  <span className="text-xs text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                    {activeSlot.startTime} – {activeSlot.endTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">{activeSlot.subjectName}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Location: {activeSlot.roomNumber} • {activeSlot.divisionName} (68 Registered Students) • Live Video & Screen Share Ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('voip', 'lecture-hub', activeSlot?.id)}
                className="px-4 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
              >
                <Video className="w-4 h-4" />
                <span>Launch Classroom Stage</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('vierp', 'attendance')}
                className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Take Attendance</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">No Live Lectures Scheduled for Today</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {headerDateStr ? `There are no sessions scheduled for ${headerDateStr}.` : 'No sessions scheduled for today.'} You can review assignments or inspect the full timetable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('vierp', 'timetable')}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <span>View Permanent Timetable</span>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
      )}

      {/* Today's Teaching Schedule */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                <span>{currentDayName ? `${currentDayName} Teaching Schedule` : "Today's Teaching Schedule"}</span>
                {headerDateStr && (
                  <span className="text-xs font-normal text-[#64748B]">
                    • {headerDateStr}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Live scheduled sessions for today • Click any slot to launch classroom stage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-[#F1F5F9] text-[#475569] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
              TE Div A
            </span>
            <button
              onClick={() => onNavigate('vierp', 'timetable')}
              className="text-[11px] text-[#0D9488] hover:text-[#0F766E] font-medium flex items-center gap-1 hover:underline ml-2"
            >
              Full Timetable
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {dailySchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailySchedule.map((slot) => (
              <div
                key={slot.id}
                onClick={() => onNavigate('voip', 'lecture-hub', slot.id)}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0D9488] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                      {slot.subjectCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {slot.isExtra && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Extra
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        {slot.divisionName}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#0D9488] transition-colors truncate">
                    {slot.subjectName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-2">
                    <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="font-mono font-medium">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#475569] flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                  <span className="font-medium text-[#0D9488]">{slot.roomNumber}</span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate('voip', 'lecture-hub', slot.id)
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#0D9488] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span>Start Live Lecture</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#0F172A]">No lectures scheduled for today</h4>
            <p className="text-[11px] text-[#64748B] mt-1 max-w-sm">
              There are no teaching slots scheduled for {headerDateStr || 'today'}. You can inspect the permanent weekly schedule in VIERP.
            </p>
            <button
              onClick={() => onNavigate('vierp', 'timetable')}
              className="mt-3.5 px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View Full Weekly Schedule in VIERP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Two Column Grid: Pending Submissions & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Recent Submissions Awaiting Grading
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('voip', 'grading')}
                className="text-xs text-[#0D9488] hover:underline font-semibold flex items-center gap-1"
              >
                <span>View all ({pendingGradingCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748B]">
                <CheckCircle2 className="w-6 h-6 text-[#10B981] mx-auto mb-1.5" />
                <span>All current submissions have been graded!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {sub.studentName}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {sub.prnNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B] block mt-0.5">
                        {sub.subjectCode} • {sub.assignmentTitle}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('voip', 'grading')}
                      className="px-2.5 py-1 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold transition-colors"
                    >
                      Grade
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('voip', 'grading')}
              className="text-xs text-[#0D9488] font-medium hover:underline"
            >
              Open Assignment Manager in VoIP →
            </button>
          </div>
        </div>

        {/* Quick Communication & Class Cohorts */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Student Inquiries & Division Channels
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="text-xs text-[#0D9488] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Open Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => onNavigate('chat')}
                className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0D9488] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    #te-comp-div-a (Official Cohort)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  68 Division A students • Broadcast lab notes & deadline updates
                </p>
              </div>

              <div
                onClick={() => onNavigate('chat')}
                className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0D9488] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Direct Student Inquiries (DMs)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Aditya Sharma & classmates have ongoing academic clarification threads
                </p>
              </div>

              <div
                onClick={() => onNavigate('voip')}
                className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0D9488] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Course Materials & Resources Hub
                  </span>
                  <FolderOpen className="w-3.5 h-3.5 text-[#0D9488]" />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Upload lecture slides, PDF syllabi, and lab sheets directly to VoIP
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="text-xs text-[#0D9488] font-medium hover:underline"
            >
              Go to Chat Module →
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Department Notices & Circulars */}
      <DepartmentNoticesCard userRole="FACULTY" />
    </div>
  )
}
