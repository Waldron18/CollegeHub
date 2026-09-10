'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  Sparkles,
  GraduationCap,
  Building,
  User,
  CheckCircle2,
} from 'lucide-react'
import type { StudentProfile } from '@/types/dashboard'

interface VirtualIdCardModalProps {
  isOpen: boolean
  onClose: () => void
  profile?: StudentProfile | null
}

export default function VirtualIdCardModal({
  isOpen,
  onClose,
  profile,
}: VirtualIdCardModalProps) {
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const isFaculty = profile?.role === 'FACULTY'
  const isAdmin = profile?.role === 'ADMIN'

  const displayName = profile?.name || (isFaculty ? 'Prof. Rajesh Kulkarni' : 'Aditya Sharma')
  const prn = profile?.prnNumber || (isFaculty ? 'EMP-CE-402' : '22110482')
  const dept = profile?.department || 'Computer Engineering'
  const division = profile?.division || 'A'
  const semester = profile?.semester || 5
  const bloodGroup = isFaculty ? 'B +ve' : 'O +ve'

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert(`Virtual ID Card for ${displayName} (${prn}) downloaded successfully.`)
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0] z-10 animate-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Official Digital Smart ID Card</h3>
            <span className="text-xs text-[#64748B]">VIIT Institutional Identity Management • AY 2024-25</span>
          </div>
        </div>

        {/* Smart ID Card Physical Replica */}
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden border-2 border-[#CBD5E1] shadow-lg bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white print:border-black"
        >
          {/* Card Top Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-[#0D9488] via-[#10B981] to-[#3B82F6]" />

          {/* Card Header */}
          <div className="px-5 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* College Emblem Crest */}
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#0D9488] shadow-md flex-shrink-0 font-black text-base tracking-tighter">
                VIIT
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-wide uppercase text-white leading-tight">
                  Vishwakarma Institute of Information Technology
                </h4>
                <p className="text-[9px] text-[#94A3B8] font-medium leading-tight mt-0.5">
                  Autonomous Institute Affiliated to Savitribai Phule Pune University
                </p>
                <span className="text-[8px] tracking-wider text-[#10B981] font-semibold uppercase">
                  NAAC Accredited 'A++' Grade
                </span>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[#38BDF8]">
                AY 2024–25
              </span>
              <span className="text-[8px] text-[#94A3B8] mt-0.5">SMART ID</span>
            </div>
          </div>

          {/* Role Category Banner */}
          <div
            className={`py-1 px-5 text-center text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${
              isAdmin
                ? 'bg-[#A21CAF] text-white'
                : isFaculty
                ? 'bg-[#7C3AED] text-white'
                : 'bg-[#0D9488] text-white'
            }`}
          >
            <span>
              {isAdmin
                ? 'INSTITUTIONAL ADMINISTRATION'
                : isFaculty
                ? 'FACULTY & RESEARCH MENTOR IDENTITY CARD'
                : 'STUDENT IDENTITY CARD'}
            </span>
          </div>

          {/* Card Main Body */}
          <div className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Photo & Hologram */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-inner bg-gradient-to-b from-[#334155] to-[#1E293B] flex items-center justify-center text-white">
                <User className="w-12 h-12 text-[#94A3B8]" />

                {/* Smart Chip Simulation */}
                <div className="absolute top-1.5 left-1.5 w-6 h-4 rounded bg-amber-400/90 border border-amber-500 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-2 border-t border-b border-amber-600/70" />
                </div>

                {/* Verified Hologram Stamp */}
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-emerald-500/90 text-[7px] font-bold tracking-wider text-white uppercase flex items-center gap-0.5 shadow-xs">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  VIIT
                </div>
              </div>

              {/* Blood Group Tag */}
              <div className="mt-2 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300">
                Blood: {bloodGroup}
              </div>
            </div>

            {/* Credential Details Grid */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-sm font-black uppercase tracking-wide text-white leading-tight">
                {displayName}
              </h3>
              <p className="text-[11px] font-medium text-[#38BDF8] mt-0.5">
                {isFaculty
                  ? 'Associate Professor • PG Studies'
                  : `B.Tech Computer Engineering (Semester ${semester})`}
              </p>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-white/10 text-[10px]">
                <div>
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider">
                    {isFaculty ? 'Employee Code' : 'Permanent Reg No (PRN)'}
                  </span>
                  <span className="font-mono font-bold text-white text-xs">{prn}</span>
                </div>

                <div>
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider">
                    {isFaculty ? 'Faculty Cabin' : 'Division & Batch'}
                  </span>
                  <span className="font-semibold text-white">
                    {isFaculty ? 'Cabin 412 (Academic Block 4)' : `Div ${division} • Batch ${division}1`}
                  </span>
                </div>

                <div>
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider">
                    Department
                  </span>
                  <span className="font-medium text-white truncate block">{dept}</span>
                </div>

                <div>
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider">
                    Valid Until
                  </span>
                  <span className="font-mono font-semibold text-[#10B981]">30-JUN-2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer: Barcode, QR Code & Digital Signature */}
          <div className="px-5 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between">
            {/* Barcode graphic */}
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5 h-6">
                {[
                  2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 2, 3, 1,
                  2, 1, 4, 2, 1, 3, 2, 1, 3,
                ].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-white/90 h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[8px] text-[#94A3B8] tracking-widest mt-0.5">
                *{prn}*
              </span>
            </div>

            {/* Dynamic QR Code */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-[#0F172A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v2h-4v-2zm2-2h2v2h-2v-2zm-6-2h2v2h-2v-2zm6-4h4v2h-4v-2zm-4 2h2v2h-2v-2z" />
                </svg>
              </div>

              {/* Digital Signature */}
              <div className="text-right">
                <span className="font-serif italic text-xs text-[#93C5FD] block leading-none">
                  Dr. S. K. Mahajan
                </span>
                <span className="text-[8px] text-[#94A3B8] block mt-0.5 uppercase tracking-wider">
                  Director • VIIT Pune
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
            <span>Digital ID cryptographically verifiable across VIIT campus RFID sensors.</span>
          </div>
          <span className="font-mono text-[10px] text-[#0D9488] font-semibold">Active & Valid</span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Print ID</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Card</span>
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
