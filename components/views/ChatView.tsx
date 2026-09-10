'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Hash,
  Search,
  Users,
  Paperclip,
  Send,
  AtSign,
  Smile,
  CheckCheck,
  Clock,
  AlertCircle,
  Sparkles,
  RefreshCw,
  User,
  MessageSquare,
  FileText,
  Download,
  X,
  GraduationCap,
  ChevronRight,
  Radio,
} from 'lucide-react'
import type { EnrolledSubject, StudentProfile } from '@/types/dashboard'

interface Sender {
  id: string
  name: string
  role: string
  email: string
  prnNumber?: string | null
}

interface ApiMessage {
  id: string
  content: string
  fileUrl?: string | null
  createdAt: string
  senderId: string
  sender: Sender
  isOptimistic?: boolean
  isFailed?: boolean
}

interface ChannelItem {
  id: string
  slug: string
  code: string
  label: string
  topic: string
  faculty: string
  memberCount: number
  unreadCount?: number
  isCohort?: boolean
}

interface FacultyContact {
  id: string
  name: string
  role: string
  email: string
  online: boolean
  subjects: string
  cabin: string
  lastMessageTime?: string
  lastMessageSnippet?: string
}

interface ChatViewProps {
  enrolledSubjects?: EnrolledSubject[]
  profile?: StudentProfile | null
}

const CLASS_GROUPS: ChannelItem[] = [
  {
    id: 'channel-te-comp-div-a',
    slug: 'te-comp-div-a',
    code: 'DIV-A',
    label: '#te-comp-div-a',
    topic: 'TE Computer Engineering - Division A Cohort',
    faculty: 'Prof. Rajesh Kulkarni & Div A Faculty',
    memberCount: 68,
    unreadCount: 2,
    isCohort: true,
  },
  {
    id: 'channel-cs501',
    slug: 'te-diva-os',
    code: 'CS501',
    label: '#TE-DivA-OperatingSystems',
    topic: "Deadlock Avoidance & Banker's Algorithm",
    faculty: 'Prof. Rajesh Kulkarni',
    memberCount: 64,
  },
  {
    id: 'channel-cs502',
    slug: 'te-diva-dbms',
    code: 'CS502',
    label: '#TE-DivA-DatabaseManagementSystems',
    topic: 'B+ Tree Indexing & 2PL Concurrency Control',
    faculty: 'Prof. Rajesh Kulkarni',
    memberCount: 64,
  },
  {
    id: 'channel-cs503',
    slug: 'te-diva-cn',
    code: 'CS503',
    label: '#TE-DivA-ComputerNetworks',
    topic: 'TCP/IP Protocol Suite & Wireshark Labs',
    faculty: 'Prof. Rajesh Kulkarni',
    memberCount: 64,
  },
]

const FACULTY_MENTORS: FacultyContact[] = [
  {
    id: 'faculty-rajesh-kulkarni',
    name: 'Prof. Rajesh Kulkarni',
    role: 'Associate Professor & HOD Mentor',
    email: 'rajesh.kulkarni@college.edu',
    online: true,
    subjects: 'OS • DBMS • CN',
    cabin: 'Cabin 302, 3rd Floor',
    lastMessageTime: '10:45 AM',
    lastMessageSnippet: 'Great. Make sure to review the attached notes beforehand.',
  },
]

function formatMessageTime(isoString?: string) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getSenderColor(role: string, name: string) {
  if (role === 'FACULTY' || name.includes('Prof.')) return '#0D9488'
  if (name.includes('Aditya')) return '#0D9488'
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return colors[hash % colors.length]
}

function getSenderInitials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function ChatView({ enrolledSubjects, profile }: ChatViewProps) {
  // Navigation mode: 'channel' | 'direct'
  const [chatMode, setChatMode] = useState<'channel' | 'direct'>('channel')
  const [activeChannelId, setActiveChannelId] = useState<string>('channel-te-comp-div-a')
  const [activeInstructorId, setActiveInstructorId] = useState<string>(FACULTY_MENTORS[0].id)
  const [instructors, setInstructors] = useState<FacultyContact[]>(FACULTY_MENTORS)

  // Messages & Stream State
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [inputText, setInputText] = useState('')
  const [attachedFile, setAttachedFile] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeChannel =
    CLASS_GROUPS.find((c) => c.id === activeChannelId || c.slug === activeChannelId) ||
    CLASS_GROUPS[0]

  const activeInstructor =
    instructors.find((f) => f.id === activeInstructorId) || instructors[0]

  const filteredChannels = CLASS_GROUPS.filter(
    (ch) =>
      ch.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  // Fetch Faculty Contacts & dynamic IDs from database
  useEffect(() => {
    const fetchFacultyContacts = async () => {
      try {
        const res = await fetch('/api/messages/direct')
        if (res.ok) {
          const data = await res.json()
          if (data.contacts && data.contacts.length > 0) {
            const mapped: FacultyContact[] = data.contacts.map((c: any) => ({
              id: c.id,
              name: c.name,
              role:
                c.role === 'STUDENT'
                  ? `Student • PRN: ${c.prnNumber || '22110482'}`
                  : 'Faculty • Computer Engineering',
              email: c.email,
              online: true,
              subjects: c.role === 'STUDENT' ? 'TE Comp • Div A' : 'OS • DBMS • CN',
              cabin: c.role === 'STUDENT' ? `PRN: ${c.prnNumber || '22110482'}` : 'Cabin 302, 3rd Floor',
              lastMessageTime: c.lastMessage ? formatMessageTime(c.lastMessage.createdAt) : '10:45 AM',
              lastMessageSnippet: c.lastMessage ? c.lastMessage.content : (c.role === 'STUDENT' ? 'Academic inquiry thread' : 'Office hours: 3:30 PM today'),
            }))
            setInstructors(mapped)
            if (mapped[0]) {
              setActiveInstructorId(mapped[0].id)
            }
          }
        }
      } catch (e) {
        console.error('Failed to load faculty contacts:', e)
      }
    }
    fetchFacultyContacts()
  }, [])

  // Fetch messages based on active mode
  const loadMessages = async () => {
    try {
      setLoadingMessages(true)
      setFetchError(null)

      if (chatMode === 'channel') {
        const res = await fetch(`/api/channels/${activeChannel.id}/messages`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setMessages(data.messages || [])
      } else {
        const res = await fetch(`/api/messages/direct?recipientId=${activeInstructor.id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setFetchError(err?.message || 'Failed to load conversation')
    } finally {
      setLoadingMessages(false)
      setTimeout(() => scrollToBottom(false), 60)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [chatMode, activeChannelId, activeInstructorId])

  useEffect(() => {
    scrollToBottom(true)
  }, [messages.length])

  // Handle message submission with Optimistic UI update
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const content = inputText.trim()
    if ((!content && !attachedFile) || isSending) return

    const tempId = `temp-${Date.now()}`
    const currentUserName = profile?.name || (profile?.role === 'FACULTY' ? 'Prof. Rajesh Kulkarni' : 'Aditya Sharma')
    const currentUserEmail = profile?.email || (profile?.role === 'FACULTY' ? 'rajesh.kulkarni@college.edu' : 'aditya@college.edu')
    const currentUserPrn = profile?.prnNumber || (profile?.role === 'FACULTY' ? 'FAC-COMP-01' : '22110482')

    // 1. Optimistic message render
    const optimisticMessage: ApiMessage = {
      id: tempId,
      content: content || 'Shared an attachment',
      fileUrl: attachedFile,
      createdAt: new Date().toISOString(),
      senderId: profile?.id || 'self',
      sender: {
        id: profile?.id || 'self',
        name: currentUserName,
        role: profile?.role || 'STUDENT',
        email: currentUserEmail,
        prnNumber: currentUserPrn,
      },
      isOptimistic: true,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    const fileToSend = attachedFile
    setInputText('')
    setAttachedFile(null)
    setIsSending(true)

    try {
      let res: Response
      if (chatMode === 'channel') {
        res = await fetch(`/api/channels/${activeChannel.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, fileUrl: fileToSend }),
        })
      } else {
        res = await fetch('/api/messages/direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: activeInstructor.id,
            content,
            fileUrl: fileToSend,
          }),
        })
      }

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to post message')
      }

      const data = await res.json()

      // Reconcile optimistic record
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.message : m))
      )
    } catch (err: any) {
      console.error('Error posting message:', err)
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, isFailed: true } : m))
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-4.5rem)] min-h-[580px] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white">
      {/* Segmented Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-[#E2E8F0] flex flex-col bg-[#F8FAFC]">
        {/* Search Bar */}
        <div className="p-3 border-b border-[#E2E8F0]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups & instructors..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D9488] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Channels & Instructors List */}
        <div className="flex-1 overflow-y-auto py-2.5">
          {/* Section 1: Class Groups (WhatsApp Cohort Style) */}
          <div className="px-3 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0D9488]" />
              Class Groups & Cohorts
            </span>
            <span className="text-[9px] font-mono text-[#0D9488] bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#99F6E4] font-bold">
              Div A
            </span>
          </div>

          <div className="space-y-1 px-2">
            {filteredChannels.map((ch) => {
              const isActive = chatMode === 'channel' && ch.id === activeChannel.id
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setChatMode('channel')
                    setActiveChannelId(ch.id)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-[#0D9488]/10 text-[#0D9488] font-semibold shadow-xs border border-[#0D9488]/20'
                      : 'text-[#475569] hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      ch.isCohort
                        ? 'bg-[#0D9488] text-white shadow-xs'
                        : isActive
                        ? 'bg-[#0D9488]/15 text-[#0D9488]'
                        : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    {ch.isCohort ? <Users className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate block leading-tight font-medium">
                        {ch.isCohort ? 'TE Comp Div A' : ch.label.replace('#TE-DivA-', '')}
                      </span>
                      {ch.unreadCount && (
                        <span className="w-4 h-4 rounded-full bg-[#10B981] text-white text-[9px] font-bold flex items-center justify-center">
                          {ch.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#94A3B8] truncate block mt-0.5">
                      {ch.memberCount} members • {ch.code}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Section 2: Direct Messaging */}
          <div className="px-3 mt-5 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#0D9488]" />
              {profile?.role === 'FACULTY' ? 'Student Inquiries (1-on-1 DMs)' : 'Course Instructors (1-on-1 DMs)'}
            </span>
            <span className="text-[9px] font-mono text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
              {profile?.role === 'FACULTY' ? 'Students' : 'Direct'}
            </span>
          </div>

          <div className="space-y-1 px-2">
            {instructors.map((dm) => {
              const isActive = chatMode === 'direct' && dm.id === activeInstructor.id
              return (
                <button
                  key={dm.id}
                  type="button"
                  onClick={() => {
                    setChatMode('direct')
                    setActiveInstructorId(dm.id)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-[#0D9488]/10 text-[#0D9488] font-semibold shadow-xs border border-[#0D9488]/20'
                      : 'text-[#475569] hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-[#0D9488] shadow-xs">
                      {getSenderInitials(dm.name)}
                    </div>
                    {dm.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F172A] truncate block leading-tight">
                        {dm.name}
                      </span>
                      {dm.lastMessageTime && (
                        <span className="text-[9px] text-[#94A3B8] font-mono">
                          {dm.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#64748B] truncate block mt-0.5">
                      {dm.lastMessageSnippet || dm.subjects}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* User Status Bar */}
        <div className="p-3 border-t border-[#E2E8F0] bg-white flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-xs font-semibold">
            {profile?.name ? getSenderInitials(profile.name) : 'AS'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#0F172A] truncate">
              {profile?.name || 'Aditya Sharma'}
            </div>
            <div className="text-[10px] text-[#10B981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {profile?.role === 'FACULTY'
                ? 'Online • Faculty (Instructor)'
                : `Online • PRN ${profile?.prnNumber || '22110482'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Message Stream Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Top Header */}
        <div className="h-14 border-b border-[#E2E8F0] px-5 flex items-center justify-between flex-shrink-0 bg-white/90 backdrop-blur-sm">
          {chatMode === 'channel' ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                {activeChannel.isCohort ? <Users className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0F172A] truncate">
                    {activeChannel.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                    {activeChannel.code}
                  </span>
                  {activeChannel.isCohort && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      Official Division Cohort
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] truncate">
                  {activeChannel.topic} • {activeChannel.faculty}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                  {getSenderInitials(activeInstructor.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0F172A] truncate">
                    {activeInstructor.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    {profile?.role === 'FACULTY' ? 'Student Inquiry' : 'Faculty Direct Chat'}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] truncate">
                  {profile?.role === 'FACULTY'
                    ? `${activeInstructor.cabin} • Division A • Student Direct Thread`
                    : `${activeInstructor.cabin} • ${activeInstructor.subjects} • Available for Academic Inquiries`}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadMessages}
              title="Refresh messages"
              className="text-[#94A3B8] hover:text-[#0D9488] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin text-[#0D9488]' : ''}`} />
            </button>
            {chatMode === 'channel' ? (
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] bg-[#F8FAFC] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                <Users className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>{activeChannel.memberCount} members</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Faculty Online</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA]/50">
          {loadingMessages ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-[#E2E8F0]" />
                  <div className="space-y-1.5 w-64">
                    <div className="h-3 w-28 bg-[#E2E8F0] rounded" />
                    <div className="h-14 bg-[#E2E8F0] rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] mb-2">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#0F172A]">Failed to load messages</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{fetchError}</p>
              <button
                type="button"
                onClick={loadMessages}
                className="mt-3 px-3 py-1 rounded-lg bg-[#0D9488] text-white text-xs font-medium"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#94A3B8]">
              <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] mb-2">
                {chatMode === 'channel' ? <Users className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
              </div>
              <p className="text-xs font-semibold text-[#0F172A]">
                {chatMode === 'channel'
                  ? `Welcome to ${activeChannel.label}!`
                  : `Conversation with ${activeInstructor.name}`}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5 max-w-xs">
                {chatMode === 'channel'
                  ? 'Official discussion forum for Division A. Share class notes, question assignments, and stay synchronized.'
                  : 'Direct 1-on-1 academic mentoring thread. Inquiries sent here are private between you and the instructor.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser =
                Boolean(profile?.id && msg.sender?.id === profile.id) ||
                Boolean(profile?.email && msg.sender?.email === profile.email) ||
                Boolean(profile?.prnNumber && msg.sender?.prnNumber === profile.prnNumber) ||
                (profile?.role === 'FACULTY'
                  ? (msg.sender?.role === 'FACULTY' || msg.sender?.email === 'rajesh.kulkarni@college.edu')
                  : (msg.sender?.email === 'aditya@college.edu' || msg.sender?.name?.includes('Aditya')))
              const isInstructor =
                msg.sender?.role === 'FACULTY' || msg.sender?.name?.includes('Prof.')
              const senderInitials = getSenderInitials(msg.sender?.name || 'Student')
              const avatarColor = getSenderColor(
                msg.sender?.role || 'STUDENT',
                msg.sender?.name || 'User'
              )

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5 shadow-xs"
                    style={{ background: avatarColor }}
                  >
                    {senderInitials}
                  </div>

                  <div
                    className={`flex flex-col max-w-[78%] ${
                      isCurrentUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {msg.sender?.name || 'User'}
                      </span>
                      {isInstructor && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#ECFDF5] text-[#065F46] font-semibold border border-[#A7F3D0]">
                          Instructor
                        </span>
                      )}
                      <span className="text-[10px] text-[#94A3B8] font-mono">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed shadow-xs transition-all ${
                        isCurrentUser
                          ? 'bg-[#0D9488] text-white rounded-tr-none'
                          : isInstructor
                          ? 'bg-[#F0FDFA] border border-[#99F6E4] text-[#0F172A] rounded-tl-none'
                          : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-tl-none'
                      } ${msg.isOptimistic ? 'opacity-70' : 'opacity-100'}`}
                    >
                      {/* Attached Document Card */}
                      {msg.fileUrl && (
                        <div
                          className={`mb-2 p-2 rounded-lg flex items-center justify-between gap-3 border ${
                            isCurrentUser
                              ? 'bg-white/15 border-white/30 text-white'
                              : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`p-1.5 rounded ${
                                isCurrentUser ? 'bg-white/20' : 'bg-[#F1F5F9] text-[#0D9488]'
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold truncate block">
                                {msg.fileUrl}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  isCurrentUser ? 'text-white/80' : 'text-[#64748B]'
                                }`}
                              >
                                Verified Course Document
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Downloading attachment: ${msg.fileUrl}`)}
                            title="Download attachment"
                            className={`p-1.5 rounded-md hover:scale-105 transition-all ${
                              isCurrentUser
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {msg.content}
                    </div>

                    {/* Delivery Indicator */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[#94A3B8]">
                      {msg.isOptimistic ? (
                        <span className="text-[10px] text-[#0D9488] italic">Sending...</span>
                      ) : msg.isFailed ? (
                        <span className="text-[10px] text-[#EF4444] font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Failed to send
                        </span>
                      ) : isCurrentUser ? (
                        <>
                          <span>Delivered</span>
                          <CheckCheck className="w-3 h-3 text-[#0D9488]" />
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar with File Attachment Support */}
        <div className="p-3.5 border-t border-[#E2E8F0] bg-white flex-shrink-0">
          {/* File Attachment Pill Preview */}
          {attachedFile && (
            <div className="mb-2 flex items-center justify-between bg-[#F0FDFA] border border-[#99F6E4] px-3 py-1.5 rounded-lg text-xs text-[#0F766E] animate-in fade-in">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0D9488]" />
                <span className="font-medium">Attached: {attachedFile}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-[#94A3B8] hover:text-[#EF4444] p-0.5 rounded transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setAttachedFile(file.name)
              }
            }}
            className="hidden"
            accept=".pdf,.docx,.c,.cpp,.sql,.xlsx,.zip"
          />

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#0D9488] focus-within:ring-1 focus-within:ring-[#0D9488] rounded-xl px-3 py-2 transition-all shadow-inner"
          >
            {/* Paperclip Button */}
            <button
              type="button"
              title="Attach File (PDF, Code, Notes)"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click()
                } else {
                  setAttachedFile('Lab4_Bankers_Report_Aditya.pdf')
                }
              }}
              className="text-[#94A3B8] hover:text-[#0D9488] transition-colors p-1"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Quick simulated file tags if no file chosen yet */}
            {!attachedFile && (
              <button
                type="button"
                onClick={() => setAttachedFile('Deadlock_Verification_Notes.pdf')}
                title="Quick attach notes"
                className="text-[10px] font-mono text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] px-1.5 py-0.5 rounded border border-[#99F6E4] transition-colors"
              >
                + notes.pdf
              </button>
            )}

            <button
              type="button"
              title="Mention Faculty / Peer"
              onClick={() => setInputText((prev) => prev + '@Prof. Rajesh Kulkarni ')}
              className="text-[#94A3B8] hover:text-[#0D9488] transition-colors p-1"
            >
              <AtSign className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Add Emoji"
              onClick={() => setInputText((prev) => prev + '👍 ')}
              className="text-[#94A3B8] hover:text-[#0D9488] transition-colors p-1"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                chatMode === 'channel'
                  ? `Message ${activeChannel.label}... (Press Enter to post)`
                  : `Direct message to ${activeInstructor.name}...`
              }
              className="flex-1 bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none px-2 py-1"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedFile) || isSending}
              title="Send Message"
              className={`h-8 px-3.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                (inputText.trim() || attachedFile) && !isSending
                  ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-xs active:scale-95'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-1.5 px-1">
            <span>
              {chatMode === 'channel'
                ? 'Division cohort discussion stream • Persistent PostgreSQL storage'
                : '1-on-1 direct channel with instructor • End-to-end faculty mentoring'}
            </span>
            <span className="font-mono text-[#0D9488]">
              {messages.length} messages archived
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
