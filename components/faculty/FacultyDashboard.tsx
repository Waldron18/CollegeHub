'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  PhoneCall,
  ScreenShare,
  Users,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  UploadCloud,
  FileCheck,
  Sparkles,
  Volume2,
  Maximize2,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Send,
  X,
  Plus,
  Edit3,
  Save,
  Check,
  FileText,
  Loader2,
  VolumeX,
  Share2,
  Filter,
  GraduationCap,
  Download,
  Search,
  FolderOpen,
  Trash2,
  ExternalLink,
} from 'lucide-react'

export type FacultyTab = 'lecture' | 'attendance' | 'assignments' | 'materials'

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

interface AssignmentSubmissionItem {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  prnNumber: string
  email: string
  submittedAt: string
  fileUrl: string | null
  grade: string | null
}

interface FacultyAssignmentItem {
  id: string
  title: string
  description: string | null
  subjectId: string
  subjectName: string
  subjectCode: string
  dueDate: string
  submissionsCount: number
  gradedCount: number
  submissions: AssignmentSubmissionItem[]
}

interface FacultyMaterialItem {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileType: string // "PDF" | "PPT" | "DOC" | "CODE"
  fileSize: string | null
  subjectId: string
  subjectName: string
  subjectCode: string
  uploadedById: string
  uploadedByName: string
  createdAt: string
}

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<FacultyTab>('lecture')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data from API
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [divisions, setDivisions] = useState<DivisionItem[]>([])
  const [timetable, setTimetable] = useState<TimetableSlotItem[]>([])
  const [assignments, setAssignments] = useState<FacultyAssignmentItem[]>([])

  // Tab 1: Lecture Hub State
  const [isInCall, setIsInCall] = useState(true)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [areStudentsMuted, setAreStudentsMuted] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [callDuration, setCallDuration] = useState(1920) // ~32 mins
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'Prof. Rajesh Kulkarni (You)',
      time: '09:10 AM',
      text: 'Good morning class. Today we will finish the Banker\'s algorithm proof.',
      isInstructor: true,
    },
    {
      id: 'm2',
      sender: 'Aditya Sharma (PRN 22110482)',
      time: '09:14 AM',
      text: 'Sir, do we need to calculate the safety matrix for each process request in Lab 4?',
    },
    {
      id: 'm3',
      sender: 'Sneha Kale (PRN 22110483)',
      time: '09:16 AM',
      text: 'Yes sir, and does the request need to be strictly less than or equal to Need?',
    },
  ])
  const [chatInput, setChatInput] = useState('')

  // Tab 2: Attendance Manager State
  const [selectedAttendanceSlotId, setSelectedAttendanceSlotId] = useState<string>('')
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>
  >({})
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null)

  // Tab 3: Assignment Review State
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>('ALL')
  const [gradesInputMap, setGradesInputMap] = useState<Record<string, string>>({})
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null)
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState<string | null>(null)

  // Create Assignment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAsgSubjectId, setNewAsgSubjectId] = useState('')
  const [newAsgTitle, setNewAsgTitle] = useState('')
  const [newAsgDescription, setNewAsgDescription] = useState('')
  const [newAsgDueDate, setNewAsgDueDate] = useState('')
  const [creatingAsg, setCreatingAsg] = useState(false)

  // Tab 4: Course Materials & Resources State
  const [materials, setMaterials] = useState<FacultyMaterialItem[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState<string>('ALL')
  const [materialSearchQuery, setMaterialSearchQuery] = useState('')
  const [materialSuccessMsg, setMaterialSuccessMsg] = useState<string | null>(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)

  // Upload Material Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [newMaterialSubjectId, setNewMaterialSubjectId] = useState('')
  const [newMaterialTitle, setNewMaterialTitle] = useState('')
  const [newMaterialDescription, setNewMaterialDescription] = useState('')
  const [newMaterialFileType, setNewMaterialFileType] = useState('PDF')
  const [newMaterialFileSize, setNewMaterialFileSize] = useState('3.5 MB')
  const [newMaterialFileUrl, setNewMaterialFileUrl] = useState('')
  const [uploadingMaterial, setUploadingMaterial] = useState(false)

  // Load Course Materials
  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true)
      const res = await fetch('/api/course-materials')
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.materials || [])
      }
    } catch (err) {
      console.error('Failed to load course materials:', err)
    } finally {
      setLoadingMaterials(false)
    }
  }

  // Fetch all faculty data
  const loadFacultyData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Courses & Timetable
      const coursesRes = await fetch('/api/faculty/courses')
      if (!coursesRes.ok) throw new Error('Failed to load courses')
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses || [])
      setDivisions(coursesData.divisions || [])
      setTimetable(coursesData.timetable || [])

      if (coursesData.timetable && coursesData.timetable.length > 0) {
        setSelectedSlotId(coursesData.timetable[0].id)
        setSelectedAttendanceSlotId(coursesData.timetable[0].id)
      }
      if (coursesData.courses && coursesData.courses.length > 0) {
        setNewAsgSubjectId(coursesData.courses[0].id)
        setNewMaterialSubjectId(coursesData.courses[0].id)
      }

      // Fetch Assignments
      const asgRes = await fetch('/api/faculty/assignments')
      if (asgRes.ok) {
        const asgData = await asgRes.json()
        setAssignments(asgData.assignments || [])

        // Initialize grade inputs
        const initialGrades: Record<string, string> = {}
        ;(asgData.assignments || []).forEach((asg: FacultyAssignmentItem) => {
          asg.submissions.forEach((sub) => {
            initialGrades[sub.id] = sub.grade || ''
          })
        })
        setGradesInputMap(initialGrades)
      }

      // Fetch Course Materials
      await loadMaterials()
    } catch (err: any) {
      console.error('Error loading faculty workspace:', err)
      setError(err?.message || 'Failed to load faculty workspace.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFacultyData()
  }, [])

  // Call timer interval
  useEffect(() => {
    let interval: any
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isInCall])

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

  // Current active slot for Lecture Hub
  const activeLectureSlot =
    timetable.find((t) => t.id === selectedSlotId) || timetable[0]

  // Students list for Attendance Manager
  const currentSlotForAttendance = timetable.find(
    (t) => t.id === selectedAttendanceSlotId
  )
  const currentDivisionForAttendance = divisions.find(
    (d) => d.id === currentSlotForAttendance?.divisionId
  )
  const attendanceStudentsList = currentDivisionForAttendance?.students || []

  // Helpers
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'Prof. Rajesh Kulkarni (You)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chatInput.trim(),
      isInstructor: true,
    }
    setChatMessages((prev) => [...prev, newMsg])
    setChatInput('')
  }

  // Handle saving attendance
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

  // Handle bulk attendance mark
  const handleBulkAttendance = (status: 'PRESENT' | 'ABSENT') => {
    const newMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
    attendanceStudentsList.forEach((st) => {
      newMap[st.id] = status
    })
    setAttendanceMap(newMap)
  }

  // Handle grade submission
  const handleSaveGrade = async (submissionId: string) => {
    const grade = gradesInputMap[submissionId]
    setSavingGradeId(submissionId)
    try {
      const res = await fetch('/api/faculty/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, grade }),
      })

      if (res.ok) {
        setGradeSuccessMsg('Grade recorded successfully!')
        setTimeout(() => setGradeSuccessMsg(null), 3000)
        // Refresh assignments list
        const asgRes = await fetch('/api/faculty/assignments')
        if (asgRes.ok) {
          const asgData = await asgRes.json()
          setAssignments(asgData.assignments || [])
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to record grade')
      }
    } catch (err) {
      console.error('Error saving grade:', err)
      alert('Network error saving grade')
    } finally {
      setSavingGradeId(null)
    }
  }

  // Handle Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAsgSubjectId || !newAsgTitle.trim() || !newAsgDueDate) {
      alert('Please fill all required fields')
      return
    }

    setCreatingAsg(true)
    try {
      const res = await fetch('/api/faculty/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: newAsgSubjectId,
          title: newAsgTitle.trim(),
          description: newAsgDescription.trim() || null,
          dueDate: newAsgDueDate,
        }),
      })

      if (res.ok) {
        setIsCreateModalOpen(false)
        setNewAsgTitle('')
        setNewAsgDescription('')
        setNewAsgDueDate('')
        setGradeSuccessMsg('New assignment posted for students!')
        setTimeout(() => setGradeSuccessMsg(null), 4000)

        // Refresh assignments
        const asgRes = await fetch('/api/faculty/assignments')
        if (asgRes.ok) {
          const asgData = await asgRes.json()
          setAssignments(asgData.assignments || [])
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create assignment')
      }
    } catch (err) {
      console.error('Error creating assignment:', err)
      alert('Network error creating assignment')
    } finally {
      setCreatingAsg(false)
    }
  }

  // Filtered Submissions
  const allSubmissions = assignments.flatMap((asg) =>
    asg.submissions.map((sub) => ({
      ...sub,
      assignmentTitle: asg.title,
      subjectCode: asg.subjectCode,
      subjectName: asg.subjectName,
    }))
  )

  const filteredSubmissions =
    selectedAssignmentFilter === 'ALL'
      ? allSubmissions
      : allSubmissions.filter((s) => s.assignmentId === selectedAssignmentFilter)

  // Material Actions
  const handleDeleteMaterial = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return
    setDeletingMaterialId(id)
    try {
      const res = await fetch(`/api/course-materials/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMaterialSuccessMsg(`Material "${title}" removed successfully.`)
        setTimeout(() => setMaterialSuccessMsg(null), 3500)
        await loadMaterials()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete material')
      }
    } catch (err) {
      console.error('Error deleting material:', err)
      alert('Failed to delete material')
    } finally {
      setDeletingMaterialId(null)
    }
  }

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterialSubjectId || !newMaterialTitle.trim()) {
      alert('Please select a course and enter a document title.')
      return
    }

    setUploadingMaterial(true)
    try {
      const sanitizedName = newMaterialTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      const ext =
        newMaterialFileType === 'PDF'
          ? 'pdf'
          : newMaterialFileType === 'PPT'
          ? 'pptx'
          : newMaterialFileType === 'DOC'
          ? 'docx'
          : 'zip'
      const finalUrl = newMaterialFileUrl.trim() || `/materials/${sanitizedName}.${ext}`

      const res = await fetch('/api/course-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMaterialTitle.trim(),
          description: newMaterialDescription.trim() || undefined,
          subjectId: newMaterialSubjectId,
          fileType: newMaterialFileType,
          fileSize: newMaterialFileSize.trim() || '3.5 MB',
          fileUrl: finalUrl,
        }),
      })

      if (res.ok) {
        setMaterialSuccessMsg(`Successfully uploaded "${newMaterialTitle}"!`)
        setIsUploadModalOpen(false)
        setNewMaterialTitle('')
        setNewMaterialDescription('')
        setNewMaterialFileUrl('')
        setTimeout(() => setMaterialSuccessMsg(null), 4000)
        await loadMaterials()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to upload course material')
      }
    } catch (err) {
      console.error('Error uploading material:', err)
      alert('Network error while uploading material')
    } finally {
      setUploadingMaterial(false)
    }
  }

  const filteredFacultyMaterials = materials
    .filter((m) => {
      if (selectedMaterialFilter === 'ALL') return true
      return m.subjectId === selectedMaterialFilter
    })
    .filter((m) => {
      if (!materialSearchQuery.trim()) return true
      const q = materialSearchQuery.toLowerCase()
      return (
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        m.subjectName.toLowerCase().includes(q) ||
        m.subjectCode.toLowerCase().includes(q) ||
        m.fileType.toLowerCase().includes(q)
      )
    })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#64748B] text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
        <span>Loading Faculty Academic Workspace...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-center text-xs text-[#DC2626]">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#EF4444]" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={loadFacultyData}
          className="mt-3 px-3 py-1.5 rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Instructor Header Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0D9488]/30 border border-[#334155] p-5 text-white flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0D9488]/20 border border-[#0D9488]/50 flex items-center justify-center text-[#2DD4BF] shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Faculty Academic Workspace
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0D9488] text-white">
                Instructor Mode
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Prof. Rajesh Kulkarni • Dept. of Computer Engineering • Division TE Div A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#090D16]/80 text-[#2DD4BF] text-xs font-mono border border-[#334155]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{courses.length} Courses Taught</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#090D16]/80 text-[#10B981] text-xs font-mono border border-[#334155]">
            <Users className="w-3.5 h-3.5" />
            <span>
              {divisions.reduce((sum, d) => sum + d.students.length, 0)} Students Enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('lecture')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'lecture'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Lecture Hub & Live Room</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'assignments'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Assignment Review & Grading</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'assignments'
                  ? 'bg-white text-[#0D9488]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {allSubmissions.filter((s) => !s.grade).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'materials'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Course Materials & Resources</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'materials'
                  ? 'bg-white text-[#0D9488]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {materials.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {gradeSuccessMsg && (
            <div className="flex items-center gap-1.5 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{gradeSuccessMsg}</span>
            </div>
          )}
          {materialSuccessMsg && (
            <div className="flex items-center gap-1.5 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{materialSuccessMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== TAB 1: LECTURE HUB & LIVE ROOM ==================== */}
      {activeTab === 'lecture' && (
        <div className="flex flex-col gap-6">
          {/* Main Host Classroom Stage */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] overflow-hidden shadow-xl text-white">
            {/* Top Bar with Host Badges */}
            <div className="px-6 py-3.5 border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-3 bg-[#090D16]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isInCall ? 'bg-[#EF4444] animate-pulse' : 'bg-[#64748B]'
                    }`}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EF4444] flex items-center gap-1">
                    {isInCall ? 'Instructor Live Broadcast' : 'Lecture Idle'}
                  </span>
                </div>
                <div className="h-4 w-px bg-[#334155]" />
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {activeLectureSlot?.subjectName} ({activeLectureSlot?.subjectCode})
                  </h2>
                  <p className="text-[11px] text-[#94A3B8]">
                    {activeLectureSlot?.roomNumber} • {activeLectureSlot?.divisionName} •{' '}
                    {activeLectureSlot?.startTime} – {activeLectureSlot?.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] text-[#94A3B8] text-xs font-mono">
                  <Users className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>48 Students Connected</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isChatOpen
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Student Q&A</span>
                </button>
              </div>
            </div>

            {/* Video Canvas & Grid */}
            <div className="bg-[#050811] p-4 min-h-[380px] flex relative">
              {isInCall ? (
                <div className="flex w-full gap-3">
                  {/* Host Stage */}
                  <div
                    className={`flex-1 grid grid-cols-1 ${
                      isChatOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
                    } gap-3`}
                  >
                    {/* Instructor Broadcast Tile */}
                    <div
                      className={`${
                        isChatOpen ? 'lg:col-span-2' : 'lg:col-span-2'
                      } rounded-lg bg-[#111827] border border-[#1F2937] p-4 relative flex flex-col justify-between overflow-hidden min-h-[280px]`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/15 via-[#0B1329] to-[#0A0F1D] flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/50 flex items-center justify-center mb-3 shadow-lg">
                          {isVideoOn ? (
                            <span className="text-lg font-bold text-[#2DD4BF]">RK</span>
                          ) : (
                            <VideoOff className="w-6 h-6 text-[#64748B]" />
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          Prof. Rajesh Kulkarni (Instructor)
                        </h3>
                        <p className="text-xs text-[#94A3B8] max-w-md mt-1 leading-relaxed">
                          Broadcasting: {activeLectureSlot?.subjectName} • Lab 401 Screen 1
                        </p>

                        {/* Animated Host Voice Frequency */}
                        {!isMicMuted ? (
                          <div className="flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-full bg-black/50 border border-[#1E293B]">
                            <span className="w-1.5 h-3.5 bg-[#10B981] animate-bounce rounded-full" />
                            <span className="w-1.5 h-6 bg-[#10B981] animate-bounce rounded-full delay-75" />
                            <span className="w-1.5 h-8 bg-[#10B981] animate-bounce rounded-full delay-150" />
                            <span className="w-1.5 h-5 bg-[#10B981] animate-bounce rounded-full delay-100" />
                            <span className="w-1.5 h-2.5 bg-[#10B981] animate-bounce rounded-full" />
                            <span className="text-[11px] text-[#A7F3D0] ml-2 font-mono">
                              Your Mic is Active (Host)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[11px]">
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Microphone Muted</span>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 flex justify-between items-start">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#000000]/70 text-[#2DD4BF] border border-[#374151] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
                          Host Session (Full Control)
                        </span>
                        {areStudentsMuted && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                            All Students Muted
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] text-[#94A3B8] bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-[#2DD4BF]" />
                          {isScreenSharing
                            ? 'Presenting: Lecture_Notes_SlideDeck.pdf'
                            : 'Camera Feed Active'}
                        </span>
                        <Maximize2 className="w-4 h-4 text-[#94A3B8] cursor-pointer hover:text-white" />
                      </div>
                    </div>

                    {/* Student View Grid */}
                    <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
                      {/* Aditya Sharma */}
                      <div className="rounded-lg bg-[#1F2937]/70 border border-[#374151] p-3 flex flex-col justify-between min-h-[135px] relative">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-xs font-bold">
                            AS
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Aditya Sharma
                            </span>
                            <span className="text-[9px] font-mono text-[#94A3B8]">
                              PRN: 22110482
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#94A3B8]">
                          <span>Div A • Roll 28</span>
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        </div>
                      </div>

                      {/* Sneha Kale */}
                      <div className="rounded-lg bg-[#1F2937]/70 border border-[#374151] p-3 flex flex-col justify-between min-h-[135px] relative">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-xs font-bold">
                            SK
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Sneha Kale
                            </span>
                            <span className="text-[9px] font-mono text-[#94A3B8]">
                              PRN: 22110483
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#94A3B8]">
                          <span>Div A • Roll 42</span>
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        </div>
                      </div>

                      {/* Rohan Patil */}
                      <div className="rounded-lg bg-[#1F2937]/70 border border-[#374151] p-3 flex flex-col justify-between min-h-[135px] relative">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#A855F7] text-white flex items-center justify-center text-xs font-bold">
                            RP
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Rohan Patil
                            </span>
                            <span className="text-[9px] font-mono text-[#94A3B8]">
                              PRN: 22110484
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#94A3B8]">
                          <span>Div A • Roll 51</span>
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        </div>
                      </div>

                      {/* +45 More */}
                      <div className="rounded-lg bg-[#111827] border border-[#1F2937] p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-bold text-[#0D9488]">+45</span>
                        <span className="text-[10px] text-[#94A3B8] mt-0.5">peers connected</span>
                        <span className="text-[9px] text-[#10B981] mt-1 font-mono">
                          Full Roster
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Q&A Chat Sidebar */}
                  {isChatOpen && (
                    <div className="w-72 bg-[#090D16] border border-[#1E293B] rounded-lg flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
                      <div className="px-3.5 py-2.5 border-b border-[#1E293B] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span className="text-xs font-semibold text-white">Student Questions</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsChatOpen(false)}
                          className="text-[#94A3B8] hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[320px]">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-2 rounded-lg text-xs ${
                              msg.isInstructor
                                ? 'bg-[#0D9488]/15 border border-[#0D9488]/30'
                                : 'bg-[#1E293B]/60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span
                                className={`font-semibold ${
                                  msg.isInstructor ? 'text-[#2DD4BF]' : 'text-[#94A3B8]'
                                }`}
                              >
                                {msg.sender}
                              </span>
                              <span className="text-[9px] text-[#64748B]">{msg.time}</span>
                            </div>
                            <p className="text-[#E2E8F0] leading-relaxed">{msg.text}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendChat} className="p-2.5 border-t border-[#1E293B] flex gap-1.5">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Reply to class as Instructor..."
                          className="flex-1 px-2.5 py-1.5 rounded bg-[#1E293B] border border-[#334155] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#0D9488]"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                /* Lecture Inactive State */
                <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-[#1E293B] flex items-center justify-center text-[#64748B] mb-3">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Lecture has concluded</h3>
                  <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
                    Click below to open the virtual classroom and start broadcasting.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsInCall(true)}
                    className="mt-4 px-5 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Start Lecture Broadcast</span>
                  </button>
                </div>
              )}
            </div>

            {/* Host In-Call Controls Bar */}
            <div className="px-6 py-3.5 bg-[#090D16] border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-[#94A3B8] font-mono flex items-center gap-2">
                <span>{isInCall ? `Lecture Elapsed: ${formatDuration(callDuration)}` : 'Broadcast Idle'}</span>
                <span className="text-[10px] text-[#2DD4BF] bg-[#0D9488]/20 px-2 py-0.5 rounded border border-[#0D9488]/40">
                  Host Permissions Active
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Mute All Students (Host Privilege) */}
                <button
                  type="button"
                  onClick={() => setAreStudentsMuted(!areStudentsMuted)}
                  title={areStudentsMuted ? 'Unmute All Students' : 'Mute All Students'}
                  className={`h-10 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    areStudentsMuted
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-white'
                  }`}
                >
                  <VolumeX className="w-4 h-4" />
                  <span>{areStudentsMuted ? 'Muted (All)' : 'Mute All'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isMicMuted
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-white'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    !isVideoOn
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-white'
                  }`}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  title="Share Screen"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isScreenSharing
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <ScreenShare className="w-4 h-4" />
                </button>

                {isInCall ? (
                  <button
                    type="button"
                    onClick={() => setIsInCall(false)}
                    title="End Lecture"
                    className="h-10 px-4 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>End Lecture</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsInCall(true)}
                    className="h-10 px-4 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Start Lecture</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Today's Teaching Schedule */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    Today's Teaching Schedule
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Click any card to switch classroom stage and load lecture details
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-[#F1F5F9] text-[#475569] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                TE Div A
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {timetable.map((slot) => {
                const isSelected = selectedSlotId === slot.id
                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlotId(slot.id)
                      setIsInCall(true)
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F0FDFA] border-[#0D9488] ring-1 ring-[#0D9488] shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                        {slot.subjectCode}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        {slot.divisionName}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {slot.subjectName}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span className="font-mono">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-[#475569] flex items-center justify-between border-t border-[#E2E8F0]/60 pt-2">
                      <span className="font-medium text-[#0D9488]">{slot.roomNumber}</span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {slot.studentCount} Students
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ATTENDANCE & ROSTER MANAGER ==================== */}
      {activeTab === 'attendance' && (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Division Roster & Attendance Manager
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

          {attendanceSuccessMsg && (
            <div className="flex items-center gap-2 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>{attendanceSuccessMsg}</span>
            </div>
          )}

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
                {attendanceStudentsList.map((st) => {
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
      )}

      {/* ==================== TAB 3: ASSIGNMENT REVIEW & GRADING ==================== */}
      {activeTab === 'assignments' && (
        <div className="flex flex-col gap-6">
          {/* Header Bar with Filter and "+ Create Assignment" */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Course Assignment Submissions & Grading
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Review files uploaded by students, assign academic grades, and create new coursework.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Filter */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Filter className="w-3.5 h-3.5 text-[#0D9488]" />
                <select
                  value={selectedAssignmentFilter}
                  onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="ALL">All Course Assignments</option>
                  {assignments.map((asg) => (
                    <option key={asg.id} value={asg.id}>
                      {asg.subjectCode}: {asg.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Create Assignment Modal Button */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>

          {/* Submissions List Table */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#0F172A]">
                Submitted Coursework ({filteredSubmissions.length} Total)
              </span>
              <span className="text-[11px] text-[#64748B]">
                {filteredSubmissions.filter((s) => !!s.grade).length} Graded •{' '}
                {filteredSubmissions.filter((s) => !s.grade).length} Pending Evaluation
              </span>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">
                No student submissions found for this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                      <th className="py-2.5 px-3 font-semibold">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold">PRN</th>
                      <th className="py-2.5 px-3 font-semibold">Assignment</th>
                      <th className="py-2.5 px-3 font-semibold">Submitted File</th>
                      <th className="py-2.5 px-3 font-semibold">Submitted Date</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Grade & Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                        <td className="py-3 px-3 font-medium text-[#0F172A] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] flex items-center justify-center font-bold text-[11px]">
                            {sub.studentName.charAt(0)}
                          </div>
                          <span>{sub.studentName}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#64748B]">{sub.prnNumber}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#0F172A] truncate max-w-[180px]">
                            {sub.assignmentTitle}
                          </div>
                          <span className="text-[10px] font-mono text-[#64748B]">
                            {sub.subjectCode}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {sub.fileUrl ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded font-mono">
                              <FileCheck className="w-3 h-3 text-[#10B981]" />
                              {sub.fileUrl}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">No file attached</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#64748B]">
                          {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <input
                              type="text"
                              value={gradesInputMap[sub.id] || ''}
                              onChange={(e) =>
                                setGradesInputMap((prev) => ({
                                  ...prev,
                                  [sub.id]: e.target.value,
                                }))
                              }
                              placeholder="e.g. A+, 9/10"
                              className="w-20 px-2 py-1 text-xs text-center rounded border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveGrade(sub.id)}
                              disabled={savingGradeId === sub.id}
                              className="px-2.5 py-1 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              {savingGradeId === sub.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Save</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: COURSE MATERIALS & RESOURCES ==================== */}
      {activeTab === 'materials' && (
        <div className="flex flex-col gap-6">
          {/* Header Bar with Filters and "+ Upload Material" button */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Course Learning Materials & Resources
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Upload and distribute syllabus PPTs, lab manuals, assignment solutions, and reference PDFs for enrolled students.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter by Course */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Filter className="w-3.5 h-3.5 text-[#0D9488]" />
                <select
                  value={selectedMaterialFilter}
                  onChange={(e) => setSelectedMaterialFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="ALL">All Taught Courses ({materials.length})</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({materials.filter((m) => m.subjectId === c.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={materialSearchQuery}
                  onChange={(e) => setMaterialSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                />
                {materialSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMaterialSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Upload Material Modal Button */}
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Material</span>
              </button>
            </div>
          </div>

          {/* Quick Course Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {courses.map((c) => {
              const count = materials.filter((m) => m.subjectId === c.id).length
              const isSelected = selectedMaterialFilter === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedMaterialFilter(isSelected ? 'ALL' : c.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-xs'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      {count} files
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A] truncate" title={c.name}>
                    {c.name}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Division: {c.divisionName}</p>
                </div>
              )
            })}
          </div>

          {/* Materials Table & List */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-semibold text-[#0F172A]">
                Published Course Materials ({filteredFacultyMaterials.length} Items)
              </span>
              <button
                type="button"
                onClick={loadMaterials}
                className="text-[11px] text-[#0D9488] hover:underline flex items-center gap-1 font-medium"
              >
                Refresh List
              </button>
            </div>

            {loadingMaterials ? (
              <div className="p-8 text-center text-[#64748B]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0D9488] mb-2" />
                <p className="text-xs">Loading course materials...</p>
              </div>
            ) : filteredFacultyMaterials.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#0F172A]">No materials published yet</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Click &quot;+ Upload Material&quot; above to publish lecture notes or slides.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold uppercase text-[10px] tracking-wider border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Document Title & Details</th>
                      <th className="py-2.5 px-3">Course</th>
                      <th className="py-2.5 px-3">Type & Size</th>
                      <th className="py-2.5 px-3">Uploaded Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredFacultyMaterials.map((mat) => {
                      const isPdf = mat.fileType.toUpperCase() === 'PDF'
                      const isPpt = mat.fileType.toUpperCase() === 'PPT' || mat.fileType.toUpperCase() === 'PPTX'
                      const isDoc = mat.fileType.toUpperCase() === 'DOC' || mat.fileType.toUpperCase() === 'DOCX'

                      return (
                        <tr key={mat.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#0F172A] leading-snug">
                                  {mat.title}
                                </h4>
                                {mat.description && (
                                  <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                                    {mat.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-semibold text-[#0F172A]">
                              {mat.subjectCode}
                            </span>
                            <p className="text-[10px] text-[#64748B]">{mat.subjectName}</p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isPdf
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : isPpt
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : isDoc
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {mat.fileType.toUpperCase()}
                              </span>
                              {mat.fileSize && (
                                <span className="text-[11px] text-[#64748B] font-mono">
                                  {mat.fileSize}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#64748B]">
                            {new Date(mat.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <a
                                href={mat.fileUrl}
                                download={mat.title}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] hover:border-[#0D9488] bg-white hover:bg-[#F0FDFA] text-[#0F172A] hover:text-[#0D9488] text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                                title="Download / Open Material"
                              >
                                <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span>Download</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                                disabled={deletingMaterialId === mat.id}
                                className="p-1.5 rounded-lg border border-[#FECACA] hover:bg-[#FEF2F2] text-[#DC2626] transition-colors disabled:opacity-50"
                                title="Delete Material"
                              >
                                {deletingMaterialId === mat.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Create Course Assignment
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Subject Course
                </label>
                <select
                  value={newAsgSubjectId}
                  onChange={(e) => setNewAsgSubjectId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  placeholder="e.g. Lab 5: Inter-Process Communication (Pipes & Sockets)"
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Description / Instructions
                </label>
                <textarea
                  value={newAsgDescription}
                  onChange={(e) => setNewAsgDescription(e.target.value)}
                  placeholder="e.g. Write a C program implementing two-way pipe communication between parent and child processes."
                  rows={3}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Submission Due Date
                </label>
                <input
                  type="date"
                  value={newAsgDueDate}
                  onChange={(e) => setNewAsgDueDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAsg}
                  className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {creatingAsg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create & Publish</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Course Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Upload Learning Material
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Subject Course *
                </label>
                <select
                  value={newMaterialSubjectId}
                  onChange={(e) => setNewMaterialSubjectId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  placeholder="e.g. Lecture 05: Memory Management & Paging.pdf"
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    Resource Type
                  </label>
                  <select
                    value={newMaterialFileType}
                    onChange={(e) => setNewMaterialFileType(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="PPT">PowerPoint Slides (PPT/PPTX)</option>
                    <option value="DOC">Word Document (DOC/DOCX)</option>
                    <option value="CODE">Lab Code / Archive (ZIP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={newMaterialFileSize}
                    onChange={(e) => setNewMaterialFileSize(e.target.value)}
                    placeholder="e.g. 4.2 MB"
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Description / Topic Notes
                </label>
                <textarea
                  value={newMaterialDescription}
                  onChange={(e) => setNewMaterialDescription(e.target.value)}
                  placeholder="e.g. Covers paging mechanisms, translation lookaside buffer (TLB), and multi-level page tables."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  File Download URL / Key
                </label>
                <input
                  type="text"
                  value={newMaterialFileUrl}
                  onChange={(e) => setNewMaterialFileUrl(e.target.value)}
                  placeholder="/materials/lecture05-memory-paging.pdf"
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] font-mono text-[11px]"
                />
                <p className="text-[10px] text-[#64748B] mt-1">
                  Leave empty to auto-generate a valid download path from document title.
                </p>
              </div>

              {/* Quick file picker simulation helper */}
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <p className="text-[11px] font-semibold text-[#0F172A] mb-1">Quick Suggestions:</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMaterialTitle('Lecture 05: Virtual Memory & Page Fault Handlers.pdf')
                      setNewMaterialDescription('Detailed lecture notes on demand paging, page replacement policies (FIFO, LRU), and thrashing.')
                      setNewMaterialFileType('PDF')
                      setNewMaterialFileSize('3.8 MB')
                    }}
                    className="text-[10px] px-2 py-1 bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] text-[#334155]"
                  >
                    Virtual Memory PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMaterialTitle('Lab 04: Socket Programming Guide & Multi-threading.zip')
                      setNewMaterialDescription('C code templates and test harnesses for TCP client-server architecture.')
                      setNewMaterialFileType('CODE')
                      setNewMaterialFileSize('5.1 MB')
                    }}
                    className="text-[10px] px-2 py-1 bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] text-[#334155]"
                  >
                    Socket Lab ZIP
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingMaterial}
                  className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {uploadingMaterial ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
