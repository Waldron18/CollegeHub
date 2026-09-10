'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  Settings,
  BadgeCheck,
  Headset,
  Lock,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'student' | 'faculty' | 'admin'

const roleConfig: Record<
  Role,
  { label: string; id: string; placeholder: string; sample: string; icon: React.ReactNode }
> = {
  student: {
    label: 'College Email or PRN ID',
    id: 'STU-PORTAL',
    placeholder: 'e.g. 22110482 or aditya@college.edu',
    sample: '22110482',
    icon: <GraduationCap className="w-4 h-4" />,
  },
  faculty: {
    label: 'Faculty Employee Code or VIIT ID',
    id: 'FAC-DEPT',
    placeholder: 'e.g. rajesh.kulkarni@college.edu',
    sample: 'rajesh.kulkarni@college.edu',
    icon: <Users className="w-4 h-4" />,
  },
  admin: {
    label: 'System Administrator UPN',
    id: 'ADM-ROOT',
    placeholder: 'e.g. root.admin@viit.ac.in',
    sample: 'adm.operator@viit.ac.in',
    icon: <Settings className="w-4 h-4" />,
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('student')
  const [uid, setUid] = useState('22110482')
  const [password, setPassword] = useState('password123')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = (r: Role) => {
    setRole(r)
    setUid(roleConfig[r].sample)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email/PRN or password')
      }

      // Successfully authenticated and cookie set
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="flex flex-col items-center w-full">
        {/* System Status Pill */}
        <div className="mb-6 flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748B] font-mono">
            Campus Identity Gateway • Portal v4.2
          </span>
        </div>

        {/* Main Auth Card */}
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column — Auth Form */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* College Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0D9488]">
                    VIIT Pune
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Vishwakarma Institute of Information Technology
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div className="mb-7">
                <h1 className="text-[28px] font-semibold tracking-tight text-[#0F172A] leading-tight">
                  Welcome to CollegeHub
                </h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Sign in to access campus communication, live classrooms, and ERP services.
                </p>
              </div>

              {/* Role Segmented Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
                    Access Clearance
                  </span>
                  <span className="font-mono text-xs text-[#0D9488] font-medium">
                    {roleConfig[role].id}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-lg">
                  {(['student', 'faculty', 'admin'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(r)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all duration-150',
                        role === r
                          ? 'bg-white text-[#0D9488] shadow-sm font-semibold'
                          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                      )}
                    >
                      {roleConfig[r].icon}
                      <span className="capitalize">{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inline Error Notification */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2.5 text-xs text-[#991B1B] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* UID Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="uid" className="text-xs font-medium text-[#0F172A]">
                      {roleConfig[role].label}
                    </label>
                    <span className="font-mono text-[11px] text-[#94A3B8]">Required</span>
                  </div>
                  <input
                    id="uid"
                    type="text"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    placeholder={roleConfig[role].placeholder}
                    className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="pwd" className="text-xs font-medium text-[#0F172A]">
                      Campus Password
                    </label>
                    <a href="#" className="text-xs text-[#0D9488] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="pwd"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your security token or password"
                      className="w-full h-9 px-3 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E2E8F0] accent-[#0D9488] cursor-pointer"
                    />
                    <span className="text-xs text-[#64748B]">Keep me signed in on this device</span>
                  </label>
                  <span className="text-[11px] font-medium text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded">
                    30 days
                  </span>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full h-10 flex items-center justify-center gap-2 rounded text-sm font-semibold tracking-wide text-white transition-all shadow-sm mt-1',
                    loading
                      ? 'bg-[#0D9488]/70 cursor-wait'
                      : 'bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.99]'
                  )}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Campus</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 flex items-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-[#E2E8F0]" />
                </div>
                <span className="relative mx-auto bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
                  or continue with institutional identity
                </span>
              </div>

              {/* SSO Button */}
              <button
                type="button"
                className="w-full h-10 flex items-center justify-center gap-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-sm font-medium text-[#0F172A] transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Single Sign-On (Google Workspace)</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-6 mt-6 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-2">
              <a
                href="#"
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0D9488] transition-colors"
              >
                <Headset className="w-3.5 h-3.5" />
                <span>Campus IT Helpdesk (Ext. 409)</span>
              </a>
              <div className="flex items-center gap-1.5 text-[#64748B]">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[11px] font-medium">256-bit SSL Institutional</span>
              </div>
            </div>
          </div>

          {/* Right Column — Campus Telemetry Panel */}
          <div className="lg:col-span-5 bg-[#F8FAFC] border-l border-[#E2E8F0] p-8 md:p-10 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#0D9488]">
                  Campus Telemetry
                </span>
                <span className="font-mono text-[11px] text-[#64748B] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded shadow-sm">
                  SEM-II AY24-25
                </span>
              </div>

              {/* Metric Card */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#64748B]">Active Classroom Grid</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    98.4% Normal
                  </span>
                </div>
                <svg className="w-full h-12 text-[#0D9488]" fill="none" viewBox="0 0 200 40">
                  <path
                    d="M0 32 L20 28 L40 30 L60 22 L80 24 L100 12 L120 18 L140 10 L160 14 L180 6 L200 8"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M0 32 L20 28 L40 30 L60 22 L80 24 L100 12 L120 18 L140 10 L160 14 L180 6 L200 8 V40 H0 Z"
                    fill="currentColor" fillOpacity="0.08"
                  />
                </svg>
                <div className="flex justify-between items-center text-[#64748B] font-mono text-[11px]">
                  <span>84 lecture halls</span>
                  <span>12,410 connected peers</span>
                </div>
              </div>

              {/* Notice Board */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
                  Notice Board Highlights
                </span>
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-3 flex items-start gap-2.5 shadow-sm">
                  <Activity className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#0F172A] truncate">
                      Capstone Lab Submission Closes
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">CS & IT Dept • Today at 23:59 IST</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-3 flex items-start gap-2.5 shadow-sm">
                  <BadgeCheck className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#0F172A] truncate">
                      Guest Lecture: Distributed Systems
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">Auditorium B • Tomorrow 10:30 AM</div>
                  </div>
                </div>
              </div>

              {/* Academic Quote */}
              <div className="p-4 rounded-xl bg-[#0D9488]/5 border border-[#0D9488]/10">
                <p className="text-xs text-[#475569] italic leading-relaxed">
                  &ldquo;Engineering excellence demands rigorous collaboration and relentless scientific curiosity.&rdquo;
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0D9488] flex items-center justify-center text-[10px] text-white font-bold">
                    V
                  </div>
                  <span className="text-[11px] font-medium text-[#0F172A]">Academic Directorate</span>
                </div>
              </div>
            </div>

            {/* System Footnote */}
            <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between font-mono text-[11px] text-[#94A3B8]">
              <span>HOST: viit-cluster-node-07</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                LATENCY: 14ms
              </span>
            </div>
          </div>
        </div>

        {/* Outer Links */}
        <div className="mt-5 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-[#64748B]">
          <a href="#" className="hover:text-[#0D9488] transition-colors">Academic Integrity Guidelines</a>
          <span className="text-[#E2E8F0]">•</span>
          <a href="#" className="hover:text-[#0D9488] transition-colors">Campus Wi-Fi Setup</a>
          <span className="text-[#E2E8F0]">•</span>
          <a href="#" className="hover:text-[#0D9488] transition-colors">Central Library OPAC</a>
          <span className="text-[#E2E8F0]">•</span>
          <a href="#" className="hover:text-[#0D9488] transition-colors">Data Governance</a>
        </div>
      </div>
    </main>
  )
}
