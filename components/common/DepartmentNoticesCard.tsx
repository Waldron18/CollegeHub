'use client'

import React, { useState } from 'react'
import {
  Pin,
  FileText,
  Calendar,
  Briefcase,
  Download,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Inbox,
} from 'lucide-react'

export type NoticeCategory = 'ALL' | 'ACADEMIC' | 'EXAMINATION' | 'PLACEMENT'

export interface DepartmentNotice {
  id: string
  refNumber: string
  title: string
  description: string
  category: 'ACADEMIC' | 'EXAMINATION' | 'PLACEMENT'
  categoryLabel: string
  author: string
  publishedAt: string
  batch?: string
  metaInfo?: string
  location?: string
  timing?: string
  attachment?: {
    name: string
    size: string
  }
  primaryActionLabel?: string
  secondaryActionLabel?: string
}

interface DepartmentNoticesCardProps {
  userRole?: 'STUDENT' | 'FACULTY'
}

const DEFAULT_NOTICES: DepartmentNotice[] = [
  {
    id: 'notice-1',
    refNumber: 'Ref #2024/CE-88',
    title: 'End-Semester Capstone Review Protocol & Panel Allocation',
    description:
      'Issued by Dr. S. Rao (Head of Department) for all Final Year & Third Year Honours candidates. Mandatory adherence to IEEE formatting and project design logbooks.',
    category: 'ACADEMIC',
    categoryLabel: 'Academic',
    author: 'Dr. S. Rao (Head of Department)',
    publishedAt: 'Published yesterday • 04:30 PM',
    attachment: {
      name: 'Review_Schedule_Oct24.pdf',
      size: '1.2 MB',
    },
    primaryActionLabel: 'Download Circular',
    secondaryActionLabel: 'Acknowledge',
  },
  {
    id: 'notice-2',
    refNumber: 'Batch TE-1 & TE-2',
    title: 'Internal Mid-Semester Assessment Timetable & Lab Exam Batches',
    description:
      'Physical lab exams and viva sessions will run between Oct 28 – Nov 03. Students must present signed journals and verified git commit logs.',
    category: 'EXAMINATION',
    categoryLabel: 'Examinations',
    author: 'Exam Cell',
    publishedAt: 'Published Oct 22 • Exam Cell',
    batch: 'Batch TE-1 & TE-2',
    location: 'Labs 401, 403, 404',
    timing: '09:00 AM – 04:30 PM Slot Rotations',
    primaryActionLabel: 'View Details',
    secondaryActionLabel: 'Add to Calendar',
  },
  {
    id: 'notice-3',
    refNumber: 'Ref #2024/TPO-41',
    title: 'Summer Internship & Campus Recruitment Drive - Microsoft & Barclays',
    description:
      'Registration link active for Pre-Final & Final Year Computer Engineering cohorts. Minimum 7.5 CGPA required with no active backlogs. Round 1 Online Assessment begins Oct 26.',
    category: 'PLACEMENT',
    categoryLabel: 'Placement & Internships',
    author: 'Prof. Ananya Sen (TPO Lead)',
    publishedAt: 'Published 2 days ago • Training & Placement Cell',
    batch: 'Batch 2025 & 2026 (TE / BE)',
    metaInfo: 'Deadline: Friday 11:59 PM • TPO Portal',
    attachment: {
      name: 'TPO_Drive_Guidelines_2024.pdf',
      size: '850 KB',
    },
    primaryActionLabel: 'Download Guidelines',
    secondaryActionLabel: 'Apply on Portal',
  },
  {
    id: 'notice-4',
    refNumber: 'Ref #2024/CE-95',
    title: 'Open Elective & Honors Track Course Preference Submission',
    description:
      'All Semester V students must submit their prioritized track preferences (AI/ML, Cyber Security, Cloud Computing) before the academic portal freeze date.',
    category: 'ACADEMIC',
    categoryLabel: 'Academic',
    author: 'Academic Coordination Committee',
    publishedAt: 'Published 3 days ago • Dean Academics',
    batch: 'Third Year (Sem V)',
    metaInfo: 'Portal closes Monday 05:00 PM',
    primaryActionLabel: 'Submit Preferences',
    secondaryActionLabel: 'Curriculum PDF',
  },
]

const FILTER_OPTIONS: { id: NoticeCategory; label: string }[] = [
  { id: 'ALL', label: 'All Notices' },
  { id: 'ACADEMIC', label: 'Academic' },
  { id: 'EXAMINATION', label: 'Examinations' },
  { id: 'PLACEMENT', label: 'Placement & Internships' },
]

const CATEGORY_NAMES: Record<NoticeCategory, string> = {
  ALL: 'All Notices',
  ACADEMIC: 'Academic',
  EXAMINATION: 'Examinations',
  PLACEMENT: 'Placement & Internships',
}

export default function DepartmentNoticesCard({ userRole = 'STUDENT' }: DepartmentNoticesCardProps) {
  const [noticeFilter, setNoticeFilter] = useState<NoticeCategory>('ALL')
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Filter notices dynamically based on active category
  const filteredNotices = DEFAULT_NOTICES.filter((notice) => {
    if (noticeFilter === 'ALL') return true
    return notice.category === noticeFilter
  })

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDownload = (id: string, name: string) => {
    setDownloadingId(id)
    setTimeout(() => {
      setDownloadingId(null)
      alert(`Circular attachment "${name}" downloaded successfully.`)
    }, 400)
  }

  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
            <Pin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">Pinned Department Notices & Circulars</h2>
            <span className="text-xs text-[#64748B]">
              Computer Engineering Department • Academic Session 2024-25
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = noticeFilter === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setNoticeFilter(opt.id)}
                className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0D9488] text-white shadow-xs font-semibold'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] font-medium'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notice List */}
      <div className="flex flex-col gap-3 pt-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isAcknowledged = acknowledgedIds.has(notice.id)
            const isDownloading = downloadingId === notice.id

            // Category badge color
            const categoryBadgeStyle =
              notice.category === 'ACADEMIC'
                ? 'bg-[#F1F5F9] text-[#475569]'
                : notice.category === 'EXAMINATION'
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'

            return (
              <div
                key={notice.id}
                className="p-4 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex-shrink-0 flex items-center justify-center text-[#0D9488] mt-0.5 shadow-2xs">
                    {notice.category === 'EXAMINATION' ? (
                      <Calendar className="w-5 h-5" />
                    ) : notice.category === 'PLACEMENT' ? (
                      <Briefcase className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4]">
                        {notice.refNumber}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">{notice.publishedAt}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryBadgeStyle}`}>
                        {notice.categoryLabel}
                      </span>
                      {isAcknowledged && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] inline-flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#0F172A]">{notice.title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">{notice.description}</p>

                    {/* Metadata / Location / Batch if present */}
                    {(notice.location || notice.timing || notice.metaInfo) && (
                      <div className="flex items-center gap-4 text-[#94A3B8] text-[11px] mt-1 flex-wrap">
                        {notice.location && (
                          <span className="flex items-center gap-1">📍 {notice.location}</span>
                        )}
                        {notice.timing && (
                          <span className="flex items-center gap-1">🕐 {notice.timing}</span>
                        )}
                        {notice.metaInfo && (
                          <span className="flex items-center gap-1 text-[#0D9488] font-medium">
                            ℹ️ {notice.metaInfo}
                          </span>
                        )}
                      </div>
                    )}

                    {/* PDF Attachment */}
                    {notice.attachment && (
                      <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-[#E2E8F0] max-w-fit shadow-xs">
                        <svg
                          className="w-4 h-4 text-[#EF4444] flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                          <path d="M14 2v6h6M9 13h6M9 17h4" />
                        </svg>
                        <span className="font-mono text-[11px] text-[#0F172A] font-medium truncate">
                          {notice.attachment.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#94A3B8]">
                          ({notice.attachment.size})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notice.attachment ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(notice.id, notice.attachment!.name)}
                      disabled={isDownloading}
                      className="h-9 px-4 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-medium flex items-center gap-1.5 shadow-xs hover:bg-[#F8FAFC] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{isDownloading ? 'Downloading...' : notice.primaryActionLabel || 'Download Circular'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert(`Opening notice details: ${notice.title}`)}
                      className="h-9 px-4 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-medium flex items-center gap-1.5 shadow-xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      <span>{notice.primaryActionLabel || 'View Details'}</span>
                    </button>
                  )}

                  {notice.secondaryActionLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        if (notice.secondaryActionLabel === 'Acknowledge') {
                          handleAcknowledge(notice.id)
                        } else {
                          alert(`Action triggered: ${notice.secondaryActionLabel}`)
                        }
                      }}
                      className={`h-9 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isAcknowledged
                          ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                          : 'bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {isAcknowledged ? 'Acknowledged' : notice.secondaryActionLabel}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          /* Empty State for category with no circulars */
          <div className="py-10 px-4 text-center rounded-lg bg-[#F8FAFC] border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-[#0F172A]">
                No notices found in {CATEGORY_NAMES[noticeFilter]}
              </p>
              <p className="text-xs text-[#64748B]">
                There are currently no circulars or department announcements under this category.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNoticeFilter('ALL')}
              className="mt-1 px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              View All Notices
            </button>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-4 p-3 rounded-lg bg-[#F1F5F9] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[#475569]">
          <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
          <span className="text-xs">
            Official circulars repository digitally signed by VIIT CE Controller of Examinations.
          </span>
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setNoticeFilter('ALL')
          }}
          className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          Notice Archives (2020–2024)
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
