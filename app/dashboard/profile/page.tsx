'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { type ActiveView } from '@/components/Sidebar'
import Header from '@/components/Header'
import VierpProfilePage from '@/components/profile/VierpProfilePage'
import type { StudentProfile } from '@/types/dashboard'
import { RefreshCw, AlertCircle } from 'lucide-react'

export default function DedicatedProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/auth/me')
      if (res.status === 401 || res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        throw new Error(`Failed to load profile: HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.user) {
        setProfile({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          prnNumber: data.user.prnNumber,
          department: data.user.department?.name || 'Computer Engineering',
          departmentCode: data.user.department?.code || 'COMP',
          division: data.user.division?.name || 'TE Div A',
          semester: data.user.division?.semester || 5,
        })
      } else {
        router.push('/login')
      }
    } catch (err: any) {
      console.error('Failed to load profile session:', err)
      setError(err?.message || 'Error loading profile session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  const handleNavigate = (view: ActiveView) => {
    if (view === 'home') {
      router.push('/dashboard')
    } else {
      router.push(`/dashboard?tab=${view}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] print:bg-white print:min-h-0">
      {/* Sidebar with active profile */}
      <Sidebar
        activeView="profile"
        onNavigate={handleNavigate}
        profile={profile}
      />

      {/* Main Content Area */}
      <div className="pl-60 min-h-screen flex flex-col print:pl-0 print:min-h-0">
        <Header profile={profile} onNavigate={handleNavigate} />

        <main className="flex-1 pt-14 print:pt-0">
          <div className="w-full max-w-[80rem] mx-auto px-5 md:px-8 py-6 print:max-w-none print:p-0 print:m-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex items-center gap-3 text-xs text-[#0D9488] bg-[#F0FDFA] border border-[#99F6E4] px-4 py-2 rounded-full animate-pulse shadow-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading VIERP profile dossier...</span>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-white border border-[#FECACA] p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Failed to Load Profile</h3>
                <p className="text-xs text-[#64748B] mt-1 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={fetchSession}
                  className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Session</span>
                </button>
              </div>
            ) : (
              <VierpProfilePage profile={profile} onNavigate={handleNavigate} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
