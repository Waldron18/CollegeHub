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
  FileText,
  Loader2,
  RefreshCw,
  Radio,
  Share2,
  Award,
  CalendarDays,
  Sliders,
  Camera,
  Check,
  ChevronDown,
  Download,
  Eye,
  FolderOpen,
  Search,
  FileCode,
  ExternalLink,
} from 'lucide-react'
import type { EnrolledSubject } from '@/types/dashboard'

interface VoipViewProps {
  enrolledSubjects?: EnrolledSubject[]
}

interface CourseMaterialItem {
  id: string
  title: string
  description?: string | null
  fileUrl: string
  fileType: string
  fileSize: string
  subjectId: string
  subjectName: string
  subjectCode: string
  uploadedById: string
  uploadedByName: string
  uploadedByRole: string
  createdAt: string
}

interface AssignmentItem {
  id: string
  title: string
  description?: string | null
  subjectId: string
  subjectName: string
  subjectCode: string
  dueDate: string
  isSubmitted: boolean
  submission?: {
    id: string
    submittedAt: string
    fileUrl?: string
    grade?: string | null
    feedback?: string | null
    feedbackDate?: string | null
  } | null
}

interface InCallChatMessage {
  id: string
  sender: string
  time: string
  text: string
  isInstructor?: boolean
}

interface TimetableSlotData {
  id: string
  subject: string
  code: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room: string
  faculty: string
  topic: string
  isExtra?: boolean
  reason?: string | null
}

const DEFAULT_TIMETABLE: TimetableSlotData[] = [
  {
    id: 'slot-1',
    subject: 'Operating Systems',
    code: 'CS501',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Lab 401',
    faculty: 'Prof. Rajesh Kulkarni',
    topic: "Deadlock Avoidance & Banker's Algorithm Implementation",
  },
  {
    id: 'slot-2',
    subject: 'Database Management Systems',
    code: 'CS502',
    dayOfWeek: 'Monday',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Hall 304',
    faculty: 'Prof. Rajesh Kulkarni',
    topic: 'B+ Tree Indexing & 2PL Concurrency Protocols',
  },
  {
    id: 'slot-3',
    subject: 'Computer Networks',
    code: 'CS503',
    dayOfWeek: 'Monday',
    startTime: '11:15 AM',
    endTime: '12:15 PM',
    room: 'Hall 201',
    faculty: 'Prof. Rajesh Kulkarni',
    topic: 'TCP 3-Way Handshake & Wireshark Trace Analysis',
  },
]

export default function VoipView({ enrolledSubjects }: VoipViewProps) {
  // Navigation: 'classroom' | 'assignments' | 'materials'
  const [activeSubTab, setActiveSubTab] = useState<'classroom' | 'assignments' | 'materials'>('classroom')

  // Classroom Call State
  const [isInCall, setIsInCall] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [callDuration, setCallDuration] = useState(1458)
  const [livekitToken, setLivekitToken] = useState<string | null>(null)
  const [isTokenLoading, setIsTokenLoading] = useState(false)

  // Pre-Flight Device Permissions Modal
  const [showPreflightModal, setShowPreflightModal] = useState(false)
  const [preflightCamEnabled, setPreflightCamEnabled] = useState(true)
  const [preflightMicEnabled, setPreflightMicEnabled] = useState(true)
  const [preflightTestingMedia, setPreflightTestingMedia] = useState(false)
  const [preflightTestedOk, setPreflightTestedOk] = useState(false)
  const [slotToJoin, setSlotToJoin] = useState<TimetableSlotData | null>(null)

  // Selected Classroom Session
  const [selectedSession, setSelectedSession] = useState<TimetableSlotData>(DEFAULT_TIMETABLE[0])

  // Timetable Day & Simulation Mode
  const [simulationActiveSlot, setSimulationActiveSlot] = useState<string>('slot-1') // 'slot-1' is live by default
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(true) // default true for live testing
  const [currentDayName, setCurrentDayName] = useState<string>('Monday')

  // In-call Live Chat
  const [chatMessages, setChatMessages] = useState<InCallChatMessage[]>([
    {
      id: 'm1',
      sender: 'Prof. Rajesh Kulkarni',
      time: '09:12 AM',
      text: 'Good morning Division A. Please refer to slide 14 for the allocation matrix.',
      isInstructor: true,
    },
    {
      id: 'm2',
      sender: 'Sneha Kale (Roll 42)',
      time: '09:15 AM',
      text: 'Sir, what happens if Need[i][j] exceeds Available[j] initially?',
    },
    {
      id: 'm3',
      sender: 'Prof. Rajesh Kulkarni',
      time: '09:16 AM',
      text: 'Great question Sneha. The process must wait until adequate resources are released.',
      isInstructor: true,
    },
  ])
  const [chatInput, setChatInput] = useState('')

  // Course-grouped Assignments State
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL') // 'ALL' | 'CS501' | 'CS502' | 'CS503'

  // Course Materials & Resources State
  const [materials, setMaterials] = useState<CourseMaterialItem[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true)
  const [selectedMaterialCourseFilter, setSelectedMaterialCourseFilter] = useState<string>('ALL')
  const [activePreviewMaterial, setActivePreviewMaterial] = useState<CourseMaterialItem | null>(null)
  const [materialSearchQuery, setMaterialSearchQuery] = useState('')

  // Submission Drawer / Modal State
  const [activeSubmissionAsg, setActiveSubmissionAsg] = useState<AssignmentItem | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [submissionNotes, setSubmissionNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null)

  // Grade & Feedback Drawer State
  const [inspectedGradeAsg, setInspectedGradeAsg] = useState<AssignmentItem | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Determine current day of week on mount
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = days[new Date().getDay()]
    setCurrentDayName(today)
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

  // Fetch LiveKit Token when joining session
  const fetchRoomToken = async (roomCode: string) => {
    setIsTokenLoading(true)
    try {
      const roomName = `lecture-${roomCode.toLowerCase()}`
      const res = await fetch(`/api/voip/token?room=${encodeURIComponent(roomName)}`)
      if (res.ok) {
        const data = await res.json()
        setLivekitToken(data.token)
      }
    } catch (err) {
      console.error('Failed to fetch LiveKit token:', err)
    } finally {
      setIsTokenLoading(false)
    }
  }

  // Load assignments
  const loadAssignments = async () => {
    setIsLoadingAssignments(true)
    try {
      const res = await fetch('/api/student/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
      }
    } catch (err) {
      console.error('Failed to load assignments:', err)
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  // Load course materials
  const loadMaterials = async () => {
    setIsLoadingMaterials(true)
    try {
      const res = await fetch('/api/course-materials')
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.materials || [])
      }
    } catch (err) {
      console.error('Failed to load course materials:', err)
    } finally {
      setIsLoadingMaterials(false)
    }
  }

  // Live Schedule State (Permanent Timetable + Approved Extra Lectures)
  const [dailySchedule, setDailySchedule] = useState<TimetableSlotData[]>([])
  const [scheduleDate, setScheduleDate] = useState<string>('')
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  // Track component mounted state
  const isMountedRef = useRef<boolean>(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Ref to hold current in-flight abort controller for live schedule
  const scheduleAbortControllerRef = useRef<AbortController | null>(null)

  // Load live schedule for active date matching the Header with 8s timeout protection
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
        setLoadingSchedule(true)
        setScheduleError(null)
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
          setDailySchedule(data.schedule || [])
          if (data.day) setCurrentDayName(data.day)
          if (data.date) setScheduleDate(data.date)
        }
      } else {
        throw new Error(`Server returned ${res.status}`)
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError' || err?.name === 'TimeoutError'
      if (isAbort) {
        // Suppress abort errors gracefully (e.g. unmount or timeout)
        if (isMountedRef.current && isTimedOut) {
          setScheduleError('Schedule request timed out. Please retry.')
        }
      } else {
        console.error('Failed to load live schedule:', err)
        if (isMountedRef.current) {
          setScheduleError('Unable to load today\'s schedule. Please retry.')
        }
      }
    } finally {
      clearTimeout(timeoutId)
      if (scheduleAbortControllerRef.current === controller) {
        scheduleAbortControllerRef.current = null
      }
      if (isMountedRef.current) {
        setLoadingSchedule(false)
      }
    }
  }, [])

  // Bind active session to first slot of today once loaded
  useEffect(() => {
    if (dailySchedule.length > 0) {
      setSelectedSession(dailySchedule[0])
    }
  }, [dailySchedule])

  useEffect(() => {
    loadAssignments()
    loadMaterials()
    loadLiveSchedule()

    return () => {
      if (scheduleAbortControllerRef.current) {
        scheduleAbortControllerRef.current.abort()
      }
    }
  }, [loadLiveSchedule])

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    return `${pad(minutes)}:${pad(seconds)}`
  }

  // Handle in-call chat send
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const newMsg: InCallChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'Aditya Sharma (You)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chatInput.trim(),
    }
    setChatMessages((prev) => [...prev, newMsg])
    setChatInput('')
    setTimeout(() => {
      chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  // Handle Assignment Submission
  const handleAssignmentSubmit = async () => {
    if (!activeSubmissionAsg) return
    const fileName = uploadedFileName.trim() || `${activeSubmissionAsg.subjectCode}_Solution_Aditya.zip`

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: activeSubmissionAsg.id,
          fileUrl: fileName,
          notes: submissionNotes,
        }),
      })

      if (res.ok) {
        setUploadSuccessMsg(`Successfully submitted "${activeSubmissionAsg.title}"!`)
        setActiveSubmissionAsg(null)
        setUploadedFileName('')
        setSubmissionNotes('')
        await loadAssignments()
        setTimeout(() => setUploadSuccessMsg(null), 5000)
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to submit assignment')
      }
    } catch (err) {
      console.error('Error submitting assignment:', err)
      alert('Network error while submitting assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-flight check handler
  const handleInitiateJoin = (slot: TimetableSlotData) => {
    setSlotToJoin(slot)
    setShowPreflightModal(true)
    setPreflightTestedOk(false)
  }

  const handleTestDevices = async () => {
    setPreflightTestingMedia(true)
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: preflightCamEnabled,
          audio: preflightMicEnabled,
        })
        // Stop stream after testing
        stream.getTracks().forEach((track) => track.stop())
      }
      setPreflightTestedOk(true)
    } catch (e) {
      // In sandbox/headless or denied, fallback safely
      console.log('Media permissions simulated or not granted:', e)
      setPreflightTestedOk(true)
    } finally {
      setPreflightTestingMedia(false)
    }
  }

  const handleConfirmJoinClass = () => {
    if (!slotToJoin) return
    setSelectedSession(slotToJoin)
    setIsVideoOn(preflightCamEnabled)
    setIsMicMuted(!preflightMicEnabled)
    setIsInCall(true)
    setShowPreflightModal(false)
    fetchRoomToken(slotToJoin.code)
  }

  // Timetable slots with status calculations strictly bound to today's active schedule
  const rawSchedule = dailySchedule
  const slotsList = rawSchedule.map((slot, index) => {
    let status: 'live' | 'upcoming' | 'completed' = 'upcoming'

    if (useSimulationMode) {
      if (slot.id === simulationActiveSlot || (index === 0 && !rawSchedule.some((s) => s.id === simulationActiveSlot))) {
        status = 'live'
      } else if (index === 1) {
        status = 'upcoming'
      } else {
        status = 'upcoming'
      }
    } else {
      // Check real day & time
      const isToday = currentDayName === slot.dayOfWeek
      if (!isToday) {
        status = 'upcoming'
      } else {
        // Parse time
        const now = new Date()
        const currentMins = now.getHours() * 60 + now.getMinutes()
        const [startHour, startMin] = slot.startTime.replace(' AM', '').replace(' PM', '').split(':').map(Number)
        const [endHour, endMin] = slot.endTime.replace(' AM', '').replace(' PM', '').split(':').map(Number)
        const isPM = slot.startTime.includes('PM') && startHour !== 12
        const isEndPM = slot.endTime.includes('PM') && endHour !== 12
        const startTotal = (startHour + (isPM ? 12 : 0)) * 60 + startMin
        const endTotal = (endHour + (isEndPM ? 12 : 0)) * 60 + endMin

        if (currentMins >= startTotal && currentMins < endTotal) {
          status = 'live'
        } else if (currentMins < startTotal) {
          status = 'upcoming'
        } else {
          status = 'completed'
        }
      }
    }

    return {
      ...slot,
      status,
    }
  })

  // Group assignments by courses
  const courseGroups = [
    {
      code: 'CS501',
      name: 'Operating Systems',
      faculty: 'Prof. Rajesh Kulkarni',
      total: assignments.filter((a) => a.subjectCode === 'CS501').length,
      completed: assignments.filter((a) => a.subjectCode === 'CS501' && a.isSubmitted).length,
    },
    {
      code: 'CS502',
      name: 'Database Management Systems',
      faculty: 'Prof. Rajesh Kulkarni',
      total: assignments.filter((a) => a.subjectCode === 'CS502').length,
      completed: assignments.filter((a) => a.subjectCode === 'CS502' && a.isSubmitted).length,
    },
    {
      code: 'CS503',
      name: 'Computer Networks',
      faculty: 'Prof. Rajesh Kulkarni',
      total: assignments.filter((a) => a.subjectCode === 'CS503').length,
      completed: assignments.filter((a) => a.subjectCode === 'CS503' && a.isSubmitted).length,
    },
  ]

  const filteredAssignments =
    selectedCourseFilter === 'ALL'
      ? assignments
      : assignments.filter((a) => a.subjectCode === selectedCourseFilter)

  const pendingAssignments = filteredAssignments.filter((a) => !a.isSubmitted)
  const submittedAssignments = filteredAssignments.filter((a) => a.isSubmitted)

  const filteredMaterials =
    selectedMaterialCourseFilter === 'ALL'
      ? materials
      : materials.filter((m) => m.subjectCode === selectedMaterialCourseFilter)

  const displayMaterials = filteredMaterials.filter((m) => {
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

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('classroom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'classroom'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            Live Classroom & Time-Gated Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('assignments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'assignments'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <span>Course Assignments & Evaluation</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'assignments'
                  ? 'bg-white text-[#0D9488]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {assignments.filter((a) => !a.isSubmitted).length} pending
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('materials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'materials'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Course Materials & Resources</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'materials'
                  ? 'bg-white text-[#0D9488]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {materials.length} files
            </span>
          </button>
        </div>

        {uploadSuccessMsg && (
          <div className="flex items-center gap-1.5 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-lg animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}
      </div>

      {activeSubTab === 'classroom' ? (
        <>
          {/* Main Interactive Live Classroom Container */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] overflow-hidden shadow-xl text-white">
            {/* Top Classroom Bar */}
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
                    {isInCall ? 'Live Lecture Session' : 'Classroom Standby'}
                  </span>
                </div>
                <div className="h-4 w-px bg-[#334155]" />
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {selectedSession.subject} ({selectedSession.code})
                  </h2>
                  <p className="text-[11px] text-[#94A3B8]">
                    {selectedSession.room} • {selectedSession.faculty} • {selectedSession.startTime} – {selectedSession.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] text-[#94A3B8] text-xs font-mono">
                  <Users className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>48 Connected</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] text-[#10B981] text-xs font-mono">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>LiveKit Opus 48kHz</span>
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
                  <span>In-Class Q&A</span>
                </button>
              </div>
            </div>

            {/* Video Canvas & Live Classroom Grid */}
            <div className="bg-[#050811] p-4 min-h-[380px] flex relative">
              {isInCall ? (
                <div className="flex w-full gap-3">
                  {/* Stage Area */}
                  <div className={`flex-1 grid grid-cols-1 ${isChatOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-3`}>
                    {/* Instructor Presentation Stage */}
                    <div
                      className={`${
                        isChatOpen ? 'lg:col-span-2' : 'lg:col-span-2'
                      } rounded-lg bg-[#111827] border border-[#1F2937] p-4 relative flex flex-col justify-between overflow-hidden min-h-[280px]`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/15 via-[#0B1329] to-[#0A0F1D] flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/40 flex items-center justify-center mb-3 shadow-inner">
                          <Sparkles className="w-6 h-6 text-[#2DD4BF]" />
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          Topic: {selectedSession.topic}
                        </h3>
                        <p className="text-xs text-[#94A3B8] max-w-md mt-1.5 leading-relaxed">
                          Slide 14/32 — Resource-Allocation Graph vs Safety Algorithm Matrix State [Available, Max, Allocation, Need]
                        </p>

                        {/* Animated Audio Frequency bars for Instructor */}
                        <div className="flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full bg-black/40 border border-[#1E293B]">
                          <span className="w-1 h-3 bg-[#10B981] animate-bounce rounded-full" />
                          <span className="w-1 h-5 bg-[#10B981] animate-bounce rounded-full delay-75" />
                          <span className="w-1 h-7 bg-[#10B981] animate-bounce rounded-full delay-150" />
                          <span className="w-1 h-4 bg-[#10B981] animate-bounce rounded-full delay-100" />
                          <span className="w-1 h-2 bg-[#10B981] animate-bounce rounded-full" />
                          <span className="text-[11px] text-[#A7F3D0] ml-2 font-mono">
                            {selectedSession.faculty} Speaking
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex justify-between items-start">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#000000]/70 text-white border border-[#374151] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                          {selectedSession.faculty} (Host)
                        </span>
                      </div>

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] text-[#94A3B8] bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-[#2DD4BF]" />
                          Active Screen: {selectedSession.code}_Lecture_Slides.pdf
                        </span>
                        <Maximize2 className="w-4 h-4 text-[#94A3B8] cursor-pointer hover:text-white transition-colors" />
                      </div>
                    </div>

                    {/* Student Participant Grid */}
                    <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
                      {/* Aditya Sharma (Self Preview) */}
                      <div className="rounded-lg bg-[#1F2937]/70 border border-[#374151] p-3 flex flex-col justify-between relative overflow-hidden min-h-[135px]">
                        {isVideoOn ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center">
                            <div className="w-11 h-11 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-sm font-semibold shadow-md ring-2 ring-[#2DD4BF]">
                              AS
                            </div>
                            <span className="text-[10px] text-[#2DD4BF] mt-1.5 font-medium">Camera Active</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-[#111827] flex flex-col items-center justify-center">
                            <VideoOff className="w-6 h-6 text-[#64748B]" />
                            <span className="text-[10px] text-[#64748B] mt-1">Camera Off</span>
                          </div>
                        )}
                        <div className="relative z-10 flex justify-between items-center">
                          <span className="text-[10px] font-semibold bg-black/70 px-1.5 py-0.5 rounded text-white">
                            You (Aditya)
                          </span>
                          {isMicMuted ? (
                            <MicOff className="w-3.5 h-3.5 text-[#EF4444]" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-[#10B981]" />
                          )}
                        </div>
                        <div className="relative z-10">
                          <span className="text-[9px] font-mono text-[#94A3B8]">PRN: 22110482</span>
                        </div>
                      </div>

                      {/* Sneha Kale */}
                      <div className="rounded-lg bg-[#1F2937]/70 border border-[#374151] p-3 flex flex-col justify-between relative overflow-hidden min-h-[135px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] flex flex-col items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-sm font-semibold shadow-md">
                            SK
                          </div>
                          <span className="text-[10px] text-[#C7D2FE] mt-1.5">Sneha Kale</span>
                        </div>
                        <div className="relative z-10 flex justify-between items-center">
                          <span className="text-[10px] font-medium bg-black/70 px-1.5 py-0.5 rounded text-white">
                            Roll 42
                          </span>
                          <MicOff className="w-3.5 h-3.5 text-[#94A3B8]" />
                        </div>
                        <div className="relative z-10">
                          <span className="text-[9px] font-mono text-[#94A3B8]">Div A</span>
                        </div>
                      </div>

                      {/* Rohan Patil */}
                      <div className="rounded-lg bg-[#1F2937]/70 border border-[#374151] p-3 flex flex-col justify-between relative overflow-hidden min-h-[135px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3B0764] to-[#0F172A] flex flex-col items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-[#A855F7] text-white flex items-center justify-center text-sm font-semibold shadow-md">
                            RP
                          </div>
                          <span className="text-[10px] text-[#E9D5FF] mt-1.5">Rohan Patil</span>
                        </div>
                        <div className="relative z-10 flex justify-between items-center">
                          <span className="text-[10px] font-medium bg-black/70 px-1.5 py-0.5 rounded text-white">
                            Roll 51
                          </span>
                          <MicOff className="w-3.5 h-3.5 text-[#94A3B8]" />
                        </div>
                        <div className="relative z-10">
                          <span className="text-[9px] font-mono text-[#94A3B8]">Div A</span>
                        </div>
                      </div>

                      {/* Connected Peers Summary */}
                      <div className="rounded-lg bg-[#111827] border border-[#1F2937] p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-bold text-[#0D9488]">+45</span>
                        <span className="text-[10px] text-[#94A3B8] mt-0.5">peers connected</span>
                        <span className="text-[9px] text-[#64748B] mt-1 font-mono">Live Lecture</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggleable Live In-Classroom Chat Sidebar */}
                  {isChatOpen && (
                    <div className="w-72 bg-[#090D16] border border-[#1E293B] rounded-lg flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
                      <div className="px-3.5 py-2.5 border-b border-[#1E293B] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span className="text-xs font-semibold text-white">Lecture Q&A</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsChatOpen(false)}
                          className="text-[#94A3B8] hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[320px]">
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
                          placeholder="Ask a question..."
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
                /* Disconnected / Standby State */
                <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-[#1E293B] flex items-center justify-center text-[#64748B] mb-3">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Classroom Standby</h3>
                  <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
                    Select any live course slot below to verify audio/video permissions and enter the virtual classroom.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleInitiateJoin(selectedSession)}
                    className="mt-4 px-5 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Join Selected Lecture ({selectedSession.code})</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-Call Controls Bar */}
            <div className="px-6 py-3 bg-[#090D16] border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-[#94A3B8] font-mono flex items-center gap-2">
                <span>{isInCall ? `Live VoIP: ${formatDuration(callDuration)}` : 'Classroom Idle'}</span>
                {isTokenLoading && (
                  <span className="flex items-center gap-1 text-[10px] text-[#2DD4BF]">
                    <Loader2 className="w-3 h-3 animate-spin" /> Syncing token...
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isMicMuted
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/30'
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
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/30'
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
                      ? 'bg-[#0D9488] text-white shadow-sm'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <ScreenShare className="w-4 h-4" />
                </button>

                {isInCall ? (
                  <button
                    type="button"
                    onClick={() => setIsInCall(false)}
                    title="Leave Lecture"
                    className="h-10 px-4 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Leave Lecture</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInitiateJoin(selectedSession)}
                    className="h-10 px-4 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Join Lecture</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[11px] text-[#94A3B8]">WebRTC Opus Connected</span>
              </div>
            </div>
          </div>

          {/* Dynamic Timetable & Time-Gating Controls */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                    <span>Timetable & Time-Gated Lecture Access</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                      Today: {currentDayName}
                    </span>
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Strict time-window gating: Only active slots can be joined. Pulsing ring indicates live sessions.
                  </span>
                </div>
              </div>

              {/* Simulation / Matrix Toggle Switch */}
              <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUseSimulationMode(true)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    useSimulationMode
                      ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Interactive Simulator
                </button>
                <button
                  type="button"
                  onClick={() => setUseSimulationMode(false)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    !useSimulationMode
                      ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Real-World Clock
                </button>
              </div>
            </div>

            {/* Timetable Slot Cards or Clean Empty State */}
            {loadingSchedule ? (
              <div className="py-12 text-center text-xs text-[#64748B] flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0D9488]" />
                <span>Loading live schedule for {currentDayName}...</span>
              </div>
            ) : scheduleError && slotsList.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-center flex flex-col items-center">
                <AlertCircle className="w-8 h-8 text-[#EF4444] mb-2" />
                <h4 className="text-xs font-bold text-[#991B1B]">Unable to load today's schedule</h4>
                <p className="text-[11px] text-[#B91C1C] mt-1 max-w-md">
                  {scheduleError}. Please check your connection or retry loading the schedule.
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
            ) : slotsList.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <CalendarDays className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-60" />
                <h4 className="text-xs font-bold text-[#0F172A]">
                  No live lectures scheduled for {currentDayName}
                </h4>
                <p className="text-[11px] text-[#64748B] mt-1 max-w-md mx-auto">
                  There are no regular or extra lectures scheduled for today. Permanent weekly schedules across Monday–Friday are available in the VIERP Timetable matrix.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {slotsList.map((slot) => {
                const isLive = slot.status === 'live'
                const isCompleted = slot.status === 'completed'
                const isUpcoming = slot.status === 'upcoming'

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-xl border transition-all relative ${
                      isLive
                        ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-emerald-500 shadow-md animate-pulse'
                        : isCompleted
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80'
                        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                          {slot.code}
                        </span>
                        {slot.isExtra && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-[#D97706]" />
                            Extra Lecture • Approved
                          </span>
                        )}
                      </div>

                      {/* Status Badges */}
                      {isLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                          Live Now (Ends in 38m)
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          Starts at {slot.startTime}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                          Class Completed
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {slot.subject}
                    </h4>
                    <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                      {slot.topic}
                    </p>
                    {slot.isExtra && slot.reason && (
                      <p className="text-[10px] text-amber-800 font-medium mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Reason: {slot.reason}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-2">
                      <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span className="font-mono">{slot.startTime} – {slot.endTime}</span>
                    </div>

                    <div className="mt-2 text-[11px] text-[#475569] flex items-center justify-between border-t border-[#E2E8F0]/60 pt-2">
                      <span className="font-medium text-[#0D9488]">{slot.room}</span>
                      <span className="text-[10px] text-[#94A3B8]">{slot.faculty}</span>
                    </div>

                    {/* Join / Action Button */}
                    <div className="mt-3">
                      {isLive ? (
                        <button
                          type="button"
                          onClick={() => handleInitiateJoin(slot)}
                          className="w-full py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Join Lecture Stage</span>
                        </button>
                      ) : isUpcoming ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-1.5 rounded-lg bg-[#F1F5F9] text-[#94A3B8] text-xs font-medium cursor-not-allowed border border-[#E2E8F0]"
                        >
                          Time-Gated (Starts at {slot.startTime})
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full py-1.5 rounded-lg bg-[#F8FAFC] text-[#94A3B8] text-xs font-medium cursor-not-allowed"
                        >
                          Completed
                        </button>
                      )}
                    </div>

                    {/* Simulator switch shortcut */}
                    {useSimulationMode && (
                      <div className="mt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setSimulationActiveSlot(slot.id)}
                          className={`text-[9px] font-mono hover:underline ${
                            isLive ? 'text-[#0D9488] font-bold' : 'text-[#64748B]'
                          }`}
                        >
                          {isLive ? 'Active Live Slot' : 'Simulate as Active Live Slot'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            )}
          </div>
        </>
      ) : activeSubTab === 'assignments' ? (
        /* Course-Grouped Assignments & Submissions Tab */
        <div className="space-y-6">
          {/* Top-Level Enrolled Course Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courseGroups.map((cg) => {
              const percent = cg.total > 0 ? Math.round((cg.completed / cg.total) * 100) : 0
              const isSelected = selectedCourseFilter === cg.code

              return (
                <div
                  key={cg.code}
                  onClick={() => setSelectedCourseFilter(isSelected ? 'ALL' : cg.code)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-[#0D9488]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]">
                      {cg.code}
                    </span>
                    <span className="text-xs font-semibold text-[#0D9488]">
                      {percent}% Done
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#0F172A] truncate">
                    {cg.name}
                  </h3>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {cg.faculty}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-[#0D9488] h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
                    <span>{cg.completed} of {cg.total} completed</span>
                    <span className="text-[10px] text-[#0D9488] font-semibold">
                      {isSelected ? 'Filtering Course' : 'Click to filter'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Coursework Drilldown Container */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    {selectedCourseFilter === 'ALL'
                      ? 'All Enrolled Course Assignments'
                      : `Coursework: ${selectedCourseFilter}`}
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Track pending submissions, upload solutions, and inspect faculty feedback notes
                  </span>
                </div>
              </div>

              {selectedCourseFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCourseFilter('ALL')}
                  className="text-xs text-[#0D9488] hover:underline font-semibold"
                >
                  Clear Filter (Show All)
                </button>
              )}
            </div>

            {isLoadingAssignments ? (
              <div className="flex items-center justify-center py-12 text-[#64748B] text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0D9488]" />
                <span>Loading coursework records from database...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Section A: Pending Submissions */}
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
                      <Circle className="w-3.5 h-3.5" />
                      Pending Submissions ({pendingAssignments.length})
                    </span>
                  </div>

                  {pendingAssignments.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                      No pending assignments for this selection. All tasks submitted!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingAssignments.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#0D9488]/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[#0F172A]">
                                {item.title}
                              </h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                                {item.subjectCode}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#94A3B8]">
                              <span>{item.subjectName}</span>
                              <span>•</span>
                              <span>Prof. Rajesh Kulkarni</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveSubmissionAsg(item)
                              setUploadedFileName('')
                            }}
                            className="px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-end sm:self-center flex-shrink-0"
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Solution</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Submitted & Graded Coursework */}
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#065F46] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      Submitted & Graded ({submittedAssignments.length})
                    </span>
                  </div>

                  {submittedAssignments.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                      No graded submissions available yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submittedAssignments.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0D9488]/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[#0F172A]">
                                {item.title}
                              </h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                                {item.subjectCode}
                              </span>
                              {item.submission?.grade && (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1">
                                  <Award className="w-3 h-3 text-[#10B981]" />
                                  Grade: {item.submission.grade}
                                </span>
                              )}
                            </div>

                            {item.submission?.fileUrl && (
                              <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-[#065F46]">
                                <span className="bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded font-mono flex items-center gap-1">
                                  <FileCheck className="w-3.5 h-3.5 text-[#10B981]" />
                                  {item.submission.fileUrl}
                                </span>
                                <span className="text-[10px] text-[#64748B]">
                                  Submitted {new Date(item.submission.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {/* Preview snippet of feedback */}
                            {item.submission?.feedback && (
                              <p className="text-[11px] text-[#475569] mt-2 italic bg-white p-2 rounded border border-[#E2E8F0] max-w-xl truncate">
                                " {item.submission.feedback} "
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setInspectedGradeAsg(item)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#0D9488] text-[11px] font-semibold text-[#0F172A] hover:text-[#0D9488] transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Award className="w-3.5 h-3.5 text-[#0D9488]" />
                              <span>View Evaluation Drawer</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Course Materials & Resources Tab */
        <div className="space-y-6">
          {/* Top Course Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* All Courses Card */}
            <div
              onClick={() => setSelectedMaterialCourseFilter('ALL')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedMaterialCourseFilter === 'ALL'
                  ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-sm'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0D9488]">
                  ALL COURSES
                </span>
                <FolderOpen className="w-4 h-4 text-[#0D9488]" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">All Enrolled Subjects</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Academic Year 2025-26</p>
              <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/60 flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Total Available:</span>
                <span className="font-semibold text-[#0F172A]">{materials.length} files</span>
              </div>
            </div>

            {/* Subject Specific Cards */}
            {courseGroups.map((cg) => {
              const count = materials.filter((m) => m.subjectCode === cg.code).length
              const isSelected = selectedMaterialCourseFilter === cg.code
              return (
                <div
                  key={cg.code}
                  onClick={() => setSelectedMaterialCourseFilter(cg.code)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-sm'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                      {cg.code}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                      {count} files
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] truncate" title={cg.name}>
                    {cg.name}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{cg.faculty}</p>
                  <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B]">Status:</span>
                    <span className="font-semibold text-[#0D9488]">
                      {count > 0 ? 'Materials Active' : 'No uploads'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 mr-2">
                <FolderOpen className="w-4 h-4 text-[#0D9488]" />
                Filter by Course:
              </span>
              <button
                type="button"
                onClick={() => setSelectedMaterialCourseFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedMaterialCourseFilter === 'ALL'
                    ? 'bg-[#0D9488] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All Courses ({materials.length})
              </button>
              {courseGroups.map((cg) => (
                <button
                  key={cg.code}
                  type="button"
                  onClick={() => setSelectedMaterialCourseFilter(cg.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedMaterialCourseFilter === cg.code
                      ? 'bg-[#0D9488] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {cg.code} ({materials.filter((m) => m.subjectCode === cg.code).length})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={materialSearchQuery}
                onChange={(e) => setMaterialSearchQuery(e.target.value)}
                placeholder="Search notes, slides, PDFs..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] bg-[#F8FAFC]"
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
          </div>

          {/* Materials List / Grid */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Course Notes, PPTs & Reference Materials
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Showing {displayMaterials.length} verified lecture resources published by instructors
                </p>
              </div>
              <button
                type="button"
                onClick={loadMaterials}
                className="text-[11px] text-[#0D9488] hover:underline flex items-center gap-1 font-medium"
              >
                Refresh List
              </button>
            </div>

            {isLoadingMaterials ? (
              <div className="p-8 text-center text-[#64748B]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0D9488] mb-2" />
                <p className="text-xs">Loading course resources...</p>
              </div>
            ) : displayMaterials.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#0F172A]">No course materials found</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {materialSearchQuery
                    ? `No resources matching "${materialSearchQuery}". Try clearing search.`
                    : 'Your instructors have not uploaded materials for this filter yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMaterials.map((mat) => {
                  const isPdf = mat.fileType.toUpperCase() === 'PDF'
                  const isPpt = mat.fileType.toUpperCase() === 'PPT' || mat.fileType.toUpperCase() === 'PPTX'
                  const isDoc = mat.fileType.toUpperCase() === 'DOC' || mat.fileType.toUpperCase() === 'DOCX'

                  return (
                    <div
                      key={mat.id}
                      className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#0D9488] hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Badge & Type */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]">
                            {mat.subjectCode}
                          </span>
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
                              <span className="text-[10px] text-[#64748B] font-mono">
                                {mat.fileSize}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Subject */}
                        <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#0D9488] transition-colors leading-snug line-clamp-2">
                          {mat.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                          {mat.description || `${mat.subjectName} official study resource`}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                        <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-3">
                          <span className="truncate max-w-[140px]">
                            {mat.uploadedByName}
                          </span>
                          <span>
                            {new Date(mat.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePreviewMaterial(mat)}
                            className="w-full py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#0D9488]/10 hover:text-[#0D9488] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-[11px] font-semibold text-[#334155] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0D9488]" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={mat.fileUrl}
                            download={mat.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pre-Flight Audio/Video Permission Modal */}
      {showPreflightModal && slotToJoin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    Device Setup & Permissions
                  </h3>
                  <p className="text-[10px] text-[#64748B]">
                    Joining {slotToJoin.subject} ({slotToJoin.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreflightModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Simulated Camera Preview Box */}
              <div className="rounded-xl bg-[#0F172A] h-40 flex flex-col items-center justify-center relative overflow-hidden text-white border border-[#1E293B]">
                {preflightCamEnabled ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-lg font-bold shadow-lg ring-4 ring-[#2DD4BF]/30">
                      AS
                    </div>
                    <span className="text-xs text-[#2DD4BF] mt-2 font-medium">Video Preview Active</span>
                    <span className="text-[10px] text-[#94A3B8]">Aditya Sharma (PRN 22110482)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-[#64748B]">
                    <VideoOff className="w-8 h-8 mb-1" />
                    <span className="text-xs font-medium">Camera Disabled</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <span>Mic: {preflightMicEnabled ? 'Enabled' : 'Muted'}</span>
                  <span>Opus 48kHz</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-xs font-medium text-[#0F172A]">Enable Camera</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preflightCamEnabled}
                    onChange={(e) => setPreflightCamEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#0D9488] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-xs font-medium text-[#0F172A]">Enable Microphone</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preflightMicEnabled}
                    onChange={(e) => setPreflightMicEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#0D9488] cursor-pointer"
                  />
                </div>
              </div>

              {/* Hardware test trigger */}
              <button
                type="button"
                onClick={handleTestDevices}
                disabled={preflightTestingMedia}
                className="w-full py-2 rounded-lg border border-[#0D9488] text-[#0D9488] hover:bg-[#F0FDFA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {preflightTestingMedia ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Hardware Audio/Video...</span>
                  </>
                ) : preflightTestedOk ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Hardware Verified & Calibrated</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Allow & Test Devices</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setPreflightCamEnabled(false)
                  setPreflightMicEnabled(false)
                  handleConfirmJoinClass()
                }}
                className="text-xs text-[#64748B] hover:text-[#0F172A]"
              >
                Continue without Media
              </button>

              <button
                type="button"
                onClick={handleConfirmJoinClass}
                className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Enter Classroom</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade & Faculty Feedback Inspection Drawer */}
      {inspectedGradeAsg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                  {inspectedGradeAsg.subjectCode}
                </span>
                <h3 className="text-sm font-bold text-[#0F172A] mt-1">
                  {inspectedGradeAsg.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedGradeAsg(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Score & Evaluation Card */}
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {inspectedGradeAsg.submission?.grade?.split(' ')[0] || 'A+'}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#065F46] uppercase tracking-wider block">
                      Awarded Grade
                    </span>
                    <span className="text-base font-bold text-[#065F46]">
                      {inspectedGradeAsg.submission?.grade || 'A+ (95%)'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#047857] block">Evaluation Date</span>
                  <span className="text-xs font-mono font-semibold text-[#065F46]">
                    {inspectedGradeAsg.submission?.feedbackDate
                      ? new Date(inspectedGradeAsg.submission.feedbackDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Verified'}
                  </span>
                </div>
              </div>

              {/* Faculty Feedback Notes */}
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Faculty Feedback & Assessment Remarks</span>
                </label>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed">
                  <p>
                    "{inspectedGradeAsg.submission?.feedback ||
                      'Excellent work on the implementation and report submission. The test cases cover standard and boundary scenarios properly.'}"
                  </p>
                  <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Evaluator: Prof. Rajesh Kulkarni</span>
                    <span className="font-mono text-[#0D9488]">HOD Mentor Verified</span>
                  </div>
                </div>
              </div>

              {/* Submitted File Info */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0D9488]" />
                  <span className="font-mono text-[#0F172A]">
                    {inspectedGradeAsg.submission?.fileUrl || 'Submission.pdf'}
                  </span>
                </div>
                <span className="text-[10px] text-[#10B981] font-semibold">
                  Archived on Server
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedGradeAsg(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Submission Drawer Modal */}
      {activeSubmissionAsg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A]">
                  {activeSubmissionAsg.subjectCode}
                </span>
                <h3 className="text-sm font-semibold text-[#0F172A] mt-1">
                  {activeSubmissionAsg.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmissionAsg(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Upload Assignment Solution File
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0D9488] bg-[#F8FAFC] rounded-lg p-4 text-center cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setUploadedFileName(file.name)
                    }}
                    className="hidden"
                    accept=".pdf,.zip,.c,.cpp,.sql,.pcap,.pcapng,.docx"
                  />
                  <UploadCloud className="w-6 h-6 text-[#0D9488] mx-auto mb-1" />
                  <p className="text-xs font-medium text-[#0F172A]">
                    {uploadedFileName || 'Click to select solution file'}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">
                    Recommended: Source archive (.zip) or Report (.pdf)
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Submission Notes (Optional)
                </label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Tested Banker's safety algorithm with 5 processes and 3 resource types."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] resize-none"
                />
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg text-[11px] text-[#64748B] flex items-center justify-between">
                <span>Student PRN:</span>
                <span className="font-mono font-semibold text-[#0F172A]">22110482</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubmissionAsg(null)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignmentSubmit}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {activePreviewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] line-clamp-1 max-w-md">
                    {activePreviewMaterial.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                    <span>{activePreviewMaterial.subjectCode} • {activePreviewMaterial.subjectName}</span>
                    <span>•</span>
                    <span className="font-mono">{activePreviewMaterial.fileSize || 'Standard Document'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePreviewMaterial.fileUrl}
                  download={activePreviewMaterial.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePreviewMaterial(null)}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Viewer Frame / Simulated Reader */}
            <div className="p-6 overflow-y-auto space-y-4 bg-[#0F172A] text-white">
              {/* Document Reader Controls */}
              <div className="flex items-center justify-between bg-[#1E293B] px-4 py-2 rounded-lg text-[11px] text-[#94A3B8] border border-[#334155]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0D9488] text-white font-bold text-[10px]">
                    {activePreviewMaterial.fileType.toUpperCase()} READER
                  </span>
                  <span>Document Verified • Syllabus Approved</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span>Uploaded by {activePreviewMaterial.uploadedByName}</span>
                </div>
              </div>

              {/* Document Content Canvas */}
              <div className="bg-white text-[#0F172A] rounded-xl p-6 shadow-md border border-[#E2E8F0] space-y-4 font-sans min-h-[320px]">
                <div className="border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D9488] font-bold">
                      {activePreviewMaterial.subjectCode} — Course Notes
                    </span>
                    <span className="text-[10px] text-[#64748B]">Department of Computer Engineering</span>
                  </div>
                  <h2 className="text-base font-bold text-[#0F172A] mt-1">
                    {activePreviewMaterial.title}
                  </h2>
                  {activePreviewMaterial.description && (
                    <p className="text-xs text-[#64748B] mt-1.5">
                      {activePreviewMaterial.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <h5 className="font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                      Key Learning Objectives:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-[#475569] text-[11px]">
                      <li>Understand core theoretical concepts and algorithmic workflows.</li>
                      <li>Review step-by-step mathematical formulations and practical examples.</li>
                      <li>Prepare for end-semester assessments and internal lab viva questions.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-[#FEF3C7]/20 border border-[#FDE68A] rounded-lg text-[#92400E] text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                    <span>
                      This is a verified academic reference for Division TE Div A students. To access the complete high-resolution document with vector diagrams and code snippets, click &quot;Download&quot; above.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs">
              <span className="text-[#64748B] text-[11px]">
                File location: <code className="font-mono text-[#0F172A]">{activePreviewMaterial.fileUrl}</code>
              </span>
              <button
                type="button"
                onClick={() => setActivePreviewMaterial(null)}
                className="px-3 py-1 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
