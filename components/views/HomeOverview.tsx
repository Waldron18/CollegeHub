'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Video,
  GraduationCap,
  ArrowRight,
  Mic,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  Receipt,
} from 'lucide-react'

import type { StudentProfile, FeeStatus, EnrolledSubject } from '@/types/dashboard'
import DepartmentNoticesCard from '@/components/common/DepartmentNoticesCard'
import { FeeReceiptModal } from '@/components/common/FeeReceiptModal'

interface HomeOverviewProps {
  onNavigate: (view: 'chat' | 'voip' | 'vierp') => void
  profile?: StudentProfile | null
  feeStatus?: FeeStatus | null
  enrolledSubjects?: EnrolledSubject[]
}

export default function HomeOverview({
  onNavigate,
  profile,
  feeStatus,
  enrolledSubjects,
}: HomeOverviewProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* 3-Column Utility Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Chat Hub */}
        <div className="group flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                  <MessageSquare className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Chat Hub</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                #TE-DivA-OS
              </span>
            </div>

            {/* Channel snippet */}
            <div className="relative p-3 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0D9488] rounded-l-lg" />
              <div className="pl-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#0F172A]">Prof. R. Kulkarni</span>
                  <span className="font-mono text-[10px] text-[#94A3B8]">09:24 AM</span>
                </div>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  Deadlock avoidance & Banker&rsquo;s Algorithm reference slides uploaded to repository. Lab submission due Friday 5 PM.
                </p>
              </div>
            </div>

            {/* Unread indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0" />
              <span className="text-xs font-medium text-[#0F172A]">4 unread messages</span>
              <span className="text-[#94A3B8] text-xs">• Operating Systems Lab</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {['RK', 'SK', '+8'].map((initials) => (
                <div
                  key={initials}
                  className="w-6 h-6 rounded-full bg-[#F0FDFA] border-2 border-white flex items-center justify-center text-[9px] font-semibold text-[#0D9488]"
                >
                  {initials}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors group-hover:translate-x-0.5 duration-150"
            >
              Open Class Chat
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: VoIP */}
        <div className="group flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                  <Video className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Live VoIP</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                Hall 304 Hybrid
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Upcoming Lecture
              </span>
              <h3 className="text-base font-semibold text-[#0F172A] line-clamp-1 leading-tight">
                Database Management Systems
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>10:00 AM – 11:00 AM</span>
                <span className="font-semibold text-[#10B981] text-[11px]">(Starts in 15 mins)</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
              <div className="w-7 h-7 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#0D9488] font-semibold text-[10px] flex-shrink-0">
                AP
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-[#0F172A] truncate">Dr. Ananya P.</span>
                <span className="font-mono text-[10px] text-[#94A3B8]">Topic: B+ Tree Indexing</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-2 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onNavigate('voip')}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Join Live Room
            </button>
            <button
              type="button"
              onClick={() => onNavigate('voip')}
              className="w-full text-center text-[11px] text-[#94A3B8] hover:text-[#475569] transition-colors py-1"
            >
              View Meeting Schedule (3 Today)
            </button>
          </div>
        </div>

        {/* Card 3: VIERP Snapshot */}
        <div className="group flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                  <GraduationCap className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">VIERP Snapshot</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#94A3B8] font-medium">
                Autonomous
              </span>
            </div>

            {/* Attendance Gauge + Stats */}
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* SVG Radial Gauge */}
              <div className="flex flex-col items-center p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background ring */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.5"
                    />
                    {/* Progress ring at 84% */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeDasharray="84, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#0F172A]">84%</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#10B981] mt-1">&gt;75% Safe</span>
              </div>

              {/* ERP Stats */}
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase text-[#94A3B8]">Cumulative GPA</span>
                  <span className="text-base font-bold text-[#0F172A] leading-tight">
                    9.12{' '}
                    <span className="text-xs font-normal text-[#94A3B8]">/ 10</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(true)}
                  className="flex flex-col text-left group cursor-pointer focus:outline-hidden"
                  title="Click to view & print official fee challan receipt"
                >
                  <span className="text-[10px] font-semibold uppercase text-[#94A3B8] group-hover:text-[#0D9488] transition-colors flex items-center gap-1">
                    Tuition Ledger <Receipt className="w-2.5 h-2.5 inline text-[#0D9488]" />
                  </span>
                  <span className="font-mono text-xs text-[#10B981] font-medium group-hover:underline">
                    AY 2024-25 Cleared
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-2">
            <button
              type="button"
              onClick={() => onNavigate('vierp')}
              className="w-full h-9 flex items-center justify-between px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-medium transition-colors"
            >
              <span>View Marksheets & Timetable</span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Department Notices & Circulars */}
      <DepartmentNoticesCard userRole="STUDENT" />

      {/* Official Fee Challan Receipt Modal */}
      <FeeReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transactionId={feeStatus?.transactionRef || 'TXN-2024-SEM5-4821'}
      />
    </div>
  )
}
