'use client'

import {
  LayoutDashboard,
  MessageSquare,
  Video,
  GraduationCap,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudentProfile } from '@/types/dashboard'

export type ActiveView = 'home' | 'chat' | 'voip' | 'vierp' | 'profile'

interface NavItem {
  id: ActiveView
  label: string
  icon: React.ReactNode
  description: string
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home Overview',
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: 'Dashboard & notices',
  },
  {
    id: 'chat',
    label: 'Chat Hub',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Communities & channels',
  },
  {
    id: 'voip',
    label: 'VoIP Classroom',
    icon: <Video className="w-5 h-5" />,
    description: 'Live lectures & tasks',
  },
  {
    id: 'vierp',
    label: 'VIERP Portal',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Attendance & records',
  },
]

interface SidebarProps {
  activeView: ActiveView
  onNavigate: (view: ActiveView) => void
  profile?: StudentProfile | null
}

export default function Sidebar({ activeView, onNavigate, profile }: SidebarProps) {
  const displayDept = profile?.department || 'Computer Engineering'

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E2E8F0] z-50 flex flex-col shadow-[1px_0_8px_rgba(15,23,42,0.04)] print:hidden">
      {/* College Brand Header */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-[#F1F5F9] flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-[#0D9488]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-[#0F172A] truncate leading-tight">
            VIIT Pune
          </span>
          <span className="text-[11px] text-[#64748B] truncate leading-tight mt-0.5">
            {displayDept}
          </span>
        </div>
      </div>

      {/* Main Navigation Area filling vertical space cleanly */}
      <div className="flex-1 flex flex-col justify-between p-3 overflow-y-auto">
        <div className="flex flex-col">
          {/* Nav Section Label */}
          <div className="px-2 pt-1 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              Academic Workspace
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  title={item.description}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer',
                    isActive
                      ? 'bg-[#0D9488] text-white shadow-sm'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  )}
                >
                  <span
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#0D9488]'
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        'text-sm font-medium leading-tight',
                        isActive ? 'text-white' : 'text-[#0F172A]'
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] leading-tight mt-0.5 truncate',
                        isActive ? 'text-white/80' : 'text-[#94A3B8]'
                      )}
                    >
                      {item.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Clean Institutional Session Card */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block ring-2 ring-[#D1FAE5]" />
            <span className="text-[11px] font-medium text-[#475569]">Campus ERP</span>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8]">AY 2024–25</span>
        </div>
      </div>
    </aside>
  )
}
