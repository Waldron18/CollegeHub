'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  HelpCircle,
  Calculator,
  Sparkles,
  X,
  Menu,
  Receipt,
} from 'lucide-react'
import { FeeReceiptModal } from '@/components/common/FeeReceiptModal'

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0 0-3.3 1.66 1.66 0 0 0 0 3.3m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
    </svg>
  )
}
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
    <fieldset
      className={cn(
        'relative rounded-md border border-slate-200 bg-white transition-all text-left w-full min-w-0 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
        locked && 'bg-[#F1F5F9]'
      )}
    >
      {label && (
        <legend className="px-1.5 text-[10px] font-medium text-slate-500 leading-none select-none ml-2">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </legend>
      )}
      <div className="relative flex items-center h-9">
        <div className="absolute left-2.5 top-2.5 pointer-events-none text-slate-400 flex-shrink-0">
          {locked ? (
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
        <input
          {...props}
          disabled={locked || props.disabled}
          className={cn(
            'w-full h-full bg-transparent border-none p-0 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-0',
            locked
              ? 'text-[#64748B] font-mono cursor-not-allowed select-none'
              : 'text-[#0F172A]',
            rightElement && 'pr-8',
            className
          )}
        />
        {locked ? (
          <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 pointer-events-none mr-2 flex-shrink-0">
            Locked
          </div>
        ) : (
          rightElement && (
            <div className="mr-2 flex-shrink-0">
              {rightElement}
            </div>
          )
        )}
      </div>
    </fieldset>
  )
}

interface VierpSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  children: React.ReactNode
}

function VierpSelect({ label, required, children, className, ...props }: VierpSelectProps) {
  return (
    <fieldset className="relative rounded-md border border-slate-200 bg-white transition-all text-left w-full min-w-0 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      {label && (
        <legend className="px-1.5 text-[10px] font-medium text-slate-500 leading-none select-none ml-2">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </legend>
      )}
      <div className="relative flex items-center h-9">
        <div className="absolute left-2.5 top-2.5 pointer-events-none text-slate-400 flex-shrink-0">
          <List className="w-3.5 h-3.5" />
        </div>
        <select
          {...props}
          className={cn(
            'w-full h-full bg-transparent border-none p-0 pl-8 pr-8 text-xs text-slate-900 appearance-none focus:outline-none focus:ring-0 cursor-pointer',
            className
          )}
        >
          {children}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
      </div>
    </fieldset>
  )
}

interface VierpTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
}

function VierpTextarea({ label, required, className, ...props }: VierpTextareaProps) {
  return (
    <fieldset className="relative rounded-md border border-slate-200 bg-white transition-all text-left w-full min-w-0 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      {label && (
        <legend className="px-1.5 text-[10px] font-medium text-slate-500 leading-none select-none ml-2">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </legend>
      )}
      <div className="relative flex items-start p-2">
        <div className="absolute left-2.5 top-2.5 pointer-events-none text-slate-400 flex-shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </div>
        <textarea
          {...props}
          className={cn(
            'w-full bg-transparent border-none p-0 pl-7 text-xs text-slate-900 focus:outline-none focus:ring-0 resize-none min-h-[60px]',
            className
          )}
        />
      </div>
    </fieldset>
  )
}

// ── Main VierpProfilePage Component ──────────────────────────────────────────

export default function VierpProfilePage({ profile, onNavigate }: VierpProfilePageProps) {
  const isFaculty = profile?.role === 'FACULTY'
  const rails = isFaculty ? FACULTY_RAILS : STUDENT_RAILS

  const draftKey = `collegehub_profile_draft_${profile?.id || 'aditya_22110482'}`

  const [activeRail, setActiveRail] = useState<string>('personal')
  const [showAadhaar, setShowAadhaar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
  const [isMobileRailOpen, setIsMobileRailOpen] = useState(false)

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

  // ── Dynamic Interactive Lists for Empty States ──────────────────────────────
  const [skillsList, setSkillsList] = useState<Array<{ id: string; name: string; level: string; category: string }>>([])
  const [interestsList, setInterestsList] = useState<Array<{ id: string; title: string; category: string }>>([])
  const [awardsList, setAwardsList] = useState<Array<{ id: string; title: string; issuingOrg: string; year: string }>>([])
  const [activitiesList, setActivitiesList] = useState<Array<{ id: string; title: string; role: string; year: string }>>([])
  const [medicalList, setMedicalList] = useState<Array<{ id: string; condition: string; verifiedBy: string; year: string }>>([])
  const [additionalDocsList, setAdditionalDocsList] = useState<Array<{ id: string; title: string; type: string; uploadDate: string }>>([])

  // Modal Dialog State for Entry Additions
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalFields, setModalFields] = useState<{ [key: string]: string }>({})

  // Semester Marks & CGPA Calculator State
  const [semesterLedgers, setSemesterLedgers] = useState([
    { sem: 'Semester I', session: 'AY 2022–23 Sem I', credits: 22, sgpa: 9.12, status: 'PASS (Distinction)' },
    { sem: 'Semester II', session: 'AY 2022–23 Sem II', credits: 22, sgpa: 9.24, status: 'PASS (Distinction)' },
    { sem: 'Semester III', session: 'AY 2023–24 Sem I', credits: 24, sgpa: 9.18, status: 'PASS (Distinction)' },
    { sem: 'Semester IV', session: 'AY 2023–24 Sem II', credits: 24, sgpa: 9.20, status: 'PASS (Distinction)' },
  ])
  const [calculatedCGPA, setCalculatedCGPA] = useState<number>(9.18)
  const [calculatedPercentage, setCalculatedPercentage] = useState<number>(87.21)
  const [cgpaCalculatedAt, setCgpaCalculatedAt] = useState<string | null>(null)

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

  // ── Local Storage Draft Restoration ─────────────────────────────────────────
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }))
        if (parsed.skillsList) setSkillsList(parsed.skillsList)
        if (parsed.interestsList) setInterestsList(parsed.interestsList)
        if (parsed.awardsList) setAwardsList(parsed.awardsList)
        if (parsed.activitiesList) setActivitiesList(parsed.activitiesList)
        if (parsed.medicalList) setMedicalList(parsed.medicalList)
        if (parsed.additionalDocsList) setAdditionalDocsList(parsed.additionalDocsList)
        if (parsed.semesterLedgers) setSemesterLedgers(parsed.semesterLedgers)
      }
    } catch (e) {
      console.warn('Failed to restore profile draft from localStorage:', e)
    }
  }, [draftKey])

  // Auto-save draft on changes
  const saveDraftToStorage = (updatedFormData?: any, updatedLists?: any) => {
    try {
      const draftPayload = {
        formData: updatedFormData || formData,
        skillsList: updatedLists?.skillsList || skillsList,
        interestsList: updatedLists?.interestsList || interestsList,
        awardsList: updatedLists?.awardsList || awardsList,
        activitiesList: updatedLists?.activitiesList || activitiesList,
        medicalList: updatedLists?.medicalList || medicalList,
        additionalDocsList: updatedLists?.additionalDocsList || additionalDocsList,
        semesterLedgers: updatedLists?.semesterLedgers || semesterLedgers,
        lastSaved: new Date().toISOString(),
      }
      localStorage.setItem(draftKey, JSON.stringify(draftPayload))
    } catch (e) {
      console.warn('Failed to auto-save profile draft:', e)
    }
  }

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    saveDraftToStorage(updated)
  }

  const handleSave = (stepName: string) => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      // Commit and clear draft
      try {
        localStorage.removeItem(draftKey)
      } catch (e) {
        console.warn(e)
      }
      setToastMsg(`${stepName} committed to institutional ERP. Local draft synced.`)
      setTimeout(() => setToastMsg(null), 4000)
    }, 600)
  }

  // ── "FETCH CGPA" Calculation Engine ─────────────────────────────────────────
  const handleFetchCgpa = () => {
    let totalCredits = 0
    let weightedSum = 0

    semesterLedgers.forEach((sem) => {
      totalCredits += sem.credits
      weightedSum += sem.credits * sem.sgpa
    })

    const cgpa = totalCredits > 0 ? Number((weightedSum / totalCredits).toFixed(2)) : 0
    const pct = Number((cgpa * 9.5).toFixed(2))

    setCalculatedCGPA(cgpa)
    setCalculatedPercentage(pct)
    setCgpaCalculatedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

    setToastMsg(`CGPA Computed: ${cgpa} / 10.0 (Equivalent: ${pct}% • First Class with Distinction)`)
    setTimeout(() => setToastMsg(null), 4500)
    saveDraftToStorage()
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

  // ── Modal Form Handling for Empty State Additions ───────────────────────────
  const handleOpenModal = (category: string) => {
    setActiveModal(category)
    setModalFields({})
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setModalFields({})
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = Date.now().toString()

    if (activeModal === 'SKILLS') {
      const newItem = {
        id,
        name: modalFields.name || 'React / TypeScript',
        level: modalFields.level || 'Advanced',
        category: modalFields.category || 'Web Architecture',
      }
      const updated = [newItem, ...skillsList]
      setSkillsList(updated)
      saveDraftToStorage(formData, { skillsList: updated })
      setToastMsg('Technical skill added to profile repository.')
    } else if (activeModal === 'INTEREST') {
      const newItem = {
        id,
        title: modalFields.title || 'Robotics & Embedded Systems',
        category: modalFields.category || 'Technical Club',
      }
      const updated = [newItem, ...interestsList]
      setInterestsList(updated)
      saveDraftToStorage(formData, { interestsList: updated })
      setToastMsg('Interest entry added.')
    } else if (activeModal === 'AWARD') {
      const newItem = {
        id,
        title: modalFields.title || 'National Hackathon Winner',
        issuingOrg: modalFields.issuingOrg || 'Smart India Hackathon',
        year: modalFields.year || '2024',
      }
      const updated = [newItem, ...awardsList]
      setAwardsList(updated)
      saveDraftToStorage(formData, { awardsList: updated })
      setToastMsg('Award/Honor record added.')
    } else if (activeModal === 'ACTIVITY') {
      const newItem = {
        id,
        title: modalFields.title || 'Technical Lead - IEEE Student Chapter',
        role: modalFields.role || 'Executive Member',
        year: modalFields.year || '2024',
      }
      const updated = [newItem, ...activitiesList]
      setActivitiesList(updated)
      saveDraftToStorage(formData, { activitiesList: updated })
      setToastMsg('Extracurricular activity recorded.')
    } else if (activeModal === 'MEDICAL') {
      const newItem = {
        id,
        condition: modalFields.condition || 'General Fitness Clearance',
        verifiedBy: modalFields.verifiedBy || 'Dr. Deshmukh (Campus Health Center)',
        year: modalFields.year || '2024',
      }
      const updated = [newItem, ...medicalList]
      setMedicalList(updated)
      saveDraftToStorage(formData, { medicalList: updated })
      setToastMsg('Medical clearance record appended.')
    } else if (activeModal === 'DOCUMENTS') {
      const newItem = {
        id,
        title: modalFields.title || 'Extra Certificate / Undertaking',
        type: modalFields.type || 'PDF • Attested',
        uploadDate: new Date().toLocaleDateString('en-GB'),
      }
      const updated = [newItem, ...additionalDocsList]
      setAdditionalDocsList(updated)
      saveDraftToStorage(formData, { additionalDocsList: updated })
      setToastMsg('Document uploaded for ERP verification.')
    }

    setTimeout(() => setToastMsg(null), 3500)
    handleCloseModal()
  }

  // Delete item handler (reverts to empty state when list length hits 0)
  const handleDeleteItem = (listType: string, id: string) => {
    if (listType === 'skills') {
      const updated = skillsList.filter((item) => item.id !== id)
      setSkillsList(updated)
      saveDraftToStorage(formData, { skillsList: updated })
    } else if (listType === 'interests') {
      const updated = interestsList.filter((item) => item.id !== id)
      setInterestsList(updated)
      saveDraftToStorage(formData, { interestsList: updated })
    } else if (listType === 'awards') {
      const updated = awardsList.filter((item) => item.id !== id)
      setAwardsList(updated)
      saveDraftToStorage(formData, { awardsList: updated })
    } else if (listType === 'activities') {
      const updated = activitiesList.filter((item) => item.id !== id)
      setActivitiesList(updated)
      saveDraftToStorage(formData, { activitiesList: updated })
    } else if (listType === 'medical') {
      const updated = medicalList.filter((item) => item.id !== id)
      setMedicalList(updated)
      saveDraftToStorage(formData, { medicalList: updated })
    } else if (listType === 'documents') {
      const updated = additionalDocsList.filter((item) => item.id !== id)
      setAdditionalDocsList(updated)
      saveDraftToStorage(formData, { additionalDocsList: updated })
    }
    setToastMsg('Record removed from profile.')
    setTimeout(() => setToastMsg(null), 2500)
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
  const renderEmptyState = (categoryTitle: string, actionLabel: string, modalCategory: string) => (
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
        onClick={() => handleOpenModal(modalCategory)}
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

      {/* ── Institutional Student Strip (VIERP Visual Standard) ─────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 mb-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs print:hidden">
        <div className="flex items-center gap-3.5">
          {/* Avatar Thumbnail */}
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0 tracking-wider">
            {isFaculty ? 'RK' : 'AS'}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-sm font-extrabold uppercase text-[#0F172A] tracking-tight">
                {isFaculty ? 'PROF. RAJESH KULKARNI' : 'ADITYA SHARMA'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 flex-wrap font-mono">
              <span>Registration No: <strong className="text-[#0F172A]">{isFaculty ? 'EMP-CE-402' : '22110482'}</strong></span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#2563EB] font-sans font-semibold">
                {isFaculty ? 'Dept of Computer Engineering' : 'BTech-Computer Engineering'}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl font-medium">
          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
          <span>AY 2024–25 • Semester 5</span>
        </div>
      </div>

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
          <span className="text-[#0F172A] font-semibold">Profile</span>
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

      {/* ── Mobile Sticky Navigation Header (< 768px / md:hidden) ─────────── */}
      <div className="md:hidden w-full sticky top-0 z-30 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] p-2.5 rounded-xl shadow-xs flex items-center justify-between gap-3 mb-3 print:hidden">
        {(() => {
          const currentRail = rails.find((r) => r.id === activeRail) || rails[0]
          const CurrentIcon = currentRail.icon
          const currentIndex = rails.findIndex((r) => r.id === activeRail) + 1
          return (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#64748B] block font-mono">
                  Section {currentIndex} of {rails.length}
                </span>
                <h3 className="text-xs font-bold text-[#0F172A] truncate">
                  {currentRail.label}
                </h3>
              </div>
            </div>
          )
        })()}

        <button
          type="button"
          onClick={() => setIsMobileRailOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer flex-shrink-0 active:scale-95"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Sections ({rails.length})</span>
        </button>
      </div>

      {/* ── Mobile Slide-Over Rail Drawer (< 768px) ───────────────────────────── */}
      {isMobileRailOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in-0 duration-200">
          {/* Semi-transparent Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileRailOpen(false)}
            aria-hidden="true"
          />

          {/* Left Sheet Container */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-4 flex flex-col border-r border-[#E2E8F0] animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center shadow-xs">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">VIERP Dossier Sections</h3>
                  <span className="text-[10px] text-[#64748B]">{rails.length} Profile Modules</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileRailOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sections drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Tiles */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {rails.map((item, index) => {
                const Icon = item.icon
                const isActive = activeRail === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveRail(item.id)
                      setIsMobileRailOpen(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer',
                      isActive
                        ? 'bg-[#1E40AF] text-white shadow-sm font-bold'
                        : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive ? 'bg-white/20 text-white' : 'bg-[#EFF6FF] text-[#1E40AF]'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate">{item.label}</span>
                      <span className={cn('text-[10px] font-mono block', isActive ? 'text-blue-200' : 'text-[#94A3B8]')}>
                        Module {index + 1}
                      </span>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Screen-Only: Two-Column Interactive Layout ────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 items-start print:hidden">
        {/* Left Column: Floating Pill-Shaped Vertical Rail (Tablet / Desktop: md:flex) */}
        <aside className="hidden md:flex flex-col w-14 flex-shrink-0 rounded-full bg-[#DCEEFE] text-[#1E40AF] py-3 px-1.5 shadow-sm border border-blue-200/60 items-center justify-start gap-1.5">
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
                  'w-10 h-10 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 relative group rounded-full',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm rounded-full p-2'
                    : 'text-[#1E40AF] hover:bg-[#BFDBFE]/60 hover:text-[#1E3A8A] rounded-full p-2'
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
              <div className="rounded-t-2xl border border-b-0 border-blue-100 bg-[#E8EFFE]/40 p-1 flex items-center gap-1 overflow-x-auto">
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
                      personalSubTab === tab.id
                        ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                        : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
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
                      type="text"
                      value={showAadhaar ? '9812-4019-4821' : '•••• •••• 4821'}
                      onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                      className="font-mono"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          className="text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
                          title={showAadhaar ? 'Hide Aadhaar' : 'Reveal Aadhaar'}
                        >
                          {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#2563EB]" />}
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

                    <p className="text-xs text-red-600 italic font-medium">
                      Note: If any changes or corrections are required, please contact the Admin.
                    </p>
                  </div>
                )}

                {personalSubTab === 'medical' && (
                  medicalList.length === 0 ? (
                    renderEmptyState('Medical & Health Records', '+ MEDICAL', 'MEDICAL')
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A]">Registered Medical Clearances</span>
                        <button
                          type="button"
                          onClick={() => handleOpenModal('MEDICAL')}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Record
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {medicalList.map((item) => (
                          <div key={item.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                            <div>
                              <span className="text-xs font-bold text-[#0F172A] block">{item.condition}</span>
                              <span className="text-[11px] text-[#64748B] block mt-0.5">Verified by: {item.verifiedBy}</span>
                              <span className="text-[10px] text-[#10B981] font-bold block mt-1">AY {item.year} Active</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem('medical', item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

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
              <div className="rounded-t-2xl border border-b-0 border-blue-100 bg-[#E8EFFE]/40 p-1 flex items-center gap-1 overflow-x-auto">
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
                      addressSubTab === tab.id
                        ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                        : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
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
              <div className="rounded-t-2xl border border-b-0 border-blue-100 bg-[#E8EFFE]/40 p-1 flex items-center gap-1 overflow-x-auto">
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
                      familySubTab === tab.id
                        ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                        : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
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
              <div className="rounded-t-2xl border border-b-0 border-blue-100 bg-[#E8EFFE]/40 p-1 flex items-center gap-1 overflow-x-auto">
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
                      educationSubTab === tab.id
                        ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                        : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
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

                {/* Interactive Engineering Semesters + FETCH CGPA Engine */}
                {educationSubTab === 'graduation' && (
                  <div className="space-y-4 max-w-4xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shadow-xs">
                          <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-[#0F172A] block">Cumulative Academic Performance</span>
                          <span className="text-xs text-[#0F766E]">
                            Weighted computation across completed engineering semesters
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-white border border-[#99F6E4] text-center">
                          <span className="text-[10px] text-[#64748B] block uppercase font-bold">CGPA</span>
                          <span className="text-sm font-mono font-black text-[#0D9488]">{calculatedCGPA} / 10.0</span>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-white border border-[#99F6E4] text-center">
                          <span className="text-[10px] text-[#64748B] block uppercase font-bold">Equivalent %</span>
                          <span className="text-sm font-mono font-black text-[#2563EB]">{calculatedPercentage}%</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleFetchCgpa}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>FETCH CGPA</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
                          <tr>
                            <th className="p-3">Semester</th>
                            <th className="p-3">Academic Session</th>
                            <th className="p-3">Credits</th>
                            <th className="p-3">SGPA (out of 10)</th>
                            <th className="p-3">Result Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {semesterLedgers.map((sem, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-semibold text-[#0F172A]">{sem.sem}</td>
                              <td className="p-3 text-[#64748B]">{sem.session}</td>
                              <td className="p-3 font-mono">
                                <input
                                  type="number"
                                  value={sem.credits}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0
                                    const updated = [...semesterLedgers]
                                    updated[idx].credits = val
                                    setSemesterLedgers(updated)
                                    saveDraftToStorage(formData, { semesterLedgers: updated })
                                  }}
                                  className="w-16 h-7 px-2 border border-[#CBD5E1] rounded text-xs font-mono font-semibold text-[#0F172A]"
                                />
                              </td>
                              <td className="p-3 font-mono">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sem.sgpa}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0
                                    const updated = [...semesterLedgers]
                                    updated[idx].sgpa = val
                                    setSemesterLedgers(updated)
                                    saveDraftToStorage(formData, { semesterLedgers: updated })
                                  }}
                                  className="w-20 h-7 px-2 border border-[#CBD5E1] rounded text-xs font-mono font-bold text-[#0D9488]"
                                />
                              </td>
                              <td className="p-3">
                                <span className="text-[#10B981] font-semibold">{sem.status}</span>
                              </td>
                            </tr>
                          ))}
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
              <div className="rounded-t-2xl border border-b-0 border-blue-100 bg-[#E8EFFE]/40 p-1 flex items-center gap-1 overflow-x-auto">
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
                      bankSubTab === tab.id
                        ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                        : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
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
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-xs text-[#0F766E] flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <span className="font-bold block text-sm mb-1">EBC Scholarship Approved</span>
                        Eligible for 50% tuition concession under State Government EBC Concession Scheme. Status verified by College Accounts Office.
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        CONCESSION VERIFIED
                      </span>
                    </div>

                    {/* Official Fee Ledger & Challan Card */}
                    <div className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1E40AF] flex-shrink-0">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0F172A]">Semester V Fee Ledger &amp; Challan</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              CLEARED
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Tuition: ₹85k • Development: ₹14.5k • Exam: ₹3.5k • Total Paid: ₹1,05,000
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsFeeModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Fee Challan</span>
                      </button>
                    </div>
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
              <div className="rounded-t-2xl border border-b-0 border-blue-100 bg-[#E8EFFE]/40 p-1 flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDocumentSubTab('verified_docs')}
                  className={cn(
                    documentSubTab === 'verified_docs'
                      ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                      : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
                  )}
                >
                  VERIFIED ADMISSION DOCUMENTS
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentSubTab('additional_docs')}
                  className={cn(
                    documentSubTab === 'additional_docs'
                      ? 'bg-white text-blue-800 font-bold shadow-xs rounded-t-lg border-t-2 border-blue-600 px-4 py-2 text-xs whitespace-nowrap'
                      : 'text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-medium whitespace-nowrap'
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
                  additionalDocsList.length === 0 ? (
                    renderEmptyState('Additional Certificates & Submissions', '+ UPLOAD DOCUMENTS', 'DOCUMENTS')
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A]">Uploaded Submissions</span>
                        <button
                          type="button"
                          onClick={() => handleOpenModal('DOCUMENTS')}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Upload Document
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {additionalDocsList.map((doc) => (
                          <div key={doc.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                            <div>
                              <span className="text-xs font-bold text-[#0F172A] block">{doc.title}</span>
                              <span className="text-[11px] text-[#64748B] block mt-0.5">{doc.type} • Uploaded {doc.uploadDate}</span>
                              <span className="text-[10px] text-amber-600 font-bold block mt-1">Pending Verification</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem('documents', doc.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* ================= RAIL 8: EXPERIENCE ================= */}
          {activeRail === 'experience' && (
            <div className="p-6 flex-1">
              {renderEmptyState('Internships & Prior Professional Experience', '+ EXPERIENCE', 'EXPERIENCE')}
            </div>
          )}

          {/* ================= RAIL 9: AWARDS ================= */}
          {activeRail === 'awards' && (
            <div className="p-6 flex-1">
              {awardsList.length === 0 ? (
                renderEmptyState('Awards & Academic Recognitions', '+ AWARD', 'AWARD')
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">Awards & Recognitions</span>
                    <button
                      type="button"
                      onClick={() => handleOpenModal('AWARD')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Award
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {awardsList.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">{item.title}</span>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">{item.issuingOrg}</span>
                          <span className="text-[10px] text-[#2563EB] font-mono font-bold block mt-1">Year: {item.year}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('awards', item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= RAIL 10: ACTIVITIES ================= */}
          {activeRail === 'activities' && (
            <div className="p-6 flex-1">
              {activitiesList.length === 0 ? (
                renderEmptyState('Extracurricular & Co-curricular Activities', '+ ACTIVITY', 'ACTIVITY')
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">Student Activities & Leadership</span>
                    <button
                      type="button"
                      onClick={() => handleOpenModal('ACTIVITY')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Activity
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activitiesList.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">{item.title}</span>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">Role: {item.role}</span>
                          <span className="text-[10px] text-[#2563EB] font-mono font-bold block mt-1">Year: {item.year}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('activities', item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= RAIL 11: PHOTOS & SIGNATURES ================= */}
          {activeRail === 'photos' && (
            <div className="p-6 flex-1 space-y-6 max-w-4xl">
              <div className="p-4 rounded-xl bg-[#FEF9C3] border border-[#FACC15] text-[#854D0E] shadow-xs">
                <div className="flex items-center gap-1.5 mb-2 font-bold text-xs text-[#854D0E]">
                  <AlertTriangle className="w-4 h-4 text-[#CA8A04] flex-shrink-0" />
                  <span>Photo Upload Instructions :</span>
                  <button
                    type="button"
                    onClick={() => alert('Sample Photo Guidelines: Front-facing formal portrait with neutral expression, plain white background, and both ears visible.')}
                    className="text-[#2563EB] hover:underline font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    (Sample Photo)
                  </button>
                </div>
                <ul className="text-xs space-y-1.5 pl-6 list-disc font-medium text-[#713F12]">
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

          {/* ================= RAIL 14: SKILLS ================= */}
          {activeRail === 'skills' && (
            <div className="p-6 flex-1">
              {skillsList.length === 0 ? (
                renderEmptyState('Skills & Technical Proficiencies', '+ SKILLS', 'SKILLS')
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">Technical Skills & Certifications</span>
                    <button
                      type="button"
                      onClick={() => handleOpenModal('SKILLS')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {skillsList.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">{item.name}</span>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">Domain: {item.category}</span>
                          <span className="text-[10px] text-[#2563EB] font-bold block mt-1">Level: {item.level}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('skills', item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= RAIL 15: INTERESTS ================= */}
          {activeRail === 'interests' && (
            <div className="p-6 flex-1">
              {interestsList.length === 0 ? (
                renderEmptyState('Interests & Co-curricular Pursuits', '+ INTEREST', 'INTEREST')
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">Co-curricular Interests</span>
                    <button
                      type="button"
                      onClick={() => handleOpenModal('INTEREST')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Interest
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {interestsList.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">{item.title}</span>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">Category: {item.category}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('interests', item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* ── Floating Support & Provider Footer ─────────────────────────────────── */}
      <footer className="mt-8 border-t border-[#E2E8F0] bg-[#F8FAFC] py-4 px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] print:hidden shadow-xs">
        {/* Left: Green Pill Support & Helpdesk Button */}
        <button
          type="button"
          onClick={() => setIsSupportModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] hover:bg-[#D1FAE5] text-[#065F46] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <HelpCircle className="w-4 h-4 text-[#059669]" />
          <span>Support & Helpdesk</span>
        </button>

        {/* Center: Powered By eduplus */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#0F172A]">
            Powered By <span className="text-[#2563EB] font-extrabold tracking-tight">eduplus</span>
          </span>
        </div>

        {/* Right: University Social Icons & Version */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-[#94A3B8]">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" title="VIIT YouTube Channel" className="hover:text-[#EF4444] transition-colors">
              <YoutubeIcon className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" title="VIIT Facebook" className="hover:text-[#1877F2] transition-colors">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="VIIT Instagram" className="hover:text-[#E4405F] transition-colors">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" title="VIIT Twitter/X" className="hover:text-[#0F172A] transition-colors">
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="VIIT LinkedIn" className="hover:text-[#0A66C2] transition-colors">
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
          <span className="text-[#CBD5E1] hidden md:inline">|</span>
          <span className="text-[11px] font-mono text-[#94A3B8] hidden md:inline">
            v4.8 • SPPU Pune
          </span>
        </div>
      </footer>

      {/* ── Modal Dialog for Empty State Creations ───────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {activeModal === 'SKILLS' && 'Add Technical Skill'}
                {activeModal === 'INTEREST' && 'Add Co-curricular Interest'}
                {activeModal === 'AWARD' && 'Add Award / Recognition'}
                {activeModal === 'ACTIVITY' && 'Add Student Activity'}
                {activeModal === 'MEDICAL' && 'Add Medical Clearance Record'}
                {activeModal === 'DOCUMENTS' && 'Upload Additional Attestation'}
              </h3>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {activeModal === 'SKILLS' && (
                <>
                  <VierpInput
                    label="Skill Title / Technology"
                    required
                    placeholder="e.g., Python, System Design, Cloud Architecture"
                    value={modalFields.name || ''}
                    onChange={(e) => setModalFields({ ...modalFields, name: e.target.value })}
                  />
                  <VierpSelect
                    label="Proficiency Level"
                    value={modalFields.level || 'Intermediate'}
                    onChange={(e) => setModalFields({ ...modalFields, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </VierpSelect>
                  <VierpInput
                    label="Domain Category"
                    placeholder="e.g., Software Engineering, AI/ML, DevOps"
                    value={modalFields.category || ''}
                    onChange={(e) => setModalFields({ ...modalFields, category: e.target.value })}
                  />
                </>
              )}

              {activeModal === 'INTEREST' && (
                <>
                  <VierpInput
                    label="Interest / Hobby Title"
                    required
                    placeholder="e.g., Autonomous Drones, Open Source, Chess"
                    value={modalFields.title || ''}
                    onChange={(e) => setModalFields({ ...modalFields, title: e.target.value })}
                  />
                  <VierpInput
                    label="Domain / Club"
                    placeholder="e.g., Robotics Club, Sports, Literary Arts"
                    value={modalFields.category || ''}
                    onChange={(e) => setModalFields({ ...modalFields, category: e.target.value })}
                  />
                </>
              )}

              {activeModal === 'AWARD' && (
                <>
                  <VierpInput
                    label="Award / Honor Title"
                    required
                    placeholder="e.g., Winner - National Smart India Hackathon"
                    value={modalFields.title || ''}
                    onChange={(e) => setModalFields({ ...modalFields, title: e.target.value })}
                  />
                  <VierpInput
                    label="Issuing Organization"
                    required
                    placeholder="e.g., Ministry of Education / AICTE"
                    value={modalFields.issuingOrg || ''}
                    onChange={(e) => setModalFields({ ...modalFields, issuingOrg: e.target.value })}
                  />
                  <VierpInput
                    label="Year of Award"
                    required
                    placeholder="e.g., 2024"
                    value={modalFields.year || ''}
                    onChange={(e) => setModalFields({ ...modalFields, year: e.target.value })}
                    className="font-mono"
                  />
                </>
              )}

              {activeModal === 'ACTIVITY' && (
                <>
                  <VierpInput
                    label="Activity / Club Title"
                    required
                    placeholder="e.g., Google Developer Student Club (GDSC)"
                    value={modalFields.title || ''}
                    onChange={(e) => setModalFields({ ...modalFields, title: e.target.value })}
                  />
                  <VierpInput
                    label="Role / Designation"
                    required
                    placeholder="e.g., Lead Organizer / Core Member"
                    value={modalFields.role || ''}
                    onChange={(e) => setModalFields({ ...modalFields, role: e.target.value })}
                  />
                  <VierpInput
                    label="Academic Year"
                    placeholder="e.g., 2023–24"
                    value={modalFields.year || ''}
                    onChange={(e) => setModalFields({ ...modalFields, year: e.target.value })}
                    className="font-mono"
                  />
                </>
              )}

              {activeModal === 'MEDICAL' && (
                <>
                  <VierpInput
                    label="Medical Certificate / Condition"
                    required
                    placeholder="e.g., Sports Fitness & Ophthalmic Clearance"
                    value={modalFields.condition || ''}
                    onChange={(e) => setModalFields({ ...modalFields, condition: e.target.value })}
                  />
                  <VierpInput
                    label="Attesting Medical Officer"
                    required
                    placeholder="e.g., Dr. S. K. Deshmukh (Reg No. 49102)"
                    value={modalFields.verifiedBy || ''}
                    onChange={(e) => setModalFields({ ...modalFields, verifiedBy: e.target.value })}
                  />
                  <VierpInput
                    label="Year Verified"
                    placeholder="2024"
                    value={modalFields.year || ''}
                    onChange={(e) => setModalFields({ ...modalFields, year: e.target.value })}
                    className="font-mono"
                  />
                </>
              )}

              {activeModal === 'DOCUMENTS' && (
                <>
                  <VierpInput
                    label="Document Name"
                    required
                    placeholder="e.g., State Level Sports Merit Certificate"
                    value={modalFields.title || ''}
                    onChange={(e) => setModalFields({ ...modalFields, title: e.target.value })}
                  />
                  <VierpSelect
                    label="Attestation Format"
                    value={modalFields.type || 'PDF • Self Attested'}
                    onChange={(e) => setModalFields({ ...modalFields, type: e.target.value })}
                  >
                    <option value="PDF • Self Attested">PDF • Self Attested</option>
                    <option value="PDF • Gazetted Officer Attested">PDF • Gazetted Officer Attested</option>
                    <option value="PDF • DigiLocker Verified">PDF • DigiLocker Verified</option>
                  </VierpSelect>
                </>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save & Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Support & Helpdesk Modal Dialog ──────────────────────────────────── */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">VIERP Academic ERP Support</h3>
                <p className="text-xs text-[#64748B]">Vishwakarma Institute of Information Technology</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#334155] border-t border-[#F1F5F9] pt-3">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="block text-[#0F172A] mb-0.5">Academic Section Window 4</strong>
                <span>Direct student credential corrections & bank verification window.</span>
                <span className="block font-mono text-[11px] text-[#2563EB] mt-1">Timings: Mon–Fri, 10:00 AM – 4:00 PM</span>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="block text-[#0F172A] mb-0.5">Telephone Helpdesk</strong>
                <span className="font-mono text-[#0D9488] font-bold">020-24202180 / 020-24202181</span>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="block text-[#0F172A] mb-0.5">Official ERP Email</strong>
                <span className="font-mono text-[#2563EB]">support@vierp.in / academic@viit.ac.in</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Close Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Official University Fee Challan Modal ────────────────────────────── */}
      <FeeReceiptModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        transactionId="TXN-2024-SEM5-4821"
      />

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
              {semesterLedgers.map((sem, idx) => (
                <tr key={idx}>
                  <td className="p-1 border-r border-black font-semibold">{sem.sem}</td>
                  <td className="p-1 border-r border-black">{sem.session}</td>
                  <td className="p-1 border-r border-black font-mono">{sem.credits} Credits</td>
                  <td className="p-1 border-r border-black font-mono font-bold">SGPA: {sem.sgpa}</td>
                  <td className="p-1 font-semibold">{sem.status}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="p-1 border-r border-black" colSpan={3}>Cumulative Grade Point Average (CGPA)</td>
                <td className="p-1 border-r border-black font-mono text-sm font-black">{calculatedCGPA} / 10.0</td>
                <td className="p-1 text-emerald-800">FIRST CLASS WITH DISTINCTION ({calculatedPercentage}%)</td>
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
