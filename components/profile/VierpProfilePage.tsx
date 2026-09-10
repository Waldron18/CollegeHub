'use client'

import React, { useState, useRef } from 'react'
import {
  User,
  Phone,
  Users,
  GraduationCap,
  Bookmark,
  Building,
  Upload,
  FileText,
  Trophy,
  Briefcase,
  Camera,
  Cloud,
  ShieldCheck,
  UserCheck,
  Target,
  CheckCircle2,
  Lock,
  Printer,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Save,
  ArrowLeft,
  ArrowRight,
  Plus,
  Info,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  FolderOpen,
  Pencil,
  List,
  HeartPulse,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudentProfile } from '@/types/dashboard'
import type { ActiveView } from '@/components/Sidebar'

interface VierpProfilePageProps {
  profile?: StudentProfile | null
  onNavigate?: (view: ActiveView) => void
}

interface RailItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const STUDENT_RAILS: RailItem[] = [
  { id: 'personal', label: 'Personal Profile', icon: User },
  { id: 'address', label: 'Contact & Address', icon: Phone },
  { id: 'family', label: 'Family Details', icon: Users },
  { id: 'education', label: 'Education & Academics', icon: GraduationCap },
  { id: 'undertakings', label: 'Undertakings / Circulars', icon: Bookmark },
  { id: 'bank', label: 'Bank Details', icon: Building },
  { id: 'documents', label: 'Document Uploads', icon: Upload },
  { id: 'experience', label: 'Experience & Certificates', icon: FileText },
  { id: 'awards', label: 'Awards & Honors', icon: Trophy },
  { id: 'activities', label: 'Extracurricular Activities', icon: Briefcase },
  { id: 'photos', label: 'Photos & Signatures', icon: Camera },
  { id: 'cloud', label: 'Cloud Storage & Drive', icon: Cloud },
  { id: 'antiragging', label: 'Anti-Ragging Compliance', icon: ShieldCheck },
  { id: 'skills', label: 'Skills & Competencies', icon: UserCheck },
  { id: 'interests', label: 'Interests & Hobbies', icon: Target },
]

const FACULTY_RAILS: RailItem[] = [
  { id: 'personal', label: 'Institutional & Personal', icon: User },
  { id: 'address', label: 'Cabin & Residential', icon: Phone },
  { id: 'education', label: 'Academic Qualifications', icon: GraduationCap },
  { id: 'research', label: 'Research & Publications', icon: Bookmark },
  { id: 'bank', label: 'Payroll & Bank Accounts', icon: Building },
  { id: 'documents', label: 'Certificates & Documents', icon: Upload },
  { id: 'awards', label: 'Fellowships & Awards', icon: Trophy },
  { id: 'photos', label: 'Official Photo & Sign', icon: Camera },
]

// ── Reusable VIERP Iconic Form Inputs ──────────────────────────────────────────

interface VierpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  locked?: boolean
  rightElement?: React.ReactNode
}

function VierpInput({ label, required, locked, rightElement, className, ...props }: VierpInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#475569] mb-1.5">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
          {locked ? (
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Pencil className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </div>
        <input
          {...props}
          disabled={locked || props.disabled}
          className={cn(
            'w-full h-10 pl-9 pr-3 rounded-lg border text-xs font-medium transition-all focus:outline-none',
            locked
              ? 'border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B] font-mono cursor-not-allowed select-none'
              : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]',
            rightElement && 'pr-10',
            className
          )}
        />
        {locked ? (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 pointer-events-none">
            Locked
          </div>
        ) : (
          rightElement && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )
        )}
      </div>
    </div>
  )
}

interface VierpSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  children: React.ReactNode
}

function VierpSelect({ label, required, children, className, ...props }: VierpSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#475569] mb-1.5">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
          <List className="w-3.5 h-3.5" />
        </div>
        <select
          {...props}
          className={cn(
            'w-full h-10 pl-9 pr-8 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#0F172A] appearance-none transition-all focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none cursor-pointer',
            className
          )}
        >
          {children}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  )
}

interface VierpTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
}

function VierpTextarea({ label, required, className, ...props }: VierpTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#475569] mb-1.5">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-3 pointer-events-none text-[#94A3B8]">
          <Pencil className="w-3.5 h-3.5" />
        </div>
        <textarea
          {...props}
          className={cn(
            'w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#0F172A] transition-all focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none',
            className
          )}
        />
      </div>
    </div>
  )
}

// ── Main VierpProfilePage Component ──────────────────────────────────────────

export default function VierpProfilePage({ profile, onNavigate }: VierpProfilePageProps) {
  const isFaculty = profile?.role === 'FACULTY'
  const rails = isFaculty ? FACULTY_RAILS : STUDENT_RAILS

  const [activeRail, setActiveRail] = useState<string>('personal')
  const [showAadhaar, setShowAadhaar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Sub-tab states
  const [personalSubTab, setPersonalSubTab] = useState<
    'personal_details' | 'identity' | 'religion' | 'handicapped' | 'minority' | 'passport' | 'examination' | 'medical'
  >('personal_details')
  const [addressSubTab, setAddressSubTab] = useState<'permanent' | 'current' | 'emergency'>('permanent')
  const [familySubTab, setFamilySubTab] = useState<'father' | 'mother' | 'brother' | 'sister'>('father')
  const [educationSubTab, setEducationSubTab] = useState<
    'ssc' | 'hsc' | 'qualifying' | 'diploma' | 'graduation' | 'post_grad' | 'gap_year'
  >('ssc')
  const [bankSubTab, setBankSubTab] = useState<'bank_info' | 'loan' | 'sponsorship'>('bank_info')
  const [documentSubTab, setDocumentSubTab] = useState<'verified_docs' | 'additional_docs'>('verified_docs')

  // Photo & Signature Upload State
  const photoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null)
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const [selectedSignPreview, setSelectedSignPreview] = useState<string | null>(null)
  const [selectedSignName, setSelectedSignName] = useState<string | null>(null)

  // Form data state
  const [formData, setFormData] = useState({
    firstName: isFaculty ? 'Rajesh' : 'Aditya',
    middleName: isFaculty ? 'Suresh' : '',
    lastName: isFaculty ? 'Kulkarni' : 'Sharma',
    category: 'OPEN',
    caste: 'General / Brahmin',
    subCaste: 'Deshastha',
    nationality: 'Indian',
    domicile: 'Maharashtra',
    mobileNumber: '+91 98230 11492',
    alternateMobile: '+91 98220 54129',
    personalEmail: profile?.email || (isFaculty ? 'rajesh.kulkarni@college.edu' : 'aditya@college.edu'),
    birthPlace: 'Pune, Maharashtra',
    bloodGroup: 'B +ve',
    earningParent: 'Sanjay Sharma',
    earningParentRelation: 'Father',

    // Identity (Strictly synthetic mock / masked values)
    aadhaarNumber: '•••• •••• 4821',
    nameAsPerAadhaar: isFaculty ? 'Prof. Rajesh Kulkarni' : 'Aditya Sharma',
    panNumber: '[Redacted Mock ID]',
    voterId: '[Redacted Mock ID]',

    // Examination / Academic
    eligibilityNumber: '12022094819',
    abcId: '912-384-102-491',
    prnNumber: profile?.prnNumber || (isFaculty ? 'EMP-CE-402' : '22110482'),
    program: isFaculty ? 'Faculty • Computer Engineering' : 'B.Tech Computer Engineering (Semester 5)',
    admissionYear: '2022',

    // Address
    permanentAddress: 'Flat 402, Royal Palms, Paud Road, Kothrud, Pune - 411038, Maharashtra',
    currentAddress: 'Flat 402, Royal Palms, Paud Road, Kothrud, Pune - 411038, Maharashtra',
    country: 'India',
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Pune',
    taluka: 'Haveli',
    pincode: '411038',
    isSameAddress: true,

    // Emergency Contact
    emergencyName: 'Sanjay Sharma',
    emergencyMobile: '+91 98220 54129',
    emergencyPhone: '020-25449102',
    emergencyCity: 'Pune',
    emergencyRelation: 'Father',
    emergencyAge: '52',

    // Bank Details (Locked by Accounts)
    accountNumber: '39481029481',
    accountHolder: isFaculty ? 'Prof. Rajesh Kulkarni' : 'Aditya Sharma',
    bankName: 'State Bank of India',
    branchName: 'VIIT Campus Branch, Kondhwa, Pune',
    ifscCode: 'SBIN0014829',
    micrCode: '411002081',
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (stepName: string) => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setToastMsg(`${stepName} saved successfully to VIERP ERP database.`)
      setTimeout(() => setToastMsg(null), 4000)
    }, 600)
  }

  // Determine dynamic primary bottom action button text
  const getPrimaryButtonLabel = () => {
    if (activeRail === 'family') return 'SAVE FAMILY DETAILS'
    if (activeRail === 'bank') return 'SAVE BANK DETAILS'
    if (activeRail === 'personal' && personalSubTab === 'examination') return 'SAVE DETAILS'
    const currentIndex = rails.findIndex((r) => r.id === activeRail)
    if (currentIndex === rails.length - 1) return 'FINISH'
    return 'SAVE AND NEXT'
  }

  const handleNextRail = () => {
    const currentIndex = rails.findIndex((r) => r.id === activeRail)
    if (currentIndex < rails.length - 1) {
      setActiveRail(rails[currentIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSave('Profile Dossier')
    }
  }

  const handlePrevRail = () => {
    const currentIndex = rails.findIndex((r) => r.id === activeRail)
    if (currentIndex > 0) {
      setActiveRail(rails[currentIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'jpg' && ext !== 'jpeg') {
      setPhotoError('Photo Should be in .jpg/.jpeg format only.')
      return
    }

    if (file.size > 500 * 1024) {
      setPhotoError('Photo size must be <= 500 Kb.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedPhotoPreview(reader.result as string)
      setSelectedPhotoName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleSignSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedSignPreview(reader.result as string)
      setSelectedSignName(file.name)
    }
    reader.readAsDataURL(file)
  }

  // Render "Oops.. Data Not Found!" Empty State
  const renderEmptyState = (categoryTitle: string, actionLabel: string) => (
    <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
      {/* Centered Purple Folder Illustration */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border-2 border-[#E9D5FF] flex items-center justify-center text-[#9333EA] shadow-lg shadow-purple-500/10">
          <FolderOpen className="w-12 h-12 stroke-[1.75]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#E9D5FF] flex items-center justify-center shadow-xs">
          <span className="text-[11px] font-black text-[#9333EA]">0</span>
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-[#DC2626] tracking-tight">
        Oops.. Data Not Found!
      </h3>
      <p className="text-xs text-[#64748B] mt-2 max-w-md leading-relaxed">
        No active records registered in <strong className="text-[#334155]">{categoryTitle}</strong> for Academic Year 2024–25. Click below to submit new entries for verification.
      </p>

      <button
        type="button"
        onClick={() => {
          setToastMsg(`${actionLabel} request recorded. Portal admin review pending.`)
          setTimeout(() => setToastMsg(null), 3500)
        }}
        className="mt-6 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>{actionLabel}</span>
      </button>
    </div>
  )

  return (
    <div className="w-full pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#334155] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
          <span className="text-xs font-medium">{toastMsg}</span>
        </div>
      )}

      {/* ── Screen-Only: Top Sub-Navigation Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between py-3 px-1 mb-4 border-b border-[#E2E8F0] print:hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#64748B]">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="hover:text-[#0D9488] font-medium transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#0F172A] font-semibold">User Profile</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#0D9488] font-medium">
            {rails.find((r) => r.id === activeRail)?.label}
          </span>
        </div>

        {/* Action Button: Amber Print Profile Details */}
        <button
          type="button"
          onClick={() => window.print()}
          title="Print official VIERP profile dossier"
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-4 py-1.5 rounded-md text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>PROFILE DETAILS</span>
        </button>
      </div>

      {/* ── Screen-Only: Two-Column Interactive Layout ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start print:hidden">
        {/* Left Column: Pill-Shaped Vertical Rail */}
        <aside className="w-full lg:w-16 flex-shrink-0 bg-[#DCEEFE] p-2 rounded-2xl shadow-sm border border-[#BAE6FD] flex lg:flex-col items-center justify-start gap-2 overflow-x-auto lg:overflow-x-visible">
          {rails.map((item, index) => {
            const Icon = item.icon
            const isActive = activeRail === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveRail(item.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                title={`${index + 1}. ${item.label}`}
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 relative group',
                  isActive
                    ? 'bg-[#1E40AF] text-white shadow-md scale-105'
                    : 'text-[#1E40AF] hover:bg-[#BFDBFE] hover:text-[#1E3A8A]'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden lg:group-hover:block absolute left-14 bg-[#0F172A] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-30 pointer-events-none">
                  {item.label}
                </span>
              </button>
            )
          })}
        </aside>

        {/* Main Center Container: White Card */}
        <main className="flex-1 w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[640px]">
          {/* Header Banner inside Card */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center font-bold">
                {rails.findIndex((r) => r.id === activeRail) + 1}
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A] leading-tight">
                  {rails.find((r) => r.id === activeRail)?.label}
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  VIERP Institutional Academic Dossier • AY 2024–25
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#64748B] bg-white px-3 py-1 rounded-lg border border-[#E2E8F0]">
              <span>PRN: {formData.prnNumber}</span>
            </div>
          </div>

          {/* ================= RAIL 1: PERSONAL DETAILS ================= */}
          {activeRail === 'personal' && (
            <div className="flex-1 flex flex-col">
              {/* Top Horizontal Sub-Tabs */}
              <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'personal_details', label: 'PERSONAL DETAILS' },
                  { id: 'identity', label: 'IDENTITY' },
                  { id: 'religion', label: 'RELIGION' },
                  { id: 'handicapped', label: 'PHYSICALLY HANDICAPPED' },
                  { id: 'minority', label: 'MINORITY DETAILS' },
                  { id: 'passport', label: 'PASSPORT DETAILS' },
                  { id: 'examination', label: 'EXAMINATION DETAILS' },
                  { id: 'medical', label: 'MEDICAL RECORDS' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPersonalSubTab(tab.id as any)}
                    className={cn(
                      'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                      personalSubTab === tab.id
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sub-Tab Content */}
              <div className="p-6 flex-1">
                {personalSubTab === 'personal_details' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <VierpInput
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                    <VierpInput
                      label="Middle Name"
                      value={formData.middleName}
                      onChange={(e) => handleChange('middleName', e.target.value)}
                    />
                    <VierpInput
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                    <VierpInput
                      label="Official Email"
                      readOnly
                      value={formData.personalEmail}
                      className="bg-[#F8FAFC] text-[#64748B]"
                    />
                    <VierpSelect
                      label="Category"
                      required
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </VierpSelect>
                    <VierpInput
                      label="Caste"
                      value={formData.caste}
                      onChange={(e) => handleChange('caste', e.target.value)}
                    />
                    <VierpInput
                      label="Nationality"
                      required
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value)}
                    />
                    <VierpInput
                      label="Domicile"
                      required
                      value={formData.domicile}
                      onChange={(e) => handleChange('domicile', e.target.value)}
                    />
                    <VierpInput
                      label="Mobile Number"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    />
                    <VierpInput
                      label="Birth Place"
                      value={formData.birthPlace}
                      onChange={(e) => handleChange('birthPlace', e.target.value)}
                    />
                    <VierpSelect
                      label="Blood Group"
                      required
                      value={formData.bloodGroup}
                      onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    >
                      <option value="A +ve">A +ve</option>
                      <option value="B +ve">B +ve</option>
                      <option value="O +ve">O +ve</option>
                      <option value="AB +ve">AB +ve</option>
                      <option value="O -ve">O -ve</option>
                    </VierpSelect>
                    <VierpInput
                      label="Earning Parent Relation"
                      value={formData.earningParentRelation}
                      onChange={(e) => handleChange('earningParentRelation', e.target.value)}
                    />
                  </div>
                )}

                {personalSubTab === 'identity' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <VierpInput
                      label="Aadhaar Card Number (Govt. ID)"
                      type={showAadhaar ? 'text' : 'password'}
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                      className="font-mono"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          className="text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
                        >
                          {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                    <VierpInput
                      label="Name as per Aadhaar"
                      value={formData.nameAsPerAadhaar}
                      onChange={(e) => handleChange('nameAsPerAadhaar', e.target.value)}
                    />
                    <VierpInput
                      label="PAN Card Number"
                      value={formData.panNumber}
                      onChange={(e) => handleChange('panNumber', e.target.value)}
                      className="font-mono"
                    />
                    <VierpInput
                      label="Voter ID / EPIC No."
                      value={formData.voterId}
                      onChange={(e) => handleChange('voterId', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                )}

                {personalSubTab === 'examination' && (
                  <div className="space-y-5 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <VierpInput
                          label="Academic Bank of Credits (ABC ID)"
                          value={formData.abcId}
                          onChange={(e) => handleChange('abcId', e.target.value)}
                          className="font-mono font-bold bg-[#F0FDF4] border-[#86EFAC]"
                        />
                        <a
                          href="https://www.abc.gov.in"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#2563EB] hover:underline mt-1.5 inline-flex items-center gap-1"
                        >
                          Don&apos;t have an ABC ID? Click Here <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div>
                        <VierpInput
                          label="University Eligibility Number"
                          value={formData.eligibilityNumber}
                          readOnly
                          className="font-mono bg-[#F8FAFC] text-[#475569]"
                        />
                        <span className="text-[10px] text-[#64748B] mt-1 block">Issued by SPPU University</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] flex items-start gap-3">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Academic Bank of Credits Notice</span>
                        ABC ID is mandatory for receiving degrees and grade transcripts from SPPU Pune. Ensure this matches your DigiLocker registered mobile number.
                      </div>
                    </div>
                  </div>
                )}

                {personalSubTab === 'medical' && renderEmptyState('Medical & Health Records', '+ MEDICAL')}

                {(personalSubTab === 'religion' ||
                  personalSubTab === 'handicapped' ||
                  personalSubTab === 'minority' ||
                  personalSubTab === 'passport') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                      <span className="text-xs font-semibold text-[#64748B] block">Category Status</span>
                      <span className="text-sm font-bold text-[#0F172A] mt-1 block">Registered & Verified</span>
                      <span className="text-[11px] text-[#10B981] mt-0.5 block">✓ Academic Verification Complete</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                      <span className="text-xs font-semibold text-[#64748B] block">Documentation Record</span>
                      <span className="text-sm font-bold text-[#0F172A] mt-1 block">Government Attested</span>
                      <span className="text-[11px] text-[#64748B] mt-0.5 block">No additional certificates requested</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= RAIL 2: CONTACT & ADDRESS ================= */}
          {activeRail === 'address' && (
            <div className="flex-1 flex flex-col">
              <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'permanent', label: 'PERMANENT ADDRESS' },
                  { id: 'current', label: 'CURRENT ADDRESS' },
                  { id: 'emergency', label: 'EMERGENCY CONTACT' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAddressSubTab(tab.id as any)}
                    className={cn(
                      'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                      addressSubTab === tab.id
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 flex-1">
                {addressSubTab === 'permanent' && (
                  <div className="space-y-4 max-w-3xl">
                    <VierpTextarea
                      label="Permanent Address Line"
                      required
                      rows={2}
                      value={formData.permanentAddress}
                      onChange={(e) => handleChange('permanentAddress', e.target.value)}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <VierpInput
                        label="Country"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                      />
                      <VierpInput
                        label="State"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      />
                      <VierpInput
                        label="District"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                      />
                      <VierpInput
                        label="City"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                      <VierpInput
                        label="Taluka"
                        value={formData.taluka}
                        onChange={(e) => handleChange('taluka', e.target.value)}
                      />
                      <VierpInput
                        label="Pin Code"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#0F172A] font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isSameAddress}
                          onChange={(e) => handleChange('isSameAddress', e.target.checked)}
                          className="rounded text-[#2563EB] focus:ring-0 cursor-pointer"
                        />
                        <span>Whether Permanent Address is Same as Current Address?</span>
                      </label>
                    </div>
                  </div>
                )}

                {addressSubTab === 'current' && (
                  <div className="space-y-4 max-w-3xl">
                    <VierpTextarea
                      label="Current Address Line"
                      required
                      rows={2}
                      value={formData.currentAddress}
                      onChange={(e) => handleChange('currentAddress', e.target.value)}
                    />
                  </div>
                )}

                {addressSubTab === 'emergency' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <VierpInput
                      label="Emergency Contact Name"
                      required
                      value={formData.emergencyName}
                      onChange={(e) => handleChange('emergencyName', e.target.value)}
                    />
                    <VierpInput
                      label="Primary Mobile Number"
                      required
                      value={formData.emergencyMobile}
                      onChange={(e) => handleChange('emergencyMobile', e.target.value)}
                    />
                    <VierpInput
                      label="Relation"
                      value={formData.emergencyRelation}
                      onChange={(e) => handleChange('emergencyRelation', e.target.value)}
                    />
                    <VierpInput
                      label="City"
                      value={formData.emergencyCity}
                      onChange={(e) => handleChange('emergencyCity', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= RAIL 3: FAMILY DETAILS ================= */}
          {activeRail === 'family' && (
            <div className="flex-1 flex flex-col">
              <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'father', label: "FATHER'S DETAILS" },
                  { id: 'mother', label: "MOTHER'S DETAILS" },
                  { id: 'brother', label: "BROTHER'S DETAILS" },
                  { id: 'sister', label: "SISTER'S DETAILS" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFamilySubTab(tab.id as any)}
                    className={cn(
                      'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                      familySubTab === tab.id
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
                  <VierpInput
                    label="Full Name"
                    required
                    defaultValue={familySubTab === 'father' ? 'Sanjay Sharma' : familySubTab === 'mother' ? 'Sunita Sharma' : 'N/A'}
                  />
                  <VierpInput
                    label="Education / Qualification"
                    defaultValue={familySubTab === 'father' ? 'B.Com, Pune University' : 'M.A., Pune University'}
                  />
                  <VierpInput
                    label="Occupation"
                    defaultValue={familySubTab === 'father' ? 'Senior Accountant' : 'Homemaker'}
                  />
                  <VierpInput
                    label="Annual Income (in Rs.)"
                    defaultValue={familySubTab === 'father' ? '₹ 8,50,000' : '₹ 0'}
                    className="font-mono"
                  />
                  <VierpInput
                    label="Mobile Number"
                    defaultValue="+91 98220 54129"
                  />
                  <VierpInput
                    label="Email ID"
                    defaultValue="sanjay.sharma@gmail.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= RAIL 4: EDUCATION & ACADEMICS ================= */}
          {activeRail === 'education' && (
            <div className="flex-1 flex flex-col">
              <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'ssc', label: 'SSC/10TH MARKS' },
                  { id: 'hsc', label: 'HSC/12TH MARKS' },
                  { id: 'qualifying', label: 'QUALIFYING EXAM' },
                  { id: 'graduation', label: 'ENGINEERING SEMESTERS' },
                  { id: 'gap_year', label: 'GAP IN ACADEMIC YEAR' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEducationSubTab(tab.id as any)}
                    className={cn(
                      'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                      educationSubTab === tab.id
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 flex-1">
                {educationSubTab === 'ssc' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl">
                    <VierpInput
                      label="Board Name"
                      readOnly
                      value="Maharashtra State Board (MSBSHSE)"
                      className="bg-[#F8FAFC]"
                    />
                    <VierpInput
                      label="Passing Year"
                      readOnly
                      value="2020"
                      className="font-mono bg-[#F8FAFC]"
                    />
                    <VierpInput
                      label="Percentage Obtained"
                      readOnly
                      value="94.60%"
                      className="font-mono font-bold text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]"
                    />
                  </div>
                )}

                {educationSubTab === 'hsc' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl">
                    <VierpInput
                      label="Board Name"
                      readOnly
                      value="Maharashtra State Board (MSBSHSE)"
                      className="bg-[#F8FAFC]"
                    />
                    <VierpInput
                      label="Passing Year"
                      readOnly
                      value="2022"
                      className="font-mono bg-[#F8FAFC]"
                    />
                    <VierpInput
                      label="Percentage Obtained"
                      readOnly
                      value="92.40%"
                      className="font-mono font-bold text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]"
                    />
                  </div>
                )}

                {educationSubTab === 'qualifying' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl">
                    <VierpInput
                      label="Qualifying Entrance Exam"
                      readOnly
                      value="MHT-CET 2022 (PCM)"
                      className="bg-[#F8FAFC]"
                    />
                    <VierpInput
                      label="Application No / Roll No"
                      readOnly
                      value="220941829"
                      className="font-mono bg-[#F8FAFC]"
                    />
                    <VierpInput
                      label="Score / Percentile"
                      readOnly
                      value="98.42 Percentile"
                      className="font-mono font-bold text-[#1E40AF] bg-[#EFF6FF] border-[#BFDBFE]"
                    />
                  </div>
                )}

                {educationSubTab === 'graduation' && (
                  <div className="space-y-4 max-w-4xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#0F172A]">Semester Performance Ledgers</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono font-bold text-xs">
                          CGPA: 9.18 / 10.0
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setToastMsg('Latest SGPA & credit ledgers fetched from SPPU COE portal.')
                          setTimeout(() => setToastMsg(null), 3000)
                        }}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <span>FETCH CGPA</span>
                      </button>
                    </div>

                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
                          <tr>
                            <th className="p-3">Semester</th>
                            <th className="p-3">Academic Session</th>
                            <th className="p-3">Credits Earned</th>
                            <th className="p-3">SGPA</th>
                            <th className="p-3">Result Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          <tr>
                            <td className="p-3 font-semibold text-[#0F172A]">Semester I</td>
                            <td className="p-3 text-[#64748B]">AY 2022–23 Sem I</td>
                            <td className="p-3 font-mono">22</td>
                            <td className="p-3 font-mono font-bold text-[#0D9488]">9.12</td>
                            <td className="p-3"><span className="text-[#10B981] font-semibold">PASS (Distinction)</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-[#0F172A]">Semester II</td>
                            <td className="p-3 text-[#64748B]">AY 2022–23 Sem II</td>
                            <td className="p-3 font-mono">22</td>
                            <td className="p-3 font-mono font-bold text-[#0D9488]">9.24</td>
                            <td className="p-3"><span className="text-[#10B981] font-semibold">PASS (Distinction)</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-[#0F172A]">Semester III</td>
                            <td className="p-3 text-[#64748B]">AY 2023–24 Sem I</td>
                            <td className="p-3 font-mono">24</td>
                            <td className="p-3 font-mono font-bold text-[#0D9488]">9.18</td>
                            <td className="p-3"><span className="text-[#10B981] font-semibold">PASS (Distinction)</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-[#0F172A]">Semester IV</td>
                            <td className="p-3 text-[#64748B]">AY 2023–24 Sem II</td>
                            <td className="p-3 font-mono">24</td>
                            <td className="p-3 font-mono font-bold text-[#0D9488]">9.20</td>
                            <td className="p-3"><span className="text-[#10B981] font-semibold">PASS (Distinction)</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {educationSubTab === 'gap_year' && (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
                    No academic gap years reported between SSC (2020) and B.Tech admission (2022).
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= RAIL 5: BANK DETAILS (LOCKED INPUTS) ================= */}
          {activeRail === 'bank' && (
            <div className="flex-1 flex flex-col">
              <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'bank_info', label: 'STUDENT BANK INFORMATION' },
                  { id: 'loan', label: 'LOAN DETAILS' },
                  { id: 'sponsorship', label: 'SPONSORSHIP DETAILS' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBankSubTab(tab.id as any)}
                    className={cn(
                      'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                      bankSubTab === tab.id
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 flex-1">
                {bankSubTab === 'bank_info' && (
                  <div className="space-y-4 max-w-2xl">
                    <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2.5">
                      <Lock className="w-4 h-4 flex-shrink-0 text-amber-700" />
                      <span>
                        Bank details are securely locked by the College Accounts Department. To request modification, submit verified bank passbook copy at Academic Section Window 4.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <VierpInput
                        label="Account Number"
                        locked
                        value={formData.accountNumber}
                        readOnly
                      />
                      <VierpInput
                        label="Account Holder Name"
                        locked
                        value={formData.accountHolder}
                        readOnly
                      />
                      <VierpInput
                        label="Bank Name"
                        locked
                        value={formData.bankName}
                        readOnly
                      />
                      <VierpInput
                        label="Branch Name"
                        locked
                        value={formData.branchName}
                        readOnly
                      />
                      <VierpInput
                        label="IFSC Code"
                        locked
                        value={formData.ifscCode}
                        readOnly
                      />
                      <VierpInput
                        label="MICR Code"
                        locked
                        value={formData.micrCode}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {bankSubTab === 'loan' && (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
                    No institutional education loans currently linked to this student PRN.
                  </div>
                )}

                {bankSubTab === 'sponsorship' && (
                  <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-xs text-[#0F766E]">
                    <span className="font-bold block text-sm mb-1">EBC Scholarship Approved</span>
                    Eligible for 50% tuition concession under State Government EBC Concession Scheme. Status verified by College Accounts Office.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= RAIL 6: UNDERTAKINGS / CIRCULARS ================= */}
          {activeRail === 'undertakings' && (
            <div className="p-6 flex-1 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Mandatory Institutional Undertakings</h3>
              <div className="space-y-3">
                {[
                  {
                    title: 'Anti-Ragging Undertaking (UGC / AICTE)',
                    date: '14-AUG-2024',
                    ref: 'UGC-AR-2024-MH-9481',
                    status: 'SUBMITTED & VERIFIED',
                  },
                  {
                    title: 'Student Code of Conduct & Ethics Undertaking',
                    date: '15-JUL-2024',
                    ref: 'VIIT-CODE-2024-001',
                    status: 'ACKNOWLEDGED',
                  },
                  {
                    title: 'IT & Cyber Security Resource Usage Policy',
                    date: '15-JUL-2024',
                    ref: 'VIIT-IT-SEC-2024',
                    status: 'ACTIVE',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">{item.title}</span>
                      <span className="text-[11px] text-[#64748B] block mt-0.5">Reference: {item.ref} • Dated: {item.date}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] font-mono text-[10px] font-bold border border-[#A7F3D0]">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= RAIL 7: DOCUMENT UPLOADS ================= */}
          {activeRail === 'documents' && (
            <div className="flex-1 flex flex-col">
              <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDocumentSubTab('verified_docs')}
                  className={cn(
                    'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                    documentSubTab === 'verified_docs'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  )}
                >
                  VERIFIED ADMISSION DOCUMENTS
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentSubTab('additional_docs')}
                  className={cn(
                    'px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                    documentSubTab === 'additional_docs'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  )}
                >
                  ADDITIONAL ATTESTATIONS
                </button>
              </div>

              <div className="p-6 flex-1">
                {documentSubTab === 'verified_docs' ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0F172A]">Attested Documents Repository</h3>
                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
                          <tr>
                            <th className="p-3">Document Title</th>
                            <th className="p-3">Document Type</th>
                            <th className="p-3">Verification Status</th>
                            <th className="p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {[
                            { name: '10th SSC Marksheet', type: 'PDF • 450 KB', status: 'Verified' },
                            { name: '12th HSC Marksheet', type: 'PDF • 520 KB', status: 'Verified' },
                            { name: 'MHT-CET Scorecard 2022', type: 'PDF • 380 KB', status: 'Verified' },
                            { name: 'Domicile & Nationality Certificate', type: 'PDF • 610 KB', status: 'Verified' },
                            { name: 'CAP Allotment Letter', type: 'PDF • 410 KB', status: 'Verified' },
                          ].map((doc, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-semibold text-[#0F172A]">{doc.name}</td>
                              <td className="p-3 text-[#64748B] font-mono">{doc.type}</td>
                              <td className="p-3"><span className="text-[#10B981] font-semibold">✓ {doc.status}</span></td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setToastMsg(`Downloading authenticated copy of ${doc.name}...`)
                                    setTimeout(() => setToastMsg(null), 2500)
                                  }}
                                  className="text-[#2563EB] hover:underline font-semibold cursor-pointer"
                                >
                                  View / Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  renderEmptyState('Additional Certificates & Submissions', '+ UPLOAD DOCUMENTS')
                )}
              </div>
            </div>
          )}

          {/* ================= RAIL 8: EXPERIENCE (EMPTY STATE) ================= */}
          {activeRail === 'experience' && renderEmptyState('Internships & Prior Professional Experience', '+ EXPERIENCE')}

          {/* ================= RAIL 9: AWARDS (EMPTY STATE) ================= */}
          {activeRail === 'awards' && renderEmptyState('Awards & Academic Recognitions', '+ AWARD')}

          {/* ================= RAIL 10: ACTIVITIES (EMPTY STATE) ================= */}
          {activeRail === 'activities' && renderEmptyState('Extracurricular & Co-curricular Activities', '+ ACTIVITY')}

          {/* ================= RAIL 11: PHOTOS & SIGNATURES ================= */}
          {activeRail === 'photos' && (
            <div className="p-6 flex-1 space-y-6 max-w-4xl">
              {/* Mandatory Orange Instructions Box */}
              <div className="p-4 rounded-xl bg-[#FFFBEB] border-2 border-[#FCD34D] text-[#92400E] shadow-xs">
                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wide text-[#B45309]">
                  <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                  <span>Important Instructions for Uploading Photograph</span>
                </div>
                <ul className="text-xs space-y-1.5 pl-6 list-disc font-medium">
                  <li>Photo Should be in .jpg/.jpeg format only.</li>
                  <li>Resolution should be W=350px, H=450px. Photo size &lt;= 500 Kb.</li>
                  <li>The photo must be taken within the last 6 months in full color.</li>
                  <li>Ensure plain white or off-white background with eyes clearly visible (no hats, caps, or dark spectacles).</li>
                </ul>
              </div>

              {photoError && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Side-by-Side Previews: Previous Uploaded vs Selected Photo */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Student Biometric Photograph
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Card 1: Previous Uploaded Photo */}
                  <div className="border border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-[#F8FAFC]">
                    <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                      <span className="text-xs font-bold text-[#0F172A]">Previous Uploaded Photo</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Active in VIERP
                      </span>
                    </div>

                    <div className="relative w-40 h-52 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex flex-col items-center justify-center text-white my-2">
                      <User className="w-20 h-20 text-white/80" />
                      <span className="text-xs font-black tracking-wider uppercase mt-1">VIIT PUNE</span>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 backdrop-blur-xs py-0.5 px-1 rounded text-[8px] font-mono text-center">
                        PRN #{formData.prnNumber}
                      </div>
                    </div>

                    <div className="w-full pt-2">
                      <span className="text-xs font-bold text-[#0F172A] block">{formData.firstName} {formData.lastName}</span>
                      <span className="text-[10px] text-[#10B981] font-semibold block mt-0.5">✓ Attested by Academic Admin</span>
                    </div>
                  </div>

                  {/* Card 2: Selected Photo Preview */}
                  <div className="border border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-[#F8FAFC]">
                    <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                      <span className="text-xs font-bold text-[#0F172A]">Selected Photo</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        selectedPhotoPreview
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {selectedPhotoPreview ? 'Ready to Upload' : 'No File Chosen'}
                      </span>
                    </div>

                    {selectedPhotoPreview ? (
                      <div className="relative w-40 h-52 rounded-xl overflow-hidden border-2 border-[#2563EB] shadow-md my-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedPhotoPreview}
                          alt="Selected preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhotoPreview(null)
                            setSelectedPhotoName(null)
                            if (photoInputRef.current) photoInputRef.current.value = ''
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 cursor-pointer"
                          title="Remove selected photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => photoInputRef.current?.click()}
                        className="w-40 h-52 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center p-3 text-center my-2 cursor-pointer hover:border-[#2563EB] transition-colors"
                      >
                        <Camera className="w-8 h-8 text-[#94A3B8] mb-2" />
                        <span className="text-xs font-semibold text-[#475569] block">Choose New Photo</span>
                        <span className="text-[10px] text-[#94A3B8] mt-1 block">.jpg / .jpeg (max 500KB)</span>
                      </div>
                    )}

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept=".jpg,.jpeg,image/jpeg"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    <div className="w-full pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] cursor-pointer"
                      >
                        Browse File
                      </button>
                      <button
                        type="button"
                        disabled={!selectedPhotoPreview}
                        onClick={() => {
                          setToastMsg('Photograph uploaded and submitted for ERP verification.')
                          setTimeout(() => setToastMsg(null), 3000)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Previews: Digital Signatures */}
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Student Digital Signature
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Previous Signature */}
                  <div className="border border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-[#F8FAFC]">
                    <span className="text-xs font-bold text-[#0F172A] block mb-2">Previous Uploaded Signature</span>
                    <div className="w-full h-24 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center font-serif italic text-xl text-[#1E3A8A] select-none shadow-xs">
                      {formData.firstName} {formData.lastName}
                    </div>
                    <span className="text-[10px] text-[#10B981] font-semibold mt-2 block">✓ Cryptographically Registered</span>
                  </div>

                  {/* New Signature Upload */}
                  <div className="border border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-[#F8FAFC]">
                    <span className="text-xs font-bold text-[#0F172A] block mb-2">Upload New Signature</span>
                    {selectedSignPreview ? (
                      <div className="w-full h-24 rounded-xl bg-white border border-[#2563EB] overflow-hidden flex items-center justify-center relative p-2 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedSignPreview} alt="Signature preview" className="max-h-full object-contain" />
                      </div>
                    ) : (
                      <div
                        onClick={() => signatureInputRef.current?.click()}
                        className="w-full h-24 rounded-xl border border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2563EB] transition-colors"
                      >
                        <Pencil className="w-5 h-5 text-[#94A3B8] mb-1" />
                        <span className="text-xs text-[#64748B]">Click to browse signature (.jpg/.png)</span>
                      </div>
                    )}

                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/*"
                      onChange={handleSignSelect}
                      className="hidden"
                    />

                    <div className="w-full pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => signatureInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] cursor-pointer"
                      >
                        Browse File
                      </button>
                      <button
                        type="button"
                        disabled={!selectedSignPreview}
                        onClick={() => {
                          setToastMsg('Signature uploaded successfully.')
                          setTimeout(() => setToastMsg(null), 3000)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= RAIL 12: CLOUD STORAGE ================= */}
          {activeRail === 'cloud' && (
            <div className="p-6 flex-1 space-y-5 max-w-2xl">
              <h3 className="text-sm font-bold text-[#0F172A]">Institutional Cloud Storage Quota</h3>
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#475569]">Google Workspace for Education</span>
                  <span className="text-[#0D9488] font-mono">2.4 GB of 15 GB Used</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div className="h-full bg-[#0D9488] rounded-full w-[16%]" />
                </div>
                <span className="text-[11px] text-[#64748B] block">
                  Synchronized with official institutional email: <code>{formData.personalEmail}</code>
                </span>
              </div>
            </div>
          )}

          {/* ================= RAIL 13: ANTI-RAGGING ================= */}
          {activeRail === 'antiragging' && (
            <div className="p-6 flex-1 space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-[#0F172A]">Anti-Ragging Undertaking Status</h3>
              <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#059669]" />
                  <div>
                    <span className="text-sm font-bold text-[#065F46] block">Compliance Certificate Active</span>
                    <span className="text-xs text-[#047857] block">Academic Year 2024–25 Verified</span>
                  </div>
                </div>
                <div className="text-xs text-[#065F46] pt-2 border-t border-[#A7F3D0]/60 space-y-1">
                  <p>National Anti-Ragging Reference: <strong>AR-2024-MH-948102</strong></p>
                  <p>Affidavit submission confirmed by SPPU Grievance & Student Welfare Committee.</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= RAIL 14: SKILLS (EMPTY STATE) ================= */}
          {activeRail === 'skills' && renderEmptyState('Skills & Technical Proficiencies', '+ SKILLS')}

          {/* ================= RAIL 15: INTERESTS (EMPTY STATE) ================= */}
          {activeRail === 'interests' && renderEmptyState('Interests & Co-curricular Pursuits', '+ INTEREST')}

          {/* ================= FACULTY RESEARCH & GRANTS ================= */}
          {activeRail === 'research' && isFaculty && (
            <div className="p-6 flex-1 space-y-5">
              <h3 className="text-sm font-bold text-[#0F172A]">Research Publications & Patents Granted</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-center">
                  <span className="text-2xl font-black text-[#0D9488] block">18</span>
                  <span className="text-xs font-semibold text-[#0F766E] block mt-0.5">Scopus / SCI Journals</span>
                </div>
                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-center">
                  <span className="text-2xl font-black text-[#2563EB] block">24</span>
                  <span className="text-xs font-semibold text-[#1E40AF] block mt-0.5">IEEE Conferences</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-center">
                  <span className="text-2xl font-black text-[#7C3AED] block">2</span>
                  <span className="text-xs font-semibold text-[#6B21A8] block mt-0.5">Patents Granted</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Screen-Only: Footer Action Buttons with Dynamic Text ──────────── */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
            <button
              type="button"
              onClick={handlePrevRail}
              disabled={rails.findIndex((r) => r.id === activeRail) === 0}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave(rails.find((r) => r.id === activeRail)?.label || 'Details')}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-white border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE DETAILS</span>
              </button>

              <button
                type="button"
                onClick={handleNextRail}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
              >
                <span>{getPrimaryButtonLabel()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ── Printable Profile Dossier (Activated on window.print()) ─────────── */}
      <div className="hidden print:block font-sans text-black max-w-full p-2">
        {/* Institute Letterhead */}
        <div className="border-b-2 border-black pb-3 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-black rounded-lg flex items-center justify-center font-black text-xl tracking-tighter">
              VIIT
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wide leading-tight">
                Vishwakarma Institute of Information Technology, Pune
              </h1>
              <p className="text-xs font-semibold leading-tight mt-0.5">
                (An Autonomous Institute Affiliated to Savitribai Phule Pune University)
              </p>
              <p className="text-[10px] text-gray-700 leading-tight">
                Survey No. 3/4, Kondhwa (Budruk), Pune – 411048, Maharashtra, India
              </p>
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mt-0.5">
                NAAC Accredited 'A++' Grade • Directorate of Technical Education Code: 6289
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="w-24 h-32 border-2 border-black rounded flex flex-col items-center justify-center text-center p-1 bg-gray-50">
              <User className="w-10 h-10 text-gray-400" />
              <span className="text-[8px] font-bold uppercase mt-1 leading-tight">Official Student Photograph</span>
              <span className="text-[8px] font-mono mt-0.5">{formData.prnNumber}</span>
            </div>
          </div>
        </div>

        <div className="text-center bg-gray-100 border border-black py-1 mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider">
            Student Academic & Institutional Profile Dossier (AY 2024–25)
          </h2>
        </div>

        {/* Section 1: Personal & Identification Particulars */}
        <div className="mb-3 border border-black">
          <div className="bg-gray-200 px-2 py-0.5 border-b border-black font-bold text-[10px] uppercase">
            1. Personal Particulars & Academic Identification
          </div>
          <div className="grid grid-cols-4 text-[10px] p-2 gap-y-1.5 gap-x-2">
            <div><strong>Full Name:</strong> {formData.firstName} {formData.middleName ? formData.middleName + ' ' : ''}{formData.lastName}</div>
            <div><strong>PRN:</strong> {formData.prnNumber}</div>
            <div><strong>Department:</strong> {profile?.department || 'Computer Engineering'}</div>
            <div><strong>Program:</strong> {isFaculty ? 'Faculty • Computer Engineering' : 'B.Tech Computer Engineering (Semester 5)'}</div>

            <div><strong>Admission Year:</strong> 2022</div>
            <div><strong>Category:</strong> {formData.category}</div>
            <div><strong>Caste:</strong> {formData.caste}</div>
            <div><strong>Blood Group:</strong> {formData.bloodGroup}</div>

            <div><strong>Mobile No:</strong> {formData.mobileNumber}</div>
            <div><strong>Official Email:</strong> {formData.personalEmail}</div>
            <div><strong>Aadhaar No:</strong> {formData.aadhaarNumber}</div>
            <div><strong>ABC ID:</strong> {formData.abcId}</div>
          </div>
        </div>

        {/* Section 2: Residential Address */}
        <div className="mb-3 border border-black">
          <div className="bg-gray-200 px-2 py-0.5 border-b border-black font-bold text-[10px] uppercase">
            2. Residential Address Particulars
          </div>
          <div className="grid grid-cols-2 text-[10px] p-2 gap-y-1.5 gap-x-4">
            <div><strong>Permanent Address:</strong> {formData.permanentAddress}</div>
            <div><strong>Current Address:</strong> {formData.currentAddress}</div>
            <div><strong>Emergency Contact:</strong> {formData.emergencyName} ({formData.emergencyRelation})</div>
            <div><strong>Emergency Mobile:</strong> {formData.emergencyMobile} (City: {formData.emergencyCity})</div>
          </div>
        </div>

        {/* Section 3: Family Particulars */}
        <div className="mb-3 border border-black">
          <div className="bg-gray-200 px-2 py-0.5 border-b border-black font-bold text-[10px] uppercase">
            3. Family Background & Annual Income
          </div>
          <div className="grid grid-cols-4 text-[10px] p-2 gap-y-1.5 gap-x-2">
            <div><strong>Father's Name:</strong> Sanjay Sharma</div>
            <div><strong>Occupation:</strong> Senior Accountant</div>
            <div><strong>Annual Income:</strong> ₹ 8,50,000</div>
            <div><strong>Father Contact:</strong> +91 98220 54129</div>

            <div><strong>Mother's Name:</strong> Sunita Sharma</div>
            <div><strong>Occupation:</strong> Homemaker</div>
            <div><strong>Earning Parent:</strong> Sanjay Sharma</div>
            <div><strong>Nationality:</strong> Indian</div>
          </div>
        </div>

        {/* Section 4: Academic Performance Ledgers */}
        <div className="mb-3 border border-black">
          <div className="bg-gray-200 px-2 py-0.5 border-b border-black font-bold text-[10px] uppercase">
            4. Academic Progression History & Semester Ledgers
          </div>
          <table className="w-full text-[9px] border-collapse">
            <thead>
              <tr className="border-b border-black bg-gray-100">
                <th className="p-1 border-r border-black text-left">Examination / Ledger</th>
                <th className="p-1 border-r border-black text-left">Board / University</th>
                <th className="p-1 border-r border-black text-left">Year</th>
                <th className="p-1 border-r border-black text-left">Marks / SGPA</th>
                <th className="p-1 text-left">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              <tr>
                <td className="p-1 border-r border-black">SSC (10th Standard)</td>
                <td className="p-1 border-r border-black">Maharashtra State Board (MSBSHSE)</td>
                <td className="p-1 border-r border-black">2020</td>
                <td className="p-1 border-r border-black font-mono">94.60%</td>
                <td className="p-1 font-semibold">PASS (Distinction)</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-black">HSC (12th Standard)</td>
                <td className="p-1 border-r border-black">Maharashtra State Board (MSBSHSE)</td>
                <td className="p-1 border-r border-black">2022</td>
                <td className="p-1 border-r border-black font-mono">92.40%</td>
                <td className="p-1 font-semibold">PASS (Distinction)</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-black">MHT-CET Entrance</td>
                <td className="p-1 border-r border-black">State CET Cell, Maharashtra</td>
                <td className="p-1 border-r border-black">2022</td>
                <td className="p-1 border-r border-black font-mono">98.42 %ile</td>
                <td className="p-1 font-semibold">Qualified</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-black font-semibold">B.Tech Sem I (AY 22–23)</td>
                <td className="p-1 border-r border-black">SPPU Autonomous Curriculum</td>
                <td className="p-1 border-r border-black">2022</td>
                <td className="p-1 border-r border-black font-mono font-bold">SGPA: 9.12</td>
                <td className="p-1 font-semibold">PASS (Distinction)</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-black font-semibold">B.Tech Sem II (AY 22–23)</td>
                <td className="p-1 border-r border-black">SPPU Autonomous Curriculum</td>
                <td className="p-1 border-r border-black">2023</td>
                <td className="p-1 border-r border-black font-mono font-bold">SGPA: 9.24</td>
                <td className="p-1 font-semibold">PASS (Distinction)</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-black font-semibold">B.Tech Sem III (AY 23–24)</td>
                <td className="p-1 border-r border-black">SPPU Autonomous Curriculum</td>
                <td className="p-1 border-r border-black">2023</td>
                <td className="p-1 border-r border-black font-mono font-bold">SGPA: 9.18</td>
                <td className="p-1 font-semibold">PASS (Distinction)</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-black font-semibold">B.Tech Sem IV (AY 23–24)</td>
                <td className="p-1 border-r border-black">SPPU Autonomous Curriculum</td>
                <td className="p-1 border-r border-black">2024</td>
                <td className="p-1 border-r border-black font-mono font-bold">SGPA: 9.20</td>
                <td className="p-1 font-semibold">PASS (Distinction)</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="p-1 border-r border-black" colSpan={3}>Cumulative Grade Point Average (CGPA)</td>
                <td className="p-1 border-r border-black font-mono text-sm font-black">9.18 / 10.0</td>
                <td className="p-1 text-emerald-800">FIRST CLASS WITH DISTINCTION</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 5: Institutional Bank Particulars */}
        <div className="mb-4 border border-black">
          <div className="bg-gray-200 px-2 py-0.5 border-b border-black font-bold text-[10px] uppercase">
            5. Institutional Bank & Fee Concession Ledger
          </div>
          <div className="grid grid-cols-4 text-[10px] p-2 gap-y-1.5 gap-x-2">
            <div><strong>Bank Name:</strong> {formData.bankName}</div>
            <div><strong>Branch:</strong> {formData.branchName}</div>
            <div><strong>Account No:</strong> {formData.accountNumber}</div>
            <div><strong>IFSC Code:</strong> {formData.ifscCode}</div>
            <div><strong>Account Holder:</strong> {formData.accountHolder}</div>
            <div><strong>MICR Code:</strong> {formData.micrCode}</div>
            <div className="col-span-2"><strong>Scholarship Concession:</strong> EBC 50% Tuition Concession Verified</div>
          </div>
        </div>

        {/* Section 6: Verification & Signatures */}
        <div className="border border-black p-3 text-[9px]">
          <p className="font-semibold text-justify mb-4">
            <strong>Declaration:</strong> I hereby certify that the information provided in this academic profile dossier is true, complete, and accurate. Any false declaration shall subject my admission to cancellation according to Savitribai Phule Pune University and VIIT Pune disciplinary statutes.
          </p>

          <div className="grid grid-cols-3 gap-8 pt-6 text-center">
            <div className="border-t border-black pt-1">
              <span className="font-serif italic text-xs block leading-tight">{formData.firstName} {formData.lastName}</span>
              <strong className="block text-[8px] uppercase">Signature of Student</strong>
            </div>

            <div className="border-t border-black pt-1">
              <span className="text-gray-400 text-xs block leading-tight">[Attested Online]</span>
              <strong className="block text-[8px] uppercase">Academic Proctor / Mentor</strong>
            </div>

            <div className="border-t border-black pt-1">
              <span className="text-gray-400 text-xs block leading-tight">[Seal & Date]</span>
              <strong className="block text-[8px] uppercase">Registrar / Head of Dept</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
