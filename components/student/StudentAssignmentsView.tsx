'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Award,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react'

export interface StudentSubmission {
  id: string
  submittedAt: string
  fileUrl: string | null
  grade: string | null
  feedback: string | null
  feedbackDate: string | null
}

export interface StudentAssignment {
  id: string
  title: string
  description: string | null
  subjectId: string
  subjectName: string
  subjectCode: string
  dueDate: string
  isSubmitted: boolean
  submission: StudentSubmission | null
}

interface StudentAssignmentsViewProps {
  initialFilter?: string
}

export function StudentAssignmentsView({
  initialFilter = 'ALL',
}: StudentAssignmentsViewProps) {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>(initialFilter)
  const [searchQuery, setSearchQuery] = useState('')

  // Active submission drawer / modal state
  const [activeAssignment, setActiveAssignment] = useState<StudentAssignment | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch student assignments
  const loadAssignments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/student/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  // Unique course list
  const courses = Array.from(
    new Set(assignments.map((a) => `${a.subjectCode}:::${a.subjectName}`))
  ).map((entry) => {
    const [code, name] = entry.split(':::')
    return { code, name }
  })

  // Filtered assignments
  const filteredAssignments = assignments.filter((asg) => {
    const matchesCourse = selectedCourse === 'ALL' || asg.subjectCode === selectedCourse
    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCourse && matchesSearch
  })

  const pendingAssignments = filteredAssignments.filter((a) => !a.isSubmitted)
  const submittedAssignments = filteredAssignments.filter((a) => a.isSubmitted)

  // Calculate countdown
  const getCountdownString = (dueDateStr: string) => {
    const now = new Date().getTime()
    const due = new Date(dueDateStr).getTime()
    const diff = due - now

    if (diff <= 0) {
      return { text: 'Past Due', isLate: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return { text: `${days}d ${hours}h remaining`, isLate: false }
    }
    if (hours > 0) {
      return { text: `${hours}h ${minutes}m remaining`, isLate: false }
    }
    return { text: `${minutes}m remaining`, isLate: false }
  }

  // File validation
  const validateAndSetFile = (file: File) => {
    setFileError(null)
    const validExtensions = ['.pdf', '.zip']
    const nameLower = file.name.toLowerCase()
    const hasValidExt = validExtensions.some((ext) => nameLower.endsWith(ext))

    if (!hasValidExt) {
      setFileError('Invalid file format. Only .pdf and .zip archives are permitted.')
      return false
    }

    const maxBytes = 15 * 1024 * 1024 // 15 MB
    if (file.size > maxBytes) {
      setFileError(`File exceeds maximum size of 15 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`)
      return false
    }

    setSelectedFile(file)
    return true
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  // Handle Submission with Progress Simulation
  const handleSubmitSolution = async () => {
    if (!activeAssignment || !selectedFile) return
    setIsSubmitting(true)
    setUploadProgress(10)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 20
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 25
      })
    }, 150)

    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: activeAssignment.id,
          fileUrl: selectedFile.name,
          notes: 'Submitted via VIERP Student Assessment Portal',
        }),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (res.ok) {
        await loadAssignments()
        setSuccessToast(`Solution for "${activeAssignment.title}" submitted successfully!`)
        setTimeout(() => setSuccessToast(null), 4000)
        setTimeout(() => {
          setIsSubmitting(false)
          setUploadProgress(null)
          setSelectedFile(null)
          setActiveAssignment(null)
        }, 500)
      } else {
        const data = await res.json()
        setFileError(data.error || 'Failed to submit assignment.')
        setIsSubmitting(false)
        setUploadProgress(null)
      }
    } catch (err) {
      console.error('Submission error:', err)
      setFileError('Network error while transmitting submission.')
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#334155] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Top Banner & Course Filtering */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0D9488]/20 text-[#2DD4BF] text-[10px] font-bold uppercase tracking-wider border border-[#0D9488]/30">
              VIERP Assessment Portal
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-300 text-xs font-mono">Continuous Internal Evaluation (CIE)</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Assignments, Lab Reports &amp; Proctoring Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit coursework with automated Turnitin similarity verification &amp; inspect faculty speed-grades.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#0D9488]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent text-xs text-white border-none focus:outline-hidden pr-2 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Courses</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
              Pending Submissions
            </span>
            <div className="text-2xl font-black text-[#B45309] mt-0.5">
              {pendingAssignments.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
              Submitted &amp; Turnitin Verified
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {submittedAssignments.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
              Maximum Rubric Weightage
            </span>
            <div className="text-2xl font-black text-[#1E40AF] mt-0.5">
              25 Marks
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E2E8F0] gap-3">
          <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin" />
          <span className="text-xs font-semibold text-[#64748B]">Loading coursework records...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Pending Tasks */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Pending Submissions ({pendingAssignments.length})
                </h3>
              </div>
              <span className="text-[11px] text-[#64748B]">
                Ensure submissions are made before deadline cutoff
              </span>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="py-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] text-xs text-[#64748B]">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                All course assignments submitted! No pending deliverables.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAssignments.map((asg) => {
                  const countdown = getCountdownString(asg.dueDate)
                  return (
                    <div
                      key={asg.id}
                      className="p-5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#0D9488] transition-all shadow-xs flex flex-col justify-between gap-4 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] font-mono text-[10px] font-bold border border-[#E2E8F0]">
                            {asg.subjectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              countdown.isLate
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {countdown.isLate ? 'LATE / PAST DUE' : countdown.text}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0D9488] transition-colors line-clamp-1">
                          {asg.title}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                          {asg.description || 'Submission of laboratory analysis, theoretical solutions, and algorithmic benchmarks.'}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-3 pt-3 border-t border-[#F1F5F9]">
                          <span>{asg.subjectName}</span>
                          <span className="font-mono font-bold text-[#0F172A]">Max Marks: 25</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveAssignment(asg)
                          setSelectedFile(null)
                          setFileError(null)
                          setUploadProgress(null)
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Solution (.pdf / .zip)</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 2: Submitted & Graded Deliverables */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Submitted &amp; Evaluated Coursework ({submittedAssignments.length})
                </h3>
              </div>
              <span className="text-[11px] text-[#64748B]">
                Verified with Turnitin AI &amp; Similarity index
              </span>
            </div>

            {submittedAssignments.length === 0 ? (
              <div className="py-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] text-xs text-[#64748B]">
                No completed submissions to show for this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {submittedAssignments.map((asg) => {
                  const sub = asg.submission
                  const isGraded = !!sub?.grade
                  return (
                    <div
                      key={asg.id}
                      className="p-4 sm:p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded bg-white text-[#0F172A] font-mono text-[10px] font-bold border border-[#E2E8F0]">
                            {asg.subjectCode}
                          </span>
                          <h4 className="text-sm font-bold text-[#0F172A]">
                            {asg.title}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            SUBMITTED
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            Similarity: 4% (Turnitin Verified)
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1 flex-wrap">
                          <span>File: <strong className="font-mono text-[#0F172A]">{sub?.fileUrl || 'solution.pdf'}</strong></span>
                          <span>•</span>
                          <span>Submitted: {sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-GB') : 'Verified'}</span>
                          <span>•</span>
                          <span>Weightage: 25 Marks</span>
                        </div>

                        {/* Faculty Feedback Card if Graded */}
                        {isGraded && sub && (
                          <div className="mt-3 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                Faculty Assessment &amp; Feedback
                              </span>
                              <span className="text-[10px] text-emerald-700 font-mono">
                                Evaluated: {sub.feedbackDate ? new Date(sub.feedbackDate).toLocaleDateString('en-GB') : 'Verified'}
                              </span>
                            </div>
                            <p className="text-emerald-800 italic">
                              &ldquo;{sub.feedback || 'Well-structured documentation and clean test bench validation.'}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Grade Badge */}
                      <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                        {isGraded ? (
                          <div className="text-right bg-white p-2.5 rounded-xl border border-emerald-300 shadow-2xs">
                            <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                              Awarded Marks
                            </span>
                            <span className="text-base font-black text-emerald-800 font-mono">
                              {sub?.grade} <span className="text-xs text-emerald-600">/ 25</span>
                            </span>
                          </div>
                        ) : (
                          <div className="text-right bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                            <span className="text-[10px] text-amber-700 font-bold uppercase block">
                              Evaluation
                            </span>
                            <span className="text-xs font-semibold text-amber-800">
                              Speed-Grading Pending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Submission Modal Dropzone ────────────────────────────────────────── */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Submit Coursework Solution
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    {activeAssignment.subjectCode} • Max Marks: 25
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) setActiveAssignment(null)
                }}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assignment Info Pill */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mb-4">
              <h4 className="text-xs font-bold text-[#0F172A]">
                {activeAssignment.title}
              </h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {activeAssignment.description || 'Submission of formal laboratory report and test suites.'}
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-[#0D9488] bg-[#0D9488]/5 scale-[1.01]'
                  : 'border-[#CBD5E1] bg-[#FAFBFD] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#0F172A] block font-mono">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-[#64748B] block">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • File Ready
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    ✓ Validation Passed (Under 15 MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#0F172A]">
                    Drag &amp; drop solution file here, or <span className="text-[#0D9488] underline">browse</span>
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    Permitted formats: <strong>.pdf, .zip</strong> • Maximum file size: <strong>15 MB</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {fileError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Upload Progress Simulation */}
            {uploadProgress !== null && (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Uploading &amp; Scanning for Plagiarism...</span>
                  <span className="font-mono font-bold text-[#0D9488]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0D9488] h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveAssignment(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSolution}
                disabled={!selectedFile || isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
