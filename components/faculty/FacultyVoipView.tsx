'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  RefreshCw,
  VolumeX,
  Share2,
  Filter,
  GraduationCap,
  Download,
  Search,
  FolderOpen,
  Trash2,
  ExternalLink,
  Radio,
} from 'lucide-react'
import type { StudentProfile } from '@/types/dashboard'

export type FacultyVoipTab = 'lecture' | 'materials' | 'assignments'

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
  students: Array<{
    id: string
    name: string
    email: string
    prnNumber: string
  }>
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
  fileType: string
  fileSize: string | null
  subjectId: string
  subjectName: string
  subjectCode: string
  uploadedById: string
  uploadedByName: string
  createdAt: string
}

interface FacultyVoipViewProps {
  profile?: StudentProfile | null
  initialSubTab?: FacultyVoipTab | 'lecture-hub' | 'grading'
  selectedSlotId?: string
}

export default function FacultyVoipView({
  profile,
  initialSubTab,
  selectedSlotId: propSelectedSlotId,
}: FacultyVoipViewProps = {}) {
  const [activeTab, setActiveTab] = useState<FacultyVoipTab>(() => {
    if (initialSubTab === 'grading' || initialSubTab === 'assignments') return 'assignments'
    if (initialSubTab === 'materials') return 'materials'
    return 'lecture'
  })
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
      text: "Good morning class. Today we will finish the Banker's algorithm proof.",
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

  // Tab 2: Assignment Review State
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

  // Tab 3: Course Materials State
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

  // Extra Lecture Request States
  const [extraRequests, setExtraRequests] = useState<any[]>([])
  const [dailyLiveSlots, setDailyLiveSlots] = useState<any[]>([])
  const [loadingLiveSlots, setLoadingLiveSlots] = useState(true)
  const [hasLoadedLiveSlots, setHasLoadedLiveSlots] = useState(false)
  const [liveScheduleError, setLiveScheduleError] = useState<string | null>(null)
  const [currentDayName, setCurrentDayName] = useState('Wednesday')
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false)
  const [extraSubjectId, setExtraSubjectId] = useState('')
  const [extraDivisionId, setExtraDivisionId] = useState('')
  const [extraDate, setExtraDate] = useState(() => new Date().toISOString().split('T')[0])
  const [extraStartTime, setExtraStartTime] = useState('02:00 PM')
  const [extraEndTime, setExtraEndTime] = useState('03:00 PM')
  const [extraRoom, setExtraRoom] = useState('Lab 401')
  const [extraReason, setExtraReason] = useState('')
  const [submittingExtra, setSubmittingExtra] = useState(false)
  const [extraSuccessMsg, setExtraSuccessMsg] = useState<string | null>(null)

  // Load Extra Lecture Requests
  const loadExtraRequests = async () => {
    try {
      const res = await fetch('/api/faculty/extra-lecture')
      if (res.ok) {
        const data = await res.json()
        setExtraRequests(data.requests || [])
      }
    } catch (e) {
      console.error('Error fetching extra lecture requests:', e)
    }
  }

  // Track component mounted status
  const isMountedRef = useRef<boolean>(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Ref to hold current in-flight abort controller for live schedule
  const scheduleAbortControllerRef = useRef<AbortController | null>(null)

  // Load Daily Live VoIP Schedule strictly matching active day in Header with 8s timeout protection
  const loadLiveSchedule = useCallback(async () => {
    if (scheduleAbortControllerRef.current) {
      scheduleAbortControllerRef.current.abort()
    }
    const controller = new AbortController()
    scheduleAbortControllerRef.current = controller

    let isTimedOut = false
    const timeoutId = setTimeout(() => {
      isTimedOut = true
      controller.abort()
    }, 8000)

    try {
      if (isMountedRef.current) {
        setLoadingLiveSlots(true)
        setLiveScheduleError(null)
      }
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const activeDay = days[new Date().getDay()]
      const activeDate = new Date().toISOString().split('T')[0]
      if (isMountedRef.current) {
        setCurrentDayName(activeDay)
      }

      const res = await fetch(
        `/api/voip/schedule?day=${encodeURIComponent(activeDay)}&date=${encodeURIComponent(activeDate)}`,
        { signal: controller.signal }
      )

      if (res.ok) {
        const data = await res.json()
        if (isMountedRef.current) {
          setDailyLiveSlots(data.schedule || [])
          if (data.day) setCurrentDayName(data.day)
        }
      } else {
        throw new Error(`Server returned ${res.status}`)
      }
    } catch (e: any) {
      const isAbort = e?.name === 'AbortError' || e?.name === 'TimeoutError'
      if (isAbort) {
        // Suppress abort errors gracefully (e.g. unmount or timeout)
        if (isMountedRef.current && isTimedOut) {
          setLiveScheduleError('Schedule request timed out. Please retry.')
        }
      } else {
        console.error('Error fetching live VoIP schedule:', e)
        if (isMountedRef.current) {
          setLiveScheduleError('Unable to load today\'s schedule. Please retry.')
        }
      }
    } finally {
      clearTimeout(timeoutId)
      if (scheduleAbortControllerRef.current === controller) {
        scheduleAbortControllerRef.current = null
      }
      if (isMountedRef.current) {
        setLoadingLiveSlots(false)
        setHasLoadedLiveSlots(true)
      }
    }
  }, [])

  // Handle Create Extra Lecture Request
  const handleCreateExtraLecture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extraSubjectId || !extraDivisionId || !extraDate || !extraReason.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    setSubmittingExtra(true)
    try {
      const res = await fetch('/api/faculty/extra-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: extraSubjectId,
          divisionId: extraDivisionId,
          date: extraDate,
          startTime: extraStartTime,
          endTime: extraEndTime,
          roomNumber: extraRoom,
          reason: extraReason.trim(),
        }),
      })

      if (res.ok) {
        setExtraSuccessMsg('Extra lecture request submitted! Awaiting Admin approval.')
        setIsExtraModalOpen(false)
        setExtraReason('')
        await loadExtraRequests()
        await loadLiveSchedule()
        setTimeout(() => setExtraSuccessMsg(null), 5000)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to submit extra lecture request.')
      }
    } catch (e) {
      console.error('Error submitting extra lecture:', e)
      alert('Network error while requesting extra lecture.')
    } finally {
      setSubmittingExtra(false)
    }
  }

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

  // Load Faculty Data
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
      setError(err?.message || 'Failed to load faculty VoIP data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFacultyData()
    loadLiveSchedule()
    loadExtraRequests()

    return () => {
      if (scheduleAbortControllerRef.current) {
        scheduleAbortControllerRef.current.abort()
      }
    }
  }, [loadLiveSchedule])

  // Call duration timer
  useEffect(() => {
    let interval: any
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isInCall])

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  // Active today's live lecture slots strictly for current day
  const displaySlots = dailyLiveSlots.map((s: any) => ({
    id: s.id,
    subjectCode: s.code || s.subjectCode,
    subjectName: s.subject || s.subjectName,
    startTime: s.startTime,
    endTime: s.endTime,
    roomNumber: s.room || s.roomNumber,
    divisionName: s.divisionName || 'TE Div A',
    studentCount: 68,
    isExtra: s.isExtra,
    reason: s.reason,
    dayOfWeek: s.dayOfWeek || currentDayName,
  }))

  // Active timetable slot for host stage
  const currentSlot =
    displaySlots.find((s) => s.id === selectedSlotId) ||
    displaySlots[0] ||
    timetable.find((s) => s.id === selectedSlotId) ||
    timetable[0] || {
      id: 'default-slot',
      dayOfWeek: currentDayName,
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      roomNumber: 'Hall 304',
      subjectName: 'Operating Systems',
      subjectCode: 'CS501',
      divisionName: 'TE Div A',
      studentCount: 68,
    }

  useEffect(() => {
    if (propSelectedSlotId) {
      setSelectedSlotId(propSelectedSlotId)
      return
    }
    if (displaySlots.length > 0 && !displaySlots.some((s) => s.id === selectedSlotId)) {
      setSelectedSlotId(displaySlots[0].id)
    }
  }, [dailyLiveSlots, propSelectedSlotId])

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'grading' || initialSubTab === 'assignments') {
        setActiveTab('assignments')
      } else if (initialSubTab === 'lecture-hub' || initialSubTab === 'lecture') {
        setActiveTab('lecture')
      } else if (initialSubTab === 'materials') {
        setActiveTab('materials')
      }
    }
  }, [initialSubTab])

  const activeDivision =
    divisions.find((d) => d.name === currentSlot.divisionName) || divisions[0]
  const enrolledStudents = activeDivision?.students || []

  // Handle in-call chat send
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: `${profile?.name || 'Prof. Rajesh Kulkarni'} (Instructor)`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chatInput.trim(),
      isInstructor: true,
    }
    setChatMessages((prev) => [...prev, newMsg])
    setChatInput('')
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

  // Handle Delete Material
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

  // Handle Create Material
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

  // Filtered Materials
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
        <span>Loading Instructor VoIP Classroom...</span>
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

      {/* ==================== SUB-TAB 1: LECTURE HUB & LIVE ROOM ==================== */}
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
                    <Radio className="w-3.5 h-3.5" />
                    {isInCall ? 'Host Live Broadcast Active' : 'Classroom Standby'}
                  </span>
                </div>
                <div className="h-4 w-px bg-[#334155]" />
                <div>
                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    {currentSlot.subjectCode} — {currentSlot.subjectName}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] ml-2">
                    ({currentSlot.divisionName} • {currentSlot.roomNumber})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#1E293B] px-3 py-1 rounded-full text-xs font-mono border border-[#334155]">
                  <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Users className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span className="text-white font-medium">68 Enrolled</span>
                </div>
              </div>
            </div>

            {/* Video Stage & Chat Split */}
            <div className="flex flex-col lg:flex-row min-h-[460px]">
              {/* Main Visualizer & Stage */}
              <div className="flex-1 p-6 flex flex-col justify-between relative bg-gradient-to-b from-[#0F172A] to-[#020617]">
                {/* Active Speaker Spotlight Banner */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                    <span className="text-xs font-medium text-white">
                      Host Presenting: {profile?.name || 'Prof. Rajesh Kulkarni'}
                    </span>
                    <span className="text-[10px] text-[#2DD4BF] bg-[#2DD4BF]/10 px-1.5 py-0.5 rounded font-mono">
                      1080p 60fps
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8] bg-[#1E293B]/70 border border-[#334155] px-2.5 py-1 rounded-lg">
                      Room: lecture-{currentSlot.subjectCode.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Central Visualizer Canvas */}
                <div className="my-auto flex flex-col items-center justify-center py-10">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] p-1 shadow-2xl shadow-teal-500/20">
                      <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-[#2DD4BF]" />
                      </div>
                    </div>
                    {isInCall && !isMicMuted && (
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#0F172A] flex items-center justify-center">
                        <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mt-4">
                    {currentSlot.subjectName} Live Virtual Lecture
                  </h3>
                  <p className="text-xs text-[#94A3B8] max-w-md text-center mt-1">
                    LiveKit media server connected. Audio and presentation stream broadcasting to all students in {currentSlot.divisionName}.
                  </p>

                  {/* Sound Wave Animation */}
                  {isInCall && !isMicMuted && (
                    <div className="flex items-center gap-1.5 mt-5 h-6">
                      {[40, 75, 95, 60, 85, 30, 90, 70, 45, 80, 100, 65, 50].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#2DD4BF] rounded-full animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Live Attendees Thumbnails */}
                <div className="z-10 mt-auto pt-4 border-t border-[#1E293B]/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#94A3B8]">Connected Students:</span>
                    <div className="flex -space-x-2">
                      {['AS', 'SK', 'RD', 'PM', 'VK', '+63'].map((initials, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-[#1E293B] border-2 border-[#0F172A] text-[#2DD4BF] text-[10px] font-semibold flex items-center justify-center shadow-xs"
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#94A3B8]">
                    Network Quality: <span className="text-[#10B981] font-mono">14ms latency • 0% loss</span>
                  </div>
                </div>
              </div>

              {/* In-Call Live Chat Drawer */}
              {isChatOpen && (
                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#1E293B] bg-[#090D16] flex flex-col justify-between">
                  <div className="p-3.5 border-b border-[#1E293B] flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      Live In-Call Q&A
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(false)}
                      className="text-[#94A3B8] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 overflow-y-auto space-y-2.5 flex-1 max-h-72">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-lg text-xs ${
                          msg.isInstructor
                            ? 'bg-[#0D9488]/15 border border-[#0D9488]/30'
                            : 'bg-[#1E293B]/70 border border-[#334155]'
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
                          <span className="text-[#64748B]">{msg.time}</span>
                        </div>
                        <p className="text-[#F1F5F9] leading-snug">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="p-3 border-t border-[#1E293B] flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Broadcast message to class..."
                      className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0D9488]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Host Master Control Bar */}
            <div className="px-6 py-4 bg-[#090D16] border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-4">
              {/* Media Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isMicMuted
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#1E293B] text-white hover:bg-[#334155]'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isMicMuted ? 'Muted' : 'Host Mic'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    !isVideoOn
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#1E293B] text-white hover:bg-[#334155]'
                  }`}
                >
                  {!isVideoOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  <span>{!isVideoOn ? 'Video Off' : 'Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isScreenSharing
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#1E293B] text-white hover:bg-[#334155]'
                  }`}
                >
                  <ScreenShare className="w-4 h-4" />
                  <span>{isScreenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
                </button>
              </div>

              {/* Host Administrative Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAreStudentsMuted(!areStudentsMuted)
                    alert(areStudentsMuted ? 'Student mics unmuted.' : 'All student microphones have been muted by Host.')
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    areStudentsMuted
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]'
                  }`}
                  title="Mute all students in room"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>{areStudentsMuted ? 'Unmute Class' : 'Mute All Students'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isChatOpen
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Class Q&A</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsInCall(!isInCall)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md ${
                    isInCall
                      ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
                      : 'bg-[#10B981] hover:bg-[#059669] text-white'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isInCall ? 'End Lecture Session' : 'Rejoin Live Room'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Timetable Selector with VoIP Schedule & Extra Lectures */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    Today's Live VoIP Schedule
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    Permanent Slots + Approved Extra Sessions
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Select an assigned slot to bind the live classroom stage and student rosters.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExtraModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Extra Lecture</span>
              </button>
            </div>

            {/* Extra Lecture Success Banner */}
            {extraSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span>{extraSuccessMsg}</span>
              </div>
            )}

            {/* Render Slots strictly bound to today's active schedule */}
            {loadingLiveSlots ? (
              <div className="py-12 text-center text-xs text-[#64748B] flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0D9488]" />
                <span>Loading today's schedule for {currentDayName}...</span>
              </div>
            ) : liveScheduleError && displaySlots.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-center flex flex-col items-center">
                <AlertCircle className="w-8 h-8 text-[#EF4444] mb-2" />
                <h4 className="text-xs font-bold text-[#991B1B]">Unable to load today's schedule</h4>
                <p className="text-[11px] text-[#B91C1C] mt-1 max-w-md">
                  {liveScheduleError}. Please check your connection or retry loading the schedule.
                </p>
                <button
                  type="button"
                  onClick={loadLiveSchedule}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Schedule</span>
                </button>
              </div>
            ) : displaySlots.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <Clock className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-60" />
                <h4 className="text-xs font-bold text-[#0F172A]">
                  No live lectures scheduled for {currentDayName}
                </h4>
                <p className="text-[11px] text-[#64748B] mt-1 max-w-md mx-auto">
                  You have no teaching slots or approved extra sessions scheduled for today. Click "+ Request Extra Lecture" above if you need to schedule an extra session for today.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {displaySlots.map((slot: any) => {
                const isSelected = slot.id === selectedSlotId
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-xs'
                        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]">
                          {slot.subjectCode}
                        </span>
                        {slot.isExtra && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-[#D97706]" />
                            Extra Lecture • Approved
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[#0D9488] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {slot.subjectName}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {slot.divisionName} • {slot.roomNumber}
                    </p>

                    {slot.isExtra && slot.reason && (
                      <p className="text-[10px] text-amber-800 font-medium mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Reason: {slot.reason}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/70 flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">{slot.studentCount || 68} Students</span>
                      <span
                        className={`font-semibold ${
                          isSelected ? 'text-[#0D9488]' : 'text-[#64748B]'
                        }`}
                      >
                        {isSelected ? 'Active Stage' : 'Switch Room'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            )}

            {/* My Extra Lecture Requests Tracker */}
            <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>My Extra Lecture Requests ({extraRequests.length})</span>
                </h4>
                <span className="text-[11px] text-[#64748B]">
                  Approved extra lectures appear in VoIP schedule without altering the permanent VIERP timetable
                </span>
              </div>

              {extraRequests.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                  No extra lecture requests submitted. Click "+ Request Extra Lecture" above to schedule a special session.
                </div>
              ) : (
                <div className="space-y-2">
                  {extraRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs flex-wrap hover:border-[#CBD5E1] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#0D9488] px-2 py-0.5 rounded bg-white border border-[#E2E8F0]">
                          {req.subject?.code}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A]">{req.subject?.name}</span>
                            <span className="text-[11px] text-[#64748B]">
                              ({req.division?.name} • {req.roomNumber})
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Date: <span className="font-medium text-[#0F172A]">{new Date(req.date).toLocaleDateString()}</span> • Time: <span className="font-mono">{req.startTime} – {req.endTime}</span> • Reason: <em>"{req.reason}"</em>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                          req.status === 'APPROVED'
                            ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                            : req.status === 'REJECTED'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                            : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        }`}
                      >
                        {req.status === 'APPROVED'
                          ? '✓ Approved'
                          : req.status === 'REJECTED'
                          ? '✕ Rejected'
                          : '⧗ Pending Admin Review'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: COURSE MATERIALS & RESOURCES ==================== */}
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

      {/* ==================== SUB-TAB 3: ASSIGNMENT REVIEW & GRADING ==================== */}
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
              <div className="p-8 text-center text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <FileCheck className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#0F172A]">No submissions match the filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold uppercase text-[10px] tracking-wider border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">PRN Number</th>
                      <th className="py-2.5 px-3">Coursework</th>
                      <th className="py-2.5 px-3">Attached File</th>
                      <th className="py-2.5 px-3">Submitted At</th>
                      <th className="py-2.5 px-3 text-right">Academic Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#0F172A]">
                          {sub.studentName}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#64748B]">
                          {sub.prnNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-semibold text-[#0D9488] mr-1.5">
                            {sub.subjectCode}
                          </span>
                          <span className="text-[#334155]">{sub.assignmentTitle}</span>
                        </td>
                        <td className="py-3 px-3">
                          {sub.fileUrl ? (
                            <span className="font-mono text-[11px] text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#99F6E4]">
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
                              className="px-2.5 py-1 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
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
