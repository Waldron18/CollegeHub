'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Lock,
  Calendar,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserPlus,
  Radio,
  Send,
  Pin,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  X,
  Shield,
  Building,
  ArrowUpRight,
  TrendingUp,
  Clock,
  FileText,
  CreditCard,
  Sparkles,
} from 'lucide-react'

export type AdminTab = 'overview' | 'users' | 'broadcasts' | 'extraLectures' | 'timetable'

interface AdminStats {
  totalStudents: number
  totalFaculty: number
  totalDepartments: number
  totalSubjects: number
  totalDivisions: number
  totalFeeRevenue: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    prnNumber: string | null
    role: string
    createdAt: string
    department: { name: string; code: string } | null
    division: { name: string } | null
  }>
  recentTransactions: Array<{
    id: string
    studentName: string
    prnNumber: string | null
    amount: number
    status: string
    ref: string
    date: string
  }>
}

interface AdminUser {
  id: string
  name: string
  email: string
  prnNumber: string | null
  role: string
  createdAt: string
  department: string
  departmentCode: string
  departmentId: string | null
  division: string
  divisionId: string | null
  enrolledCount: number
}

interface AdminAnnouncement {
  id: string
  title: string
  content: string
  channelName: string
  channelType: string
  senderName: string
  senderRole: string
  createdAt: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([])

  // User Directory filters
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Provisioning Modal state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false)
  const [provisionName, setProvisionName] = useState('')
  const [provisionEmail, setProvisionEmail] = useState('')
  const [provisionPrn, setProvisionPrn] = useState('')
  const [provisionRole, setProvisionRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT')
  const [provisionDeptId, setProvisionDeptId] = useState('')
  const [provisionDivId, setProvisionDivId] = useState('')
  const [provisionPassword, setProvisionPassword] = useState('Welcome@2026')
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null)

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastContent, setBroadcastContent] = useState('')
  const [broadcastPinned, setBroadcastPinned] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState<string | null>(null)

  // Extra Lecture Approvals State
  const [extraRequests, setExtraRequests] = useState<any[]>([])
  const [loadingExtraRequests, setLoadingExtraRequests] = useState(false)
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null)
  const [extraSuccessBanner, setExtraSuccessBanner] = useState<string | null>(null)

  // Static Timetable Matrix State
  const [staticTimetable, setStaticTimetable] = useState<any[]>([])
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('Full Week')
  const [loadingStaticTimetable, setLoadingStaticTimetable] = useState(false)

  // Load Extra Lecture Requests
  const loadExtraRequests = async () => {
    try {
      setLoadingExtraRequests(true)
      const res = await fetch('/api/admin/extra-lectures')
      if (res.ok) {
        const data = await res.json()
        setExtraRequests(data.requests || [])
      }
    } catch (e) {
      console.error('Failed to load extra lecture requests:', e)
    } finally {
      setLoadingExtraRequests(false)
    }
  }

  // Load Permanent Static Timetable
  const loadStaticTimetable = async () => {
    try {
      setLoadingStaticTimetable(true)
      const res = await fetch('/api/timetable/static')
      if (res.ok) {
        const data = await res.json()
        setStaticTimetable(data.timetable || [])
      }
    } catch (e) {
      console.error('Failed to load static timetable:', e)
    } finally {
      setLoadingStaticTimetable(false)
    }
  }

  // Handle Approve / Reject Extra Lecture
  const handleUpdateExtraLectureStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingRequestId(requestId)
    try {
      const res = await fetch('/api/admin/extra-lectures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      })
      if (res.ok) {
        setExtraSuccessBanner(`Extra lecture request successfully ${status}! VoIP live schedules updated.`)
        await loadExtraRequests()
        setTimeout(() => setExtraSuccessBanner(null), 5000)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update request status.')
      }
    } catch (e) {
      console.error('Error updating extra lecture status:', e)
      alert('Network error while updating status.')
    } finally {
      setUpdatingRequestId(null)
    }
  }

  // Load all initial admin data
  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (!statsRes.ok) throw new Error('Failed to load institutional statistics')
      const statsData = await statsRes.json()
      setStats(statsData.stats)

      // 2. Fetch users
      const usersRes = await fetch('/api/admin/users')
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
        setDepartments(usersData.departments || [])
        setDivisions(usersData.divisions || [])
        if (usersData.departments?.length > 0) {
          setProvisionDeptId(usersData.departments[0].id)
        }
        if (usersData.divisions?.length > 0) {
          setProvisionDivId(usersData.divisions[0].id)
        }
      }

      // 3. Fetch announcements
      const annRes = await fetch('/api/admin/announcements')
      if (annRes.ok) {
        const annData = await annRes.json()
        setAnnouncements(annData.announcements || [])
      }
    } catch (err: any) {
      console.error('Error loading admin workspace:', err)
      setError(err?.message || 'Failed to load administrative workspace')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Refresh user list on filter/search change
  const refreshUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (roleFilter !== 'ALL') params.append('role', roleFilter)
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Failed to filter users:', err)
    }
  }

  useEffect(() => {
    if (!loading) {
      refreshUsers()
    }
  }, [roleFilter, searchQuery])

  // Handle user provisioning
  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provisionName.trim() || !provisionEmail.trim() || !provisionPassword) {
      alert('Please fill in all required fields.')
      return
    }

    setIsProvisioning(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: provisionName.trim(),
          email: provisionEmail.trim(),
          prnNumber: provisionPrn.trim() || null,
          role: provisionRole,
          departmentId: provisionDeptId || null,
          divisionId: provisionRole === 'STUDENT' ? provisionDivId || null : null,
          password: provisionPassword,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setProvisionSuccessMsg(`Provisioned ${provisionName} successfully (${provisionRole})`)
        setIsProvisionModalOpen(false)
        setProvisionName('')
        setProvisionEmail('')
        setProvisionPrn('')
        setProvisionPassword('Welcome@2026')
        setTimeout(() => setProvisionSuccessMsg(null), 5000)

        // Reload data
        await loadAdminData()
      } else {
        const errData = await res.json()
        alert(errData.error || 'Failed to provision user.')
      }
    } catch (err) {
      console.error('Error provisioning user:', err)
      alert('Network error while provisioning user.')
    } finally {
      setIsProvisioning(false)
    }
  }

  // Handle circular broadcast
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      alert('Title and circular content are required.')
      return
    }

    setIsBroadcasting(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          content: broadcastContent.trim(),
          isPinned: broadcastPinned,
        }),
      })

      if (res.ok) {
        setBroadcastSuccessMsg('College-wide circular broadcasted successfully!')
        setBroadcastTitle('')
        setBroadcastContent('')
        setBroadcastPinned(false)
        setTimeout(() => setBroadcastSuccessMsg(null), 5000)

        // Refresh announcements
        const annRes = await fetch('/api/admin/announcements')
        if (annRes.ok) {
          const annData = await annRes.json()
          setAnnouncements(annData.announcements || [])
        }
      } else {
        const errData = await res.json()
        alert(errData.error || 'Failed to broadcast announcement.')
      }
    } catch (err) {
      console.error('Error broadcasting circular:', err)
      alert('Network error while publishing circular.')
    } finally {
      setIsBroadcasting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#64748B] text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
        <span>Loading Institutional Administration Portal...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-center text-xs text-[#DC2626]">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#EF4444]" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={loadAdminData}
          className="mt-3 px-3 py-1.5 rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Registrar Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0D9488]/40 border border-[#334155] p-5 text-white flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0D9488]/25 border border-[#0D9488]/60 flex items-center justify-center text-[#2DD4BF] shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Institutional Administration Portal
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0D9488] text-white">
                Registrar Office
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Comprehensive institutional governance: provision accounts, track fees & broadcast campus circulars
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsProvisionModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'overview'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>System Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'users'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory & Provisioning</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'users' ? 'bg-white text-[#0D9488]' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcasts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'broadcasts'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Campus Broadcast Center</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'broadcasts'
                  ? 'bg-white text-[#0D9488]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {announcements.length}
            </span>
          </button>
        </div>

        {provisionSuccessMsg && (
          <div className="flex items-center gap-1.5 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-lg animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{provisionSuccessMsg}</span>
          </div>
        )}

        {broadcastSuccessMsg && (
          <div className="flex items-center gap-1.5 text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-lg animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{broadcastSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* ==================== VIEW 1: SYSTEM OVERVIEW ==================== */}
      {activeTab === 'overview' && stats && (
        <div className="flex flex-col gap-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Students */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Total Students</span>
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#0F172A]">{stats.totalStudents}</span>
                <span className="text-[11px] text-[#10B981] ml-2 font-medium">Active Enrolled</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1">Across {stats.totalDivisions} divisions</p>
            </div>

            {/* Total Faculty */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Active Faculty</span>
                <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#0F172A]">{stats.totalFaculty}</span>
                <span className="text-[11px] text-[#16A34A] ml-2 font-medium">Teaching Staff</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1">{stats.totalSubjects} assigned courses</p>
            </div>

            {/* Total Departments & Courses */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Departments & Courses</span>
                <div className="w-8 h-8 rounded-lg bg-[#FDF4FF] border border-[#F5D0FE] flex items-center justify-center text-[#C026D3]">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#0F172A]">{stats.totalDepartments}</span>
                <span className="text-[11px] text-[#C026D3] ml-2 font-medium">
                  {stats.totalSubjects} Subjects
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1">Computer Engineering Hub</p>
            </div>

            {/* Total Fee Revenue */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Collected Fee Aggregate</span>
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#0F172A]">
                  ₹{stats.totalFeeRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#059669] font-medium mt-1">
                100% Cleared Transactions
              </p>
            </div>
          </div>

          {/* Activity Grid: Recent Users & Recent Fee Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Registrations */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#0D9488]" />
                  <span>Recently Provisioned Accounts</span>
                </h3>
                <span className="text-[10px] font-mono text-[#64748B]">Latest 6</span>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] flex items-center justify-center font-bold text-[11px]">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#0F172A] block">{u.name}</span>
                        <span className="text-[10px] text-[#64748B]">
                          {u.email} {u.prnNumber ? `• PRN: ${u.prnNumber}` : ''}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-[#FDF4FF] text-[#A21CAF] border border-[#F5D0FE]'
                          : u.role === 'FACULTY'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                          : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Collection Ledger */}
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#10B981]" />
                  <span>Fee Collection Transactions</span>
                </h3>
                <span className="text-[10px] font-mono text-[#64748B]">Official Ledgers</span>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {stats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#0F172A] block">
                        {tx.studentName}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        PRN: {tx.prnNumber || 'N/A'} • Ref: {tx.ref}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#0F172A] block font-mono">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-semibold text-[#10B981]">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 2: USER DIRECTORY & PROVISIONING ==================== */}
      {activeTab === 'users' && (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-5">
          {/* Controls Bar: Search & Role Filter */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Institutional Directory & Access Roster
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Manage credentials, department associations, and divisional assignments
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, PRN, or email..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0D9488] w-56"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Filter className="w-3.5 h-3.5 text-[#0D9488]" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                  <option value="ADMIN">Administrators</option>
                </select>
              </div>

              {/* Provision Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Provision User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                  <th className="py-2.5 px-3 font-semibold">User Details</th>
                  <th className="py-2.5 px-3 font-semibold">PRN / ID</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Department & Division</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Courses</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] flex items-center justify-center font-bold text-[11px]">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-[#0F172A] block">{u.name}</span>
                          <span className="text-[10px] text-[#64748B]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#64748B]">
                      {u.prnNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-[#FDF4FF] text-[#A21CAF] border border-[#F5D0FE]'
                            : u.role === 'FACULTY'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                            : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[#0F172A] font-medium block">{u.department}</span>
                      <span className="text-[10px] text-[#64748B]">{u.division}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {u.role === 'STUDENT' ? (
                        <span className="text-[11px] font-semibold text-[#0D9488]">
                          {u.enrolledCount} enrolled
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[#64748B]">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== VIEW 3: CAMPUS BROADCAST CENTER ==================== */}
      {activeTab === 'broadcasts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Compose Announcement Form */}
          <div className="lg:col-span-1 rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-4 border-b border-[#E2E8F0] pb-3">
              <Radio className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Publish Circular</h3>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Circular Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Schedule for In-Semester Examination (ISE-II)"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Notice Content & Circular Details
                </label>
                <textarea
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="State the instructions, hall allocations, and timings clearly for all enrolled students..."
                  rows={5}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={broadcastPinned}
                  onChange={(e) => setBroadcastPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <label htmlFor="pinToggle" className="text-xs text-[#334155] flex items-center gap-1 cursor-pointer">
                  <Pin className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Pin to top of #College-Announcements</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 mt-2"
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing Circular...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Circular</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Broadcast History */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A]">Broadcasted Circulars</h3>
                <span className="text-[11px] text-[#64748B]">
                  Live notices streamed to students and faculty channels
                </span>
              </div>
              <span className="font-mono text-[10px] bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full">
                #College-Announcements
              </span>
            </div>

            <div className="space-y-3.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#0F172A]">{ann.title}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0D9488]/15 text-[#0D9488] font-semibold">
                          {ann.channelName}
                        </span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed mt-1">
                        {ann.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E2E8F0]/70 flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>Published by: {ann.senderName} ({ann.senderRole})</span>
                    <span className="font-mono">
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PROVISION USER MODAL ==================== */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Provision New Academic User
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionUser} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={provisionName}
                  onChange={(e) => setProvisionName(e.target.value)}
                  placeholder="e.g. Priyanshu Deshmukh"
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={provisionEmail}
                  onChange={(e) => setProvisionEmail(e.target.value)}
                  placeholder="e.g. priyanshu@college.edu"
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    Role *
                  </label>
                  <select
                    value={provisionRole}
                    onChange={(e) => setProvisionRole(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    PRN / Employee ID
                  </label>
                  <input
                    type="text"
                    value={provisionPrn}
                    onChange={(e) => setProvisionPrn(e.target.value)}
                    placeholder="e.g. 22110499"
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    Department
                  </label>
                  <select
                    value={provisionDeptId}
                    onChange={(e) => setProvisionDeptId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    Division
                  </label>
                  <select
                    value={provisionDivId}
                    onChange={(e) => setProvisionDivId(e.target.value)}
                    disabled={provisionRole !== 'STUDENT'}
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488] disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.name} (Sem {div.semester})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Temporary Password *
                </label>
                <input
                  type="text"
                  value={provisionPassword}
                  onChange={(e) => setProvisionPassword(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {isProvisioning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <span>Create User</span>
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
