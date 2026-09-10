'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Search,
  CheckCircle,
  Wifi,
  Award,
  FileText,
  FolderOpen,
  Clock,
  CheckCheck,
  CheckCircle2,
  X,
  ChevronRight,
  RotateCcw,
  Sparkles,
  User,
  KeyRound,
  CreditCard,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import type { StudentProfile } from '@/types/dashboard'
import type { ActiveView } from '@/components/Sidebar'
import UserProfileModal from '@/components/profile/UserProfileModal'
import ChangePasswordModal from '@/components/common/ChangePasswordModal'
import VirtualIdCardModal from '@/components/common/VirtualIdCardModal'
import SignOutConfirmModal from '@/components/common/SignOutConfirmModal'

export interface AcademicNotification {
  id: string
  title: string
  message: string
  timestamp: string
  category: 'GRADE' | 'CIRCULAR' | 'RESOURCE' | 'SCHEDULE'
  tagColor: 'emerald' | 'blue' | 'purple' | 'amber'
  read: boolean
  targetView: ActiveView
  actionHint?: string
}

interface HeaderProps {
  currentTime?: string
  profile?: StudentProfile | null
  onNavigate?: (view: ActiveView) => void
}

const DEFAULT_STUDENT_NOTIFICATIONS: AcademicNotification[] = [
  {
    id: 'notif-1',
    title: 'Assignment Graded',
    message: 'Prof. Rajesh Kulkarni graded your Operating Systems Lab 4 (A+ - 95%)',
    timestamp: '15 mins ago',
    category: 'GRADE',
    tagColor: 'emerald',
    read: false,
    targetView: 'voip',
    actionHint: 'View in VoIP > Assignments',
  },
  {
    id: 'notif-2',
    title: 'Campus Circular',
    message: 'Mandatory Academic Orientation for Sem V published by Registrar Office.',
    timestamp: '2 hours ago',
    category: 'CIRCULAR',
    tagColor: 'blue',
    read: false,
    targetView: 'vierp',
    actionHint: 'Read in VIERP Portal',
  },
  {
    id: 'notif-3',
    title: 'New Resource Uploaded',
    message: 'Unit 3 B+ Tree Indexing slides uploaded for DBMS.',
    timestamp: 'Yesterday • 4:15 PM',
    category: 'RESOURCE',
    tagColor: 'purple',
    read: false,
    targetView: 'voip',
    actionHint: 'Open Course Materials',
  },
  {
    id: 'notif-4',
    title: 'Class Reminder',
    message: 'Operating Systems starts at 09:00 AM in Lab 401.',
    timestamp: 'Today • 08:30 AM',
    category: 'SCHEDULE',
    tagColor: 'amber',
    read: true,
    targetView: 'voip',
    actionHint: 'Join Virtual Classroom',
  },
]

const DEFAULT_FACULTY_NOTIFICATIONS: AcademicNotification[] = [
  {
    id: 'notif-f1',
    title: 'Assignment Submission',
    message: "Aditya Sharma and 2 others submitted their Banker's Algorithm code for CS501.",
    timestamp: '20 mins ago',
    category: 'GRADE',
    tagColor: 'emerald',
    read: false,
    targetView: 'voip',
    actionHint: 'Review Submissions',
  },
  {
    id: 'notif-f2',
    title: 'Department Circular',
    message: 'Midterm evaluation ledgers submission deadline announced by Registrar.',
    timestamp: '3 hours ago',
    category: 'CIRCULAR',
    tagColor: 'blue',
    read: false,
    targetView: 'home',
    actionHint: 'Review Circular',
  },
  {
    id: 'notif-f3',
    title: 'Classroom Ready',
    message: 'Hall 304 virtual stage initialized for Database Management Systems lecture.',
    timestamp: 'Today • 09:45 AM',
    category: 'SCHEDULE',
    tagColor: 'amber',
    read: false,
    targetView: 'voip',
    actionHint: 'Enter Live Stage',
  },
]

const DEFAULT_ADMIN_NOTIFICATIONS: AcademicNotification[] = [
  {
    id: 'notif-a1',
    title: 'Fee Collection Update',
    message: 'Aditya Sharma successfully cleared ₹92,000 for Semester V tuition fee.',
    timestamp: '1 hour ago',
    category: 'GRADE',
    tagColor: 'emerald',
    read: false,
    targetView: 'home',
    actionHint: 'Open Ledger',
  },
  {
    id: 'notif-a2',
    title: 'Broadcast Distributed',
    message: 'Campus circular broadcast delivered to TE Computer Engineering divisions.',
    timestamp: '4 hours ago',
    category: 'CIRCULAR',
    tagColor: 'blue',
    read: false,
    targetView: 'home',
    actionHint: 'Broadcast Center',
  },
  {
    id: 'notif-a3',
    title: 'Roster Provisioning',
    message: 'Academic department course allocations synced for Academic Year 2024-25.',
    timestamp: 'Yesterday',
    category: 'RESOURCE',
    tagColor: 'purple',
    read: false,
    targetView: 'home',
    actionHint: 'User Management',
  },
]

export default function Header({ currentTime, profile, onNavigate }: HeaderProps) {
  const router = useRouter()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all')

  const initialNotifications =
    profile?.role === 'ADMIN'
      ? DEFAULT_ADMIN_NOTIFICATIONS
      : profile?.role === 'FACULTY'
      ? DEFAULT_FACULTY_NOTIFICATIONS
      : DEFAULT_STUDENT_NOTIFICATIONS

  const [notifications, setNotifications] = useState<AcademicNotification[]>(initialNotifications)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Profile Menu and Modals State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isVirtualIdOpen, setIsVirtualIdOpen] = useState(false)
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close profile menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileMenuOpen])

  // Reset notifications if role changes
  useEffect(() => {
    const list =
      profile?.role === 'ADMIN'
        ? DEFAULT_ADMIN_NOTIFICATIONS
        : profile?.role === 'FACULTY'
        ? DEFAULT_FACULTY_NOTIFICATIONS
        : DEFAULT_STUDENT_NOTIFICATIONS
    setNotifications(list)
  }, [profile?.role])

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
      }
    }

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsOpen])

  const unreadCount = notifications.filter((n) => !n.read).length

  const displayedNotifications =
    activeFilter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleNotificationClick = (item: AcademicNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    )
    setIsNotificationsOpen(false)
    if (onNavigate && item.targetView) {
      onNavigate(item.targetView)
    }
  }

  const handleResetNotifications = () => {
    const list =
      profile?.role === 'ADMIN'
        ? DEFAULT_ADMIN_NOTIFICATIONS
        : profile?.role === 'FACULTY'
        ? DEFAULT_FACULTY_NOTIFICATIONS
        : DEFAULT_STUDENT_NOTIFICATIONS
    setNotifications(list)
  }

  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const dateStr =
    currentTime ||
    now.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Aditya'
  const displayName = profile?.name || (profile?.role === 'FACULTY' ? 'Prof. Rajesh Kulkarni' : 'Aditya Sharma')
  const userEmail = profile?.email || (profile?.role === 'FACULTY' ? 'rajesh.kulkarni@college.edu' : 'aditya.sharma@college.edu')
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'AS'

  // Academic details formatting
  const rawDivision = profile?.division || 'A'
  const divStr = rawDivision.toLowerCase().includes('div')
    ? rawDivision
    : rawDivision.toLowerCase().includes('te')
    ? `Div ${rawDivision}`
    : `Div TE Div ${rawDivision}`
  const prnStr = profile?.prnNumber || '22110482'
  const semStr = profile?.semester ? `Sem ${profile.semester}` : 'Sem 5'

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white/90 backdrop-blur-xl border-b border-[#E2E8F0] z-40 flex items-center justify-between px-6 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      {/* Left: Two-line Hierarchical Greeting */}
      <div className="flex flex-col justify-center min-w-0">
        {/* Line 1: Bold, prominent greeting + calendar date */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-[#0F172A] tracking-tight leading-tight truncate">
            {profile?.role === 'ADMIN'
              ? `${greeting}, Administrator`
              : profile?.role === 'FACULTY'
              ? `${greeting}, ${profile?.name || 'Prof. Rajesh Kulkarni'}`
              : `${greeting}, ${firstName}`}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-medium border border-[#E2E8F0]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
            {dateStr}
          </span>
        </div>

        {/* Line 2: Subtle, secondary academic details */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] leading-tight mt-0.5 truncate">
          {profile?.role === 'ADMIN' ? (
            <span>Registrar Office • Institutional Governance & Circulars • AY 2024–25</span>
          ) : profile?.role === 'FACULTY' ? (
            <span>
              Dept of {profile?.department || 'Computer Engineering'} • Cabin 412 • EMP-CE-402 • AY 2024–25
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[#475569]">{profile?.department || 'Computer Engineering'}</span>
              <span className="text-[#CBD5E1]">•</span>
              <span>{divStr}</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="font-mono text-[10px] text-[#64748B]">PRN #{prnStr}</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="font-medium text-[#0D9488] bg-[#F0FDFA] px-1.5 py-0.2 rounded border border-[#99F6E4]/50">
                {semStr}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Global Search */}
        <div className="relative flex items-center hidden sm:flex">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            placeholder={
              profile?.role === 'ADMIN'
                ? 'Search accounts, ledgers, or circulars...'
                : profile?.role === 'FACULTY'
                ? 'Search rosters, courses, or files...'
                : 'Search subjects, circulars, or peers...'
            }
            className="h-8 pl-8 pr-10 w-56 md:w-64 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] shadow-sm transition-all"
          />
          <kbd className="absolute right-2 px-1 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-white border border-[#E2E8F0] rounded shadow-inner">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell with Interactive Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            title="Academic Notifications"
            aria-expanded={isNotificationsOpen}
            className={`relative h-8 w-8 flex items-center justify-center rounded-lg border shadow-sm transition-all ${
              isNotificationsOpen
                ? 'bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] ring-2 ring-[#0D9488]/20'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in-50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown Drawer */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[85vh]">
              {/* Popover Header */}
              <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    Academic Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-[#F1F5F9] text-[#64748B]">
                      All caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="px-2 py-1 rounded text-[11px] font-semibold text-[#0D9488] hover:bg-[#0D9488]/10 flex items-center gap-1 transition-colors"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-header Filter Tabs */}
              <div className="px-4 py-2 bg-white border-b border-[#F1F5F9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      activeFilter === 'all'
                        ? 'bg-[#0F172A] text-white'
                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('unread')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      activeFilter === 'unread'
                        ? 'bg-[#0D9488] text-white'
                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="overflow-y-auto divide-y divide-[#F1F5F9] flex-1">
                {displayedNotifications.length === 0 ? (
                  <div className="py-10 px-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981] flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A]">
                      No New Notifications
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-1 max-w-[240px] mx-auto leading-relaxed">
                      You are all caught up with recent evaluation grades, syllabus uploads, and circulars.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetNotifications}
                      className="mt-3.5 px-3 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-[#0D9488]" />
                      <span>Reset Alerts</span>
                    </button>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const isGrade = notif.category === 'GRADE'
                    const isCircular = notif.category === 'CIRCULAR'
                    const isResource = notif.category === 'RESOURCE'
                    const isSchedule = notif.category === 'SCHEDULE'

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start gap-3 relative group ${
                          !notif.read ? 'bg-[#F0FDFA]/40' : 'bg-white'
                        }`}
                      >
                        {/* Unread Accent Indicator */}
                        {!notif.read && (
                          <span className="absolute left-1 top-4 bottom-4 w-1 bg-[#0D9488] rounded-r-full" />
                        )}

                        {/* Category Icon Badge */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-xs ${
                            isGrade
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                              : isCircular
                              ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                              : isResource
                              ? 'bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]'
                              : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                          }`}
                        >
                          {isGrade && <Award className="w-4 h-4" />}
                          {isCircular && <FileText className="w-4 h-4" />}
                          {isResource && <FolderOpen className="w-4 h-4" />}
                          {isSchedule && <Clock className="w-4 h-4" />}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                isGrade
                                  ? 'bg-[#ECFDF5] text-[#065F46]'
                                  : isCircular
                                  ? 'bg-[#EFF6FF] text-[#1E40AF]'
                                  : isResource
                                  ? 'bg-[#FAF5FF] text-[#6B21A8]'
                                  : 'bg-[#FFFBEB] text-[#92400E]'
                              }`}
                            >
                              {notif.category}
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {notif.timestamp}
                            </span>
                          </div>

                          <h4
                            className={`text-xs leading-snug ${
                              !notif.read
                                ? 'font-bold text-[#0F172A]'
                                : 'font-medium text-[#334155]'
                            }`}
                          >
                            {notif.title}
                          </h4>

                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Action Hint */}
                          {notif.actionHint && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#0D9488] group-hover:translate-x-0.5 transition-transform">
                              <span>{notif.actionHint}</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Unread dot */}
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-[#0D9488] flex-shrink-0 mt-1.5 ring-2 ring-[#0D9488]/20" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Campus Academic Feed • Live Sync</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetNotifications}
                  className="hover:text-[#0D9488] transition-colors"
                >
                  Reset Demo Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Badges for Admin and Faculty */}
        {profile?.role === 'ADMIN' && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF4FF] border border-[#F5D0FE] text-[#A21CAF] text-[11px] font-medium shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 text-[#C026D3]" />
            <span>Institutional Administration • Registrar Portal</span>
          </div>
        )}
        {profile?.role === 'FACULTY' && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] text-[11px] font-medium shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Faculty Workspace • Active</span>
          </div>
        )}

        {/* Wi-Fi Pill */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] text-[11px] font-medium shadow-sm">
          <Wifi className="w-3.5 h-3.5 text-[#0D9488]" />
          <span className="font-mono text-[10px]">VIIT-Mesh: 120 Mbps</span>
        </div>

        {/* Profile Dropdown Utility */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-expanded={isProfileMenuOpen}
            title="User Profile Menu"
            className={`h-8.5 pl-1.5 pr-2.5 rounded-full border shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
              isProfileMenuOpen
                ? 'bg-[#F0FDFA] border-[#0D9488] ring-2 ring-[#0D9488]/20'
                : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
            }`}
          >
            {/* Avatar Circle with Online Dot */}
            <div className="relative flex-shrink-0">
              <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#10B981] flex items-center justify-center text-white text-[10px] font-bold shadow-2xs">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-emerald-500/30" />
            </div>

            <span className="text-xs font-semibold text-[#0F172A] hidden sm:inline-block max-w-[110px] truncate">
              {displayName}
            </span>

            <ChevronDown
              className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-150 ${
                isProfileMenuOpen ? 'rotate-180 text-[#0D9488]' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header User Card */}
              <div className="p-4 bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate leading-tight">
                      {displayName}
                    </h4>
                    <p className="text-[11px] text-[#64748B] truncate leading-tight mt-0.5 font-mono">
                      {userEmail}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4]">
                        {profile?.role === 'ADMIN'
                          ? 'Administrator'
                          : profile?.role === 'FACULTY'
                          ? 'Faculty • CE'
                          : `PRN: ${profile?.prnNumber || '12413586'}`}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                        VIIT Pune
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="p-1.5 space-y-0.5">
                {/* 1. User Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    if (onNavigate) {
                      onNavigate('profile')
                    } else {
                      router.push('/dashboard/profile')
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] group-hover:bg-[#F0FDFA] group-hover:text-[#0D9488] text-[#64748B] flex items-center justify-center transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#0F172A] block leading-tight">User Profile</span>
                      <span className="text-[10px] text-[#94A3B8] block leading-tight">Personal & academic record</span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#0D9488]/10 group-hover:text-[#0D9488] transition-colors">
                    VIERP
                  </span>
                </button>

                {/* 2. Change Password */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    setIsChangePasswordOpen(true)
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] group-hover:bg-[#EFF6FF] group-hover:text-[#2563EB] text-[#64748B] flex items-center justify-center transition-colors">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#0F172A] block leading-tight">Change Password</span>
                      <span className="text-[10px] text-[#94A3B8] block leading-tight">Update portal credentials</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors" />
                </button>

                {/* 3. Virtual ID Card */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    setIsVirtualIdOpen(true)
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] group-hover:bg-[#FAF5FF] group-hover:text-[#7C3AED] text-[#64748B] flex items-center justify-center transition-colors">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#0F172A] block leading-tight">Virtual ID Card</span>
                      <span className="text-[10px] text-[#94A3B8] block leading-tight">College smart identity</span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF5FF] text-[#7C3AED] border border-[#DDD6FE]">
                    Smart ID
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F1F5F9] my-1" />

              {/* 4. Log Out */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    setIsSignOutConfirmOpen(true)
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#FEF2F2] flex items-center justify-between group transition-colors cursor-pointer text-[#DC2626]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] group-hover:bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">Log Out</span>
                      <span className="text-[10px] text-[#EF4444]/80 block leading-tight">End active session</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FCA5A5] group-hover:text-[#DC2626] transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Utility Modals */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail={userEmail}
      />
      <VirtualIdCardModal
        isOpen={isVirtualIdOpen}
        onClose={() => setIsVirtualIdOpen(false)}
        profile={profile}
      />
      <SignOutConfirmModal
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        userName={displayName}
        userEmail={userEmail}
      />
    </header>
  )
}
