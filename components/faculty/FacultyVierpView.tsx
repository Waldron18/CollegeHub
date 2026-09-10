'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Lock,
  Shield,
  Users,
  CheckCircle2,
  Clock,
  Save,
  Loader2,
  Filter,
  Check,
  X,
  AlertCircle,
  GraduationCap,
  BookOpen,
  BarChart3,
  Search,
} from 'lucide-react'

interface StudentRosterItem {
  id: string
  name: string
  email: string
  prnNumber: string
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

interface CourseItem {
  id: string
  name: string
  code: string
  divisionName: string
}

interface DivisionItem {
  id: string
  name: string
  semester: number
  students: StudentRosterItem[]
}

interface FacultyVierpViewProps {
  initialView?: 'attendance' | 'timetable' | 'courses'
}

export default function FacultyVierpView({ initialView }: FacultyVierpViewProps = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [divisions, setDivisions] = useState<DivisionItem[]>([])
  const [timetable, setTimetable] = useState<TimetableSlotItem[]>([])

  // Attendance Manager State
  const [selectedAttendanceSlotId, setSelectedAttendanceSlotId] = useState<string>('')
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>
  >({})
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable' | 'courses'>(
    initialView === 'timetable' ? 'timetable' : initialView === 'courses' ? 'courses' : 'attendance'
  )
  const [staticTimetable, setStaticTimetable] = useState<any[]>([])
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('Full Week')
  const [loadingTimetable, setLoadingTimetable] = useState(false)

  useEffect(() => {
    if (initialView) {
      setActiveTab(initialView)
    }
  }, [initialView])

  // Load Faculty Courses & Timetable
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const coursesRes = await fetch('/api/faculty/courses')
      if (!coursesRes.ok) throw new Error('Failed to load faculty courses')
      const coursesData = await coursesRes.json()

      setCourses(coursesData.courses || [])
      setDivisions(coursesData.divisions || [])
      setTimetable(coursesData.timetable || [])

      if (coursesData.timetable && coursesData.timetable.length > 0) {
        setSelectedAttendanceSlotId(coursesData.timetable[0].id)
      }

      // Fetch permanent static timetable
      setLoadingTimetable(true)
      try {
        const staticRes = await fetch('/api/timetable/static')
        if (staticRes.ok) {
          const staticData = await staticRes.json()
          setStaticTimetable(staticData.timetable || [])
        }
      } catch (err) {
        console.error('Failed to load static timetable:', err)
      } finally {
        setLoadingTimetable(false)
      }
    } catch (err: any) {
      console.error('Error loading VIERP faculty data:', err)
      setError(err?.message || 'Failed to load roster data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Fetch slot attendance when slot or date changes
  useEffect(() => {
    if (!selectedAttendanceSlotId) return
    const fetchExistingAttendance = async () => {
      try {
        const res = await fetch(
          `/api/faculty/attendance?timetableSlotId=${selectedAttendanceSlotId}&date=${attendanceDate}`
        )
        if (res.ok) {
          const data = await res.json()
          const existingMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
          ;(data.records || []).forEach((r: any) => {
            existingMap[r.studentId] = r.status
          })
          setAttendanceMap(existingMap)
        }
      } catch (err) {
        console.error('Failed to load existing attendance:', err)
      }
    }
    fetchExistingAttendance()
  }, [selectedAttendanceSlotId, attendanceDate])

  // Current slot and division details
  const currentSlotForAttendance = timetable.find(
    (t) => t.id === selectedAttendanceSlotId
  )
  const currentDivisionForAttendance = divisions.find(
    (d) => d.id === currentSlotForAttendance?.divisionId
  )
  const attendanceStudentsList = currentDivisionForAttendance?.students || []

  // Filtered students by search
  const filteredStudents = attendanceStudentsList.filter(
    (st) =>
      st.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (st.prnNumber && st.prnNumber.includes(searchFilter)) ||
      st.email.toLowerCase().includes(searchFilter.toLowerCase())
  )

  // Bulk actions
  const handleBulkAttendance = (status: 'PRESENT' | 'ABSENT') => {
    const nextMap = { ...attendanceMap }
    attendanceStudentsList.forEach((st) => {
      nextMap[st.id] = status
    })
    setAttendanceMap(nextMap)
  }

  // Handle saving attendance to Prisma
  const handleSaveAttendance = async () => {
    if (!selectedAttendanceSlotId || attendanceStudentsList.length === 0) return

    setSavingAttendance(true)
    try {
      const attendanceList = attendanceStudentsList.map((st) => ({
        studentId: st.id,
        status: attendanceMap[st.id] || 'PRESENT',
      }))

      const res = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableSlotId: selectedAttendanceSlotId,
          date: attendanceDate,
          attendanceList,
        }),
      })

      if (res.ok) {
        setAttendanceSuccessMsg('Attendance saved successfully to database!')
        setTimeout(() => setAttendanceSuccessMsg(null), 4000)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save attendance')
      }
    } catch (err) {
      console.error('Error saving attendance:', err)
      alert('Network error while saving attendance')
    } finally {
      setSavingAttendance(false)
    }
  }

  // Stats calculation
  const totalEnrolled = attendanceStudentsList.length
  const presentCount = attendanceStudentsList.filter(
    (s) => (attendanceMap[s.id] || 'PRESENT') === 'PRESENT'
  ).length
  const lateCount = attendanceStudentsList.filter(
    (s) => attendanceMap[s.id] === 'LATE'
  ).length
  const absentCount = attendanceStudentsList.filter(
    (s) => attendanceMap[s.id] === 'ABSENT'
  ).length
  const attendancePercentage =
    totalEnrolled > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalEnrolled) * 100) : 100

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin mb-3" />
        <h3 className="text-sm font-semibold text-[#0F172A]">Loading VIERP Roster Manager...</h3>
        <p className="text-xs text-[#64748B] mt-1">Retrieving division rosters and attendance history</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white border border-[#FECACA] p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#0F172A]">Failed to load VIERP portal</h3>
        <p className="text-xs text-[#64748B] mt-1 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-[#0D9488] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Attendance & Roster Manager</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'timetable'
              ? 'bg-[#0D9488] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Permanent Timetable Matrix (Mon–Fri)</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'timetable' ? 'bg-white text-[#0D9488]' : 'bg-[#ECFDF5] text-[#065F46]'
            }`}
          >
            Fixed
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-[#0D9488] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Assigned Subject Cohorts</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'courses' ? 'bg-white text-[#0D9488]' : 'bg-[#F1F5F9] text-[#64748B]'
            }`}
          >
            {courses.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & ROSTER */}
      {activeTab === 'attendance' && (
        <div className="flex flex-col gap-6">
          {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">{totalEnrolled}</div>
          <span className="text-[11px] text-[#64748B] mt-1 block">
            {currentSlotForAttendance?.divisionName || 'TE Div A'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Present / On-Time</span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#065F46]">{presentCount}</div>
          <span className="text-[11px] text-[#10B981] font-medium mt-1 block">
            {totalEnrolled > 0 ? `${Math.round((presentCount / totalEnrolled) * 100)}% present` : '100%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Late / Absent</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#991B1B]">
            {lateCount} <span className="text-sm font-normal text-[#64748B]">late</span> / {absentCount}{' '}
            <span className="text-sm font-normal text-[#64748B]">absent</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Requiring follow-up</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Session Turnout</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#8B5CF6]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#5B21B6]">{attendancePercentage}%</div>
          <span className="text-[11px] text-[#8B5CF6] font-medium mt-1 block">
            {attendancePercentage >= 75 ? 'Above 75% norm' : 'Below attendance quota'}
          </span>
        </div>
      </div>

      {/* Main Attendance Management Console */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Attendance & Roster Manager
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Select lecture slot and date to mark and commit attendance records
              </span>
            </div>
          </div>

          {/* Controls Bar: Slot Selector, Date Picker, Bulk Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Slot Selector */}
            <select
              value={selectedAttendanceSlotId}
              onChange={(e) => setSelectedAttendanceSlotId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0D9488]"
            >
              {timetable.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.subjectCode} - {slot.subjectName} ({slot.roomNumber})
                </option>
              ))}
            </select>

            {/* Date Input */}
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0D9488]"
            />

            {/* Bulk Actions */}
            <button
              type="button"
              onClick={() => handleBulkAttendance('PRESENT')}
              className="px-2.5 py-1.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] hover:bg-[#CCFBF1] text-xs font-semibold transition-colors"
            >
              Mark All Present
            </button>

            <button
              type="button"
              onClick={() => handleBulkAttendance('ABSENT')}
              className="px-2.5 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] hover:bg-[#FEE2E2] text-xs font-semibold transition-colors"
            >
              Mark All Absent
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={savingAttendance}
              className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              {savingAttendance ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {attendanceSuccessMsg && (
          <div className="flex items-center gap-2 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{attendanceSuccessMsg}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student by name, PRN, or email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#0D9488]"
            />
          </div>

          <div className="text-xs text-[#64748B]">
            Showing <span className="font-semibold text-[#0F172A]">{filteredStudents.length}</span> of{' '}
            {attendanceStudentsList.length} students
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                <th className="py-2.5 px-3 font-semibold">Student Name</th>
                <th className="py-2.5 px-3 font-semibold">PRN Number</th>
                <th className="py-2.5 px-3 font-semibold">Email</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredStudents.map((st) => {
                const currentStatus = attendanceMap[st.id] || 'PRESENT'
                return (
                  <tr key={st.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-[#0F172A] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] flex items-center justify-center font-bold text-[11px]">
                        {st.name.charAt(0)}
                      </div>
                      <span>{st.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#64748B]">
                      {st.prnNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">{st.email}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          currentStatus === 'PRESENT'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : currentStatus === 'LATE'
                            ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                            : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() =>
                            setAttendanceMap((prev) => ({ ...prev, [st.id]: 'PRESENT' }))
                          }
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            currentStatus === 'PRESENT'
                              ? 'bg-white text-[#065F46] shadow-xs'
                              : 'text-[#64748B] hover:text-[#0F172A]'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAttendanceMap((prev) => ({ ...prev, [st.id]: 'LATE' }))
                          }
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            currentStatus === 'LATE'
                              ? 'bg-white text-[#B45309] shadow-xs'
                              : 'text-[#64748B] hover:text-[#0F172A]'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAttendanceMap((prev) => ({ ...prev, [st.id]: 'ABSENT' }))
                          }
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            currentStatus === 'ABSENT'
                              ? 'bg-white text-[#EF4444] shadow-xs'
                              : 'text-[#64748B] hover:text-[#0F172A]'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* TAB 2: PERMANENT SEMESTER TIMETABLE (MON-FRI) */}
      {activeTab === 'timetable' && (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-5">
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
                  Official weekly teaching timetable for Computer Engineering • Read-only for Students & Faculty
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
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]">
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
              <div className="py-12 text-center text-xs text-[#64748B] flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0D9488]" />
                <span>Loading permanent semester timetable...</span>
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
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Division</th>
                    <th className="text-left py-3 px-3 font-semibold text-[#64748B]">Faculty</th>
                    <th className="text-center py-3 px-3 font-semibold text-[#64748B]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {staticTimetable
                    .filter((s) =>
                      selectedTimetableDay === 'Full Week' ? true : s.dayOfWeek === selectedTimetableDay
                    )
                    .map((slot: any, i: number) => (
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
                        <td className="py-3 px-3 text-[#64748B]">{slot.divisionName || 'TE Div A'}</td>
                        <td className="py-3 px-3 text-[#64748B]">{slot.facultyName || 'Prof. Rajesh Kulkarni'}</td>
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

      {/* TAB 3: COURSES & COMPLIANCE */}
      {activeTab === 'courses' && (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Assigned Subject Cohorts & Compliance
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Academic terms taught by Prof. Rajesh Kulkarni in Semester V
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            Dept. of Computer Engineering
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                  {course.code}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  {course.divisionName}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#0F172A]">{course.name}</h4>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                <span>Credits: 4.0</span>
                <span className="font-semibold text-[#0D9488]">68 Enrolled</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
