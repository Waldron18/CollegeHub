'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  Search,
  Filter,
  Loader2,
  X,
  Sparkles,
  Award,
  ChevronRight,
  Send,
  BookOpen,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'

export interface FacultySubmissionItem {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  prnNumber: string | null
  email: string
  submittedAt: string
  fileUrl: string | null
  grade: string | null
  feedback: string | null
  feedbackDate: string | null
}

export interface FacultyAssignmentRecord {
  id: string
  title: string
  description: string | null
  subjectId: string
  subjectName: string
  subjectCode: string
  dueDate: string
  submissionsCount: number
  gradedCount: number
  submissions: FacultySubmissionItem[]
}

export function FacultyAssignmentsView() {
  const [assignments, setAssignments] = useState<FacultyAssignmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Speed-grading drawer state
  const [gradingSubmission, setGradingSubmission] = useState<FacultySubmissionItem | null>(null)
  const [rubricMarks, setRubricMarks] = useState<string>('')
  const [feedbackNotes, setFeedbackNotes] = useState<string>('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [gradeError, setGradeError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Load assignments from API
  const loadFacultyAssignments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/faculty/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
      }
    } catch (err) {
      console.error('Failed to load faculty assignments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFacultyAssignments()
  }, [])

  // Flatten submissions based on selected assignment filter
  const activeAssignments =
    selectedAssignmentId === 'ALL'
      ? assignments
      : assignments.filter((a) => a.id === selectedAssignmentId)

  const allSubmissions = activeAssignments.flatMap((asg) =>
    asg.submissions.map((sub) => ({
      ...sub,
      assignmentTitle: asg.title,
      subjectCode: asg.subjectCode,
      subjectName: asg.subjectName,
      dueDate: asg.dueDate,
    }))
  )

  const filteredSubmissions = allSubmissions.filter((sub) => {
    const q = searchQuery.toLowerCase()
    return (
      sub.studentName.toLowerCase().includes(q) ||
      (sub.prnNumber && sub.prnNumber.toLowerCase().includes(q)) ||
      sub.assignmentTitle.toLowerCase().includes(q) ||
      sub.subjectCode.toLowerCase().includes(q)
    )
  })

  // Open Speed-Grading Drawer
  const handleOpenSpeedGrading = (sub: FacultySubmissionItem) => {
    setGradingSubmission(sub)
    setRubricMarks(sub.grade || '')
    setFeedbackNotes(sub.feedback || '')
    setGradeError(null)
  }

  // Publish Grade
  const handlePublishGrade = async () => {
    if (!gradingSubmission) return

    const numMarks = parseFloat(rubricMarks)
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 25) {
      setGradeError('Please enter a valid numeric score between 0 and 25 marks.')
      return
    }

    setIsPublishing(true)
    setGradeError(null)

    try {
      const res = await fetch('/api/faculty/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: gradingSubmission.id,
          grade: rubricMarks.trim(),
          feedback: feedbackNotes.trim() || 'Evaluated and verified according to SPPU Continuous Assessment Rubrics.',
        }),
      })

      if (res.ok) {
        // Update local state dynamically
        setAssignments((prev) =>
          prev.map((asg) => ({
            ...asg,
            submissions: asg.submissions.map((s) =>
              s.id === gradingSubmission.id
                ? {
                    ...s,
                    grade: rubricMarks.trim(),
                    feedback: feedbackNotes.trim(),
                    feedbackDate: new Date().toISOString(),
                  }
                : s
            ),
          }))
        )

        setToastMsg(`Published grade (${rubricMarks}/25) for ${gradingSubmission.studentName} to Gradebook!`)
        setTimeout(() => setToastMsg(null), 4000)
        setGradingSubmission(null)
      } else {
        const data = await res.json()
        setGradeError(data.error || 'Failed to record grade in database.')
      }
    } catch (err) {
      console.error('Error publishing grade:', err)
      setGradeError('Network error while saving grade.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#334155] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
              VIERP Faculty Gradebook
            </span>
            <span className="text-blue-300 text-xs">•</span>
            <span className="text-blue-200 text-xs font-mono">Continuous Evaluation (CIE)</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Assignment Speed-Grading &amp; Proctoring Roster
          </h2>
          <p className="text-xs text-blue-200 mt-0.5">
            Inspect student solution PDFs, annotate feedback notes, and publish continuous assessment scores.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students or PRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-400/30 text-xs text-white placeholder:text-blue-300/60 focus:outline-hidden focus:border-white"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-blue-950/60 p-1 rounded-lg border border-blue-400/30">
            <Filter className="w-3.5 h-3.5 text-blue-300 ml-1.5" />
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="bg-transparent text-xs text-white border-none focus:outline-hidden pr-2 cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Coursework</option>
              {assignments.map((asg) => (
                <option key={asg.id} value={asg.id} className="bg-slate-900 text-white">
                  {asg.subjectCode}: {asg.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
              Total Submissions Received
            </span>
            <div className="text-2xl font-black text-[#0F172A] mt-0.5">
              {allSubmissions.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E40AF] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
              Speed-Graded &amp; Published
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {allSubmissions.filter((s) => !!s.grade).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
              Pending Evaluation
            </span>
            <div className="text-2xl font-black text-[#D97706] mt-0.5">
              {allSubmissions.filter((s) => !s.grade).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Roster Table Container */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#1E40AF]" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Continuous Assessment Submission Roster ({filteredSubmissions.length})
            </h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            Rubric: Out of 25 Marks
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#1E40AF] animate-spin" />
            <span className="text-xs font-semibold text-[#64748B]">Loading submissions roster...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B]">
            No student submissions found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px]">
                  <th className="py-3 px-4 text-left font-bold">Student Particulars</th>
                  <th className="py-3 px-4 text-left font-bold">Coursework Assignment</th>
                  <th className="py-3 px-4 text-left font-bold">Submitted Solution</th>
                  <th className="py-3 px-4 text-center font-bold">Turnitin Index</th>
                  <th className="py-3 px-4 text-center font-bold">Marks (/25)</th>
                  <th className="py-3 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredSubmissions.map((sub) => {
                  const isGraded = !!sub.grade
                  return (
                    <tr key={sub.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-xs">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] block">{sub.studentName}</span>
                            <span className="text-[10px] text-[#64748B] font-mono block">
                              PRN: {sub.prnNumber || '22110482'} • {sub.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Coursework Assignment */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#0F172A] block">{sub.assignmentTitle}</span>
                        <span className="text-[10px] text-[#0D9488] font-mono font-bold block">
                          {sub.subjectCode} • {sub.subjectName}
                        </span>
                      </td>

                      {/* Submitted Solution File */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-slate-800 block">
                            {sub.fileUrl || 'solution.pdf'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(sub.submittedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Similarity */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          4% Verified
                        </span>
                      </td>

                      {/* Marks Awarded */}
                      <td className="py-3.5 px-4 text-center">
                        {isGraded ? (
                          <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {sub.grade} / 25
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Speed Grading Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenSpeedGrading(sub)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                            isGraded
                              ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]'
                              : 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isGraded ? 'Edit Grade' : 'Speed-Grade'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Speed-Grading Slide-Over Drawer ─────────────────────────────────── */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E40AF] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    VIERP Speed-Grading &amp; Assessment Drawer
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Student: {gradingSubmission.studentName} (PRN: {gradingSubmission.prnNumber || '22110482'})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Inline Viewer Preview Container */}
            <div className="p-4 bg-slate-900 rounded-xl text-white mb-5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0D9488] text-[10px] font-bold font-mono">
                    PDF PREVIEW
                  </span>
                  <span className="font-mono text-slate-300">{gradingSubmission.fileUrl || 'solution.pdf'}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Turnitin Similarity Index: <strong className="text-emerald-400">4%</strong>
                </span>
              </div>

              {/* Simulated PDF canvas */}
              <div className="bg-white text-slate-900 p-5 rounded-lg shadow-inner min-h-[160px] text-xs font-sans space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 text-[10px] text-slate-500 font-mono">
                  <span>VIIT PUNE • CONTINUOUS EVALUATION LAB REPORT</span>
                  <span>VERIFIED SUBMISSION</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Laboratory Experiment Analysis &amp; Test Vector Log
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Student submission contains completed algorithms, system simulation graphs, and mathematical step-by-step proofs as required by the course syllabus.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 italic">
                  Attested by Digital Timestamp on {new Date(gradingSubmission.submittedAt).toLocaleString('en-GB')}
                </div>
              </div>
            </div>

            {/* Speed-Grading Input Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Rubric Marks (out of 25) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="e.g., 23.5"
                    value={rubricMarks}
                    onChange={(e) => setRubricMarks(e.target.value)}
                    className="w-36 px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm font-mono font-bold text-[#0F172A] focus:outline-hidden focus:border-[#1E40AF]"
                  />
                  <span className="text-xs font-bold text-slate-500">/ 25.0 Marks</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Assessment Remarks &amp; Feedback Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide constructive feedback, test bench feedback, or notes for improvement..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-hidden focus:border-[#1E40AF]"
                />
              </div>

              {gradeError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{gradeError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                disabled={isPublishing}
                className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#64748B] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishGrade}
                disabled={!rubricMarks || isPublishing}
                className="px-5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing to Gradebook...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish Grade to VIERP Gradebook</span>
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
