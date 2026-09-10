'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { type ActiveView } from '@/components/Sidebar'
import Header from '@/components/Header'
import HomeOverview from '@/components/views/HomeOverview'
import ChatView from '@/components/views/ChatView'
import VoipView from '@/components/views/VoipView'
import VierpView from '@/components/views/VierpView'
import FacultyDashboard from '@/components/faculty/FacultyDashboard'
import FacultyHomeOverview from '@/components/faculty/FacultyHomeOverview'
import FacultyVoipView from '@/components/faculty/FacultyVoipView'
import FacultyVierpView from '@/components/faculty/FacultyVierpView'
import AdminDashboard from '@/components/admin/AdminDashboard'
import VierpProfilePage from '@/components/profile/VierpProfilePage'
import type { DashboardData, StudentProfile } from '@/types/dashboard'
import { RefreshCw, AlertCircle } from 'lucide-react'

const viewTitles: Record<ActiveView, { heading: string; subtitle: string }> = {
  home: { heading: 'Home Overview', subtitle: 'Your academic workspace at a glance' },
  chat: { heading: 'Chat Hub', subtitle: 'Divisional communities & subject channels' },
  voip: { heading: 'VoIP Classroom', subtitle: 'Live lectures, Monday timetable & course assignments' },
  vierp: { heading: 'VIERP Academic Portal', subtitle: 'Attendance tracker, timetables, fees & marksheets' },
  profile: { heading: 'VIERP User Profile', subtitle: 'Official academic profile, family, education & identity records' },
}

const facultyViewTitles: Record<ActiveView, { heading: string; subtitle: string }> = {
  home: {
    heading: 'Faculty Academic Overview',
    subtitle: 'Instructor schedule, quick lecture launcher & coursework review',
  },
  chat: {
    heading: 'Faculty Chat & Inquiries',
    subtitle: 'Division cohorts, subject channels & student direct messaging',
  },
  voip: {
    heading: 'Faculty VoIP & Lecture Hub',
    subtitle: 'Live classroom stage, course materials & assignment grading',
  },
  vierp: {
    heading: 'Faculty VIERP Administration',
    subtitle: 'Division rosters, student attendance & compliance records',
  },
  profile: {
    heading: 'Faculty Academic Profile',
    subtitle: 'Institutional credentials, research records & departmental dossier',
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<ActiveView>('home')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [userRole, setUserRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT')
  const [roleProfile, setRoleProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Verify user session and role
      const authRes = await fetch('/api/auth/me')
      if (authRes.status === 401 || authRes.status === 403) {
        router.push('/login')
        return
      }

      if (!authRes.ok) {
        try {
          const errData = await authRes.json()
          if (
            errData?.error?.toLowerCase().includes('session') ||
            errData?.error?.toLowerCase().includes('auth') ||
            errData?.error?.toLowerCase().includes('unauthorized') ||
            errData?.error?.toLowerCase().includes('log in')
          ) {
            router.push('/login')
            return
          }
        } catch {}
        throw new Error(`Failed to verify session: HTTP ${authRes.status}`)
      }

      const authData = await authRes.json()
      const user = authData?.user

      if (!user) {
        router.push('/login')
        return
      }

      if (user.role === 'ADMIN') {
        setUserRole('ADMIN')
        setRoleProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'ADMIN',
          department: user.department?.name || 'Registrar Office',
          departmentCode: user.department?.code || 'REG',
          division: 'Administration',
          semester: 1,
          prnNumber: user.prnNumber || 'ADMIN-001',
        })
        setLoading(false)
        return
      }

      if (user.role === 'FACULTY') {
        setUserRole('FACULTY')
        setRoleProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'FACULTY',
          department: user.department?.name || 'Computer Engineering',
          departmentCode: user.department?.code || 'COMP',
          division: user.division?.name || 'TE Div A',
          semester: 5,
        })
        setLoading(false)
        return
      }

      // 2. If student, fetch student dashboard data
      setUserRole('STUDENT')
      const res = await fetch('/api/student/dashboard')
      if (res.status === 401 || res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        throw new Error(`Failed to fetch student dashboard data: HTTP ${res.status}`)
      }
      const data: DashboardData = await res.json()
      setDashboardData(data)
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
      setError(err?.message || 'Unable to load workspace data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const [voipSubTab, setVoipSubTab] = useState<'lecture' | 'materials' | 'assignments' | 'grading' | 'lecture-hub'>('lecture')
  const [voipSelectedSlotId, setVoipSelectedSlotId] = useState<string | undefined>(undefined)
  const [vierpInitialView, setVierpInitialView] = useState<'attendance' | 'timetable' | 'courses'>('attendance')

  const handleNavigate = (view: ActiveView, subTab?: string, slotId?: string) => {
    setActiveView(view)
    if (view === 'voip') {
      if (subTab === 'grading' || subTab === 'assignments') {
        setVoipSubTab('assignments')
      } else if (subTab === 'lecture-hub' || subTab === 'lecture') {
        setVoipSubTab('lecture')
      } else if (subTab === 'materials') {
        setVoipSubTab('materials')
      }
      if (slotId) {
        setVoipSelectedSlotId(slotId)
      }
    }
    if (view === 'vierp') {
      if (subTab === 'timetable') {
        setVierpInitialView('timetable')
      } else if (subTab === 'attendance') {
        setVierpInitialView('attendance')
      } else if (subTab === 'courses' || subTab === 'cohorts') {
        setVierpInitialView('courses')
      }
    }
  }

  const activeProfile =
    userRole === 'ADMIN' || userRole === 'FACULTY' ? roleProfile : dashboardData?.profile || null

  const heading =
    userRole === 'ADMIN'
      ? 'Institutional Administration Portal'
      : userRole === 'FACULTY'
      ? facultyViewTitles[activeView].heading
      : viewTitles[activeView].heading

  const subtitle =
    userRole === 'ADMIN'
      ? 'Registrar Office • System Overview, User Provisioning & Campus Broadcast Center'
      : userRole === 'FACULTY'
      ? facultyViewTitles[activeView].subtitle
      : viewTitles[activeView].subtitle

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Persistent Sidebar with live profile */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        profile={activeProfile}
      />

      {/* Main content area offset by sidebar width (60 = 15rem = 240px) */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Persistent Header with live profile and notification navigation */}
        <Header profile={activeProfile} onNavigate={handleNavigate} />

        {/* Page Body — offset by header height (14 = 3.5rem = 56px) */}
        <main className="flex-1 pt-14">
          <div className="w-full max-w-[80rem] mx-auto px-5 md:px-8 py-6">
            {/* Breadcrumb / Page Title */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-[#0F172A] tracking-tight">
                  {heading}
                </h1>
                <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#0D9488] bg-[#F0FDFA] border border-[#99F6E4] px-3 py-1 rounded-full animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing workspace...</span>
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="flex flex-col gap-6 animate-pulse">
                {/* 3-card skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl bg-white border border-[#E2E8F0] p-5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-[#F1F5F9]" />
                          <div className="w-16 h-4 rounded bg-[#F1F5F9]" />
                        </div>
                        <div className="w-3/4 h-5 rounded bg-[#F1F5F9]" />
                        <div className="w-full h-16 rounded-lg bg-[#F8FAFC]" />
                      </div>
                      <div className="w-full h-8 rounded bg-[#F1F5F9]" />
                    </div>
                  ))}
                </div>

                {/* Lower container skeleton */}
                <div className="h-72 rounded-xl bg-white border border-[#E2E8F0] p-6 space-y-4">
                  <div className="w-1/3 h-5 rounded bg-[#F1F5F9]" />
                  <div className="w-full h-44 rounded-lg bg-[#F8FAFC]" />
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="rounded-xl bg-white border border-[#FECACA] p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Failed to Load Workspace</h3>
                <p className="text-xs text-[#64748B] mt-1 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : userRole === 'ADMIN' ? (
              /* Dedicated Institutional Admin Portal */
              <AdminDashboard />
            ) : userRole === 'FACULTY' ? (
              /* Distributed Faculty Views across Tabs */
              <>
                {activeView === 'home' && (
                  <FacultyHomeOverview
                    onNavigate={handleNavigate}
                    profile={activeProfile}
                  />
                )}
                {activeView === 'chat' && (
                  <ChatView
                    profile={activeProfile}
                  />
                )}
                {activeView === 'voip' && (
                  <FacultyVoipView
                    profile={activeProfile}
                    initialSubTab={voipSubTab}
                    selectedSlotId={voipSelectedSlotId}
                  />
                )}
                {activeView === 'vierp' && (
                  <FacultyVierpView
                    initialView={vierpInitialView}
                  />
                )}
                {activeView === 'profile' && (
                  <VierpProfilePage
                    profile={activeProfile}
                    onNavigate={handleNavigate}
                  />
                )}
              </>
            ) : (
              /* Active Student Views with Live Data Props */
              <>
                {activeView === 'home' && (
                  <HomeOverview
                    onNavigate={handleNavigate}
                    profile={dashboardData?.profile}
                    feeStatus={dashboardData?.feeStatus}
                    enrolledSubjects={dashboardData?.enrolledSubjects}
                  />
                )}
                {activeView === 'chat' && (
                  <ChatView
                    enrolledSubjects={dashboardData?.enrolledSubjects}
                    profile={dashboardData?.profile}
                  />
                )}
                {activeView === 'voip' && (
                  <VoipView
                    enrolledSubjects={dashboardData?.enrolledSubjects}
                  />
                )}
                {activeView === 'vierp' && (
                  <VierpView
                    profile={dashboardData?.profile}
                    feeStatus={dashboardData?.feeStatus}
                    enrolledSubjects={dashboardData?.enrolledSubjects}
                  />
                )}
                {activeView === 'profile' && (
                  <VierpProfilePage
                    profile={dashboardData?.profile || activeProfile}
                    onNavigate={handleNavigate}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
