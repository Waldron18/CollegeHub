'use client'

import React, { useState } from 'react'
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
  ExternalLink,
  Save,
  ArrowLeft,
  ArrowRight,
  Plus,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  FolderOpen,
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

export default function VierpProfilePage({ profile, onNavigate }: VierpProfilePageProps) {
  const isFaculty = profile?.role === 'FACULTY'
  const rails = isFaculty ? FACULTY_RAILS : STUDENT_RAILS

  const [activeRail, setActiveRail] = useState<string>('personal')
  const [showAadhaar, setShowAadhaar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Sub-tab states
  const [personalSubTab, setPersonalSubTab] = useState<
    'personal_details' | 'identity' | 'religion' | 'handicapped' | 'minority' | 'passport' | 'examination'
  >('personal_details')
  const [addressSubTab, setAddressSubTab] = useState<'permanent' | 'current' | 'emergency'>('permanent')
  const [familySubTab, setFamilySubTab] = useState<'father' | 'mother' | 'brother' | 'sister'>('father')
  const [educationSubTab, setEducationSubTab] = useState<
    'ssc' | 'hsc' | 'qualifying' | 'diploma' | 'graduation' | 'post_grad' | 'gap_year'
  >('ssc')
  const [bankSubTab, setBankSubTab] = useState<'bank_info' | 'loan' | 'sponsorship'>('bank_info')

  // Form states
  const [formData, setFormData] = useState({
    firstName: isFaculty ? 'Rajesh' : 'Aditya',
    middleName: isFaculty ? 'Suresh' : 'Kumar',
    lastName: isFaculty ? 'Kulkarni' : 'Sharma',
    category: 'OPEN',
    caste: 'General / Brahmin',
    subCaste: 'Deshastha',
    nationality: 'Indian',
    domicile: 'Maharashtra',
    mobileNumber: '+91 98230 11492',
    alternateMobile: '+91 98220 54129',
    personalEmail: profile?.email || (isFaculty ? 'rajesh.kulkarni@college.edu' : 'aditya.sharma@college.edu'),
    birthPlace: 'Pune, Maharashtra',
    bloodGroup: 'B +ve',
    earningParent: 'Suresh Kulkarni',
    earningParentRelation: 'Father',

    // Identity
    aadhaarNumber: 'XXXX-XXXX-4821',
    nameAsPerAadhaar: isFaculty ? 'Prof. Rajesh Suresh Kulkarni' : 'Aditya Kumar Sharma',
    panNumber: 'ABCDE9102K',
    voterId: 'VTR/MH/2022/49102',

    // Examination / Academic
    eligibilityNumber: '12022094819',
    abcId: '912-384-102-491',
    prnNumber: profile?.prnNumber || (isFaculty ? 'EMP-CE-402' : '22110482'),
    program: isFaculty ? 'Faculty • Computer Engineering' : 'B.Tech Computer Engineering',
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

    // Bank
    accountNumber: '39481029481',
    accountHolder: isFaculty ? 'Prof. Rajesh Kulkarni' : 'Aditya Sharma',
    bankName: 'State Bank of India',
    branchName: 'VIIT Campus Branch, Kondhwa, Pune',
    ifscCode: 'SBIN0014829',
    micrCode: '411002081',

    // Social Links
    facebookLink: '',
    facultyWebLink: 'https://viit.ac.in/faculty/rajesh-kulkarni',
    linkedinLink: 'https://linkedin.com/in/aditya-sharma-viit',
    instagramLink: '',
    scholarLink: 'https://scholar.google.com/citations?user=aditya_viit',
    vidwanLink: 'https://vidwan.inflibnet.ac.in/profile/204918',
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

  // Render Oops Empty State
  const renderEmptyState = (title: string, actionLabel: string) => (
    <div className="py-14 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-2xl bg-[#FAF5FF] border border-[#F3E8FF] flex items-center justify-center mb-4 text-[#9333EA] shadow-inner">
        <FolderOpen className="w-12 h-12 stroke-[1.5]" />
      </div>
      <h3 className="text-xl font-extrabold text-[#DC2626] tracking-tight">
        Oops.. Data Not Found!
      </h3>
      <p className="text-xs text-[#64748B] mt-1.5 max-w-sm">
        No active records registered in this category under Academic Year 2024–25. Click below to append your record.
      </p>
      <button
        type="button"
        onClick={() => {
          setToastMsg(`${actionLabel} request recorded. Portal admin review pending.`)
          setTimeout(() => setToastMsg(null), 3500)
        }}
        className="mt-6 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
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

      {/* Top Sub-Navigation Bar */}
      <div className="flex items-center justify-between py-3 px-1 mb-4 border-b border-[#E2E8F0]">
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

      {/* Two-Column Layout: Left Pill Rail + Main Card */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
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
                {/* Floating Tooltip for Desktop */}
                <span className="hidden lg:group-hover:block absolute left-14 bg-[#0F172A] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-30 pointer-events-none">
                  {item.label}
                </span>
              </button>
            )
          })}
        </aside>

        {/* Main Center Container: White Card with Rounded Borders */}
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
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Middle Name</label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => handleChange('middleName', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Official Email</label>
                      <input
                        type="email"
                        readOnly
                        value={formData.personalEmail}
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#64748B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none bg-white"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Caste</label>
                      <input
                        type="text"
                        value={formData.caste}
                        onChange={(e) => handleChange('caste', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Nationality *</label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Domicile *</label>
                      <input
                        type="text"
                        value={formData.domicile}
                        onChange={(e) => handleChange('domicile', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Mobile Number *</label>
                      <input
                        type="text"
                        value={formData.mobileNumber}
                        onChange={(e) => handleChange('mobileNumber', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Birth Place</label>
                      <input
                        type="text"
                        value={formData.birthPlace}
                        onChange={(e) => handleChange('birthPlace', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Blood Group *</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none bg-white"
                      >
                        <option value="A +ve">A +ve</option>
                        <option value="B +ve">B +ve</option>
                        <option value="O +ve">O +ve</option>
                        <option value="AB +ve">AB +ve</option>
                        <option value="O -ve">O -ve</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Earning Parent Relation</label>
                      <input
                        type="text"
                        value={formData.earningParentRelation}
                        onChange={(e) => handleChange('earningParentRelation', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {personalSubTab === 'identity' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                        Aadhaar Card Number (Govt. ID)
                      </label>
                      <div className="relative">
                        <input
                          type={showAadhaar ? 'text' : 'password'}
                          value={formData.aadhaarNumber}
                          onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                          className="w-full h-10 pl-3 pr-10 rounded-lg border border-[#CBD5E1] text-xs font-mono font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#475569]"
                        >
                          {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-[#10B981] mt-1 block">✓ Verified with UIDAI Record</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Name as per Aadhaar</label>
                      <input
                        type="text"
                        value={formData.nameAsPerAadhaar}
                        onChange={(e) => handleChange('nameAsPerAadhaar', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">PAN Card Number</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => handleChange('panNumber', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Voter ID / EPIC No.</label>
                      <input
                        type="text"
                        value={formData.voterId}
                        onChange={(e) => handleChange('voterId', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {personalSubTab === 'examination' && (
                  <div className="space-y-5 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                          Academic Bank of Credits (ABC ID)
                        </label>
                        <input
                          type="text"
                          value={formData.abcId}
                          onChange={(e) => handleChange('abcId', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F172A] focus:border-[#2563EB] focus:outline-none bg-[#F0FDF4] border-[#86EFAC]"
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
                        <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                          University Eligibility Number
                        </label>
                        <input
                          type="text"
                          value={formData.eligibilityNumber}
                          readOnly
                          className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-semibold text-[#475569]"
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
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Permanent Address Line *</label>
                      <textarea
                        rows={2}
                        value={formData.permanentAddress}
                        onChange={(e) => handleChange('permanentAddress', e.target.value)}
                        className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">District</label>
                        <input
                          type="text"
                          value={formData.district}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Taluka</label>
                        <input
                          type="text"
                          value={formData.taluka}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Pin Code</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#0F172A] font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isSameAddress}
                          onChange={(e) => handleChange('isSameAddress', e.target.checked)}
                          className="rounded text-[#2563EB] focus:ring-0"
                        />
                        <span>Whether Permanent Address is Same as Current Address?</span>
                      </label>
                    </div>
                  </div>
                )}

                {addressSubTab === 'current' && (
                  <div className="space-y-4 max-w-3xl">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Current Address Line *</label>
                      <textarea
                        rows={2}
                        value={formData.currentAddress}
                        onChange={(e) => handleChange('currentAddress', e.target.value)}
                        className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {addressSubTab === 'emergency' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Emergency Contact Name *</label>
                      <input
                        type="text"
                        value={formData.emergencyName}
                        onChange={(e) => handleChange('emergencyName', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Primary Mobile Number *</label>
                      <input
                        type="text"
                        value={formData.emergencyMobile}
                        onChange={(e) => handleChange('emergencyMobile', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Relation</label>
                      <input
                        type="text"
                        value={formData.emergencyRelation}
                        onChange={(e) => handleChange('emergencyRelation', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">City</label>
                      <input
                        type="text"
                        value={formData.emergencyCity}
                        onChange={(e) => handleChange('emergencyCity', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                      />
                    </div>
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
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      defaultValue={familySubTab === 'father' ? 'Sanjay Sharma' : familySubTab === 'mother' ? 'Sunita Sharma' : 'N/A'}
                      className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Education / Qualification</label>
                    <input
                      type="text"
                      defaultValue={familySubTab === 'father' ? 'B.Com, Pune University' : 'M.A., Pune University'}
                      className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Occupation</label>
                    <input
                      type="text"
                      defaultValue={familySubTab === 'father' ? 'Senior Accountant' : 'Homemaker'}
                      className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Annual Income (in Rs.)</label>
                    <input
                      type="text"
                      defaultValue={familySubTab === 'father' ? '₹ 8,50,000' : '₹ 0'}
                      className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono font-medium text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Mobile Number</label>
                    <input
                      type="text"
                      defaultValue="+91 98220 54129"
                      className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Email ID</label>
                    <input
                      type="email"
                      defaultValue="sanjay.sharma@gmail.com"
                      className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                    />
                  </div>
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
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">Board Name</label>
                      <input
                        type="text"
                        readOnly
                        value="Maharashtra State Board (MSBSHSE)"
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">Passing Year</label>
                      <input
                        type="text"
                        readOnly
                        value="2020"
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">Percentage Obtained</label>
                      <input
                        type="text"
                        readOnly
                        value="94.60%"
                        className="w-full h-10 px-3 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] text-xs font-mono font-bold text-[#065F46]"
                      />
                    </div>
                  </div>
                )}

                {educationSubTab === 'hsc' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">Board Name</label>
                      <input
                        type="text"
                        readOnly
                        value="Maharashtra State Board (HSC)"
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">Passing Year</label>
                      <input
                        type="text"
                        readOnly
                        value="2022"
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">Percentage Obtained</label>
                      <input
                        type="text"
                        readOnly
                        value="92.40%"
                        className="w-full h-10 px-3 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] text-xs font-mono font-bold text-[#065F46]"
                      />
                    </div>
                  </div>
                )}

                {educationSubTab === 'qualifying' && (
                  <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] max-w-2xl">
                    <span className="text-xs font-bold text-[#0D9488] block">MHT-CET Entrance Examination</span>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Application ID</span>
                        <span className="text-xs font-mono font-bold text-[#0F172A]">2210482910</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Percentile</span>
                        <span className="text-xs font-mono font-bold text-[#0D9488]">98.74 %ile</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">All India Rank</span>
                        <span className="text-xs font-mono font-bold text-[#0F172A]">#1,240</span>
                      </div>
                    </div>
                  </div>
                )}

                {educationSubTab === 'graduation' && (
                  <div className="space-y-4">
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

          {/* ================= RAIL 5: BANK DETAILS ================= */}
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
                    <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[11px] text-[#92400E] flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Bank details are locked by the Registrar Accounts Department. To request modification, visit Academic Section Window 4.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Account Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={formData.accountNumber}
                            className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-semibold text-[#0F172A]"
                          />
                          <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3.5" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.accountHolder}
                          className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Bank Name</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.bankName}
                          className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">Branch Name</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.branchName}
                          className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">IFSC Code</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.ifscCode}
                          className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">MICR Code</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.micrCode}
                          className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono text-[#0F172A]"
                        />
                      </div>
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
            <div className="p-6 flex-1 space-y-4">
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
          )}

          {/* ================= RAIL 8: EXPERIENCE (EMPTY STATE) ================= */}
          {activeRail === 'experience' && renderEmptyState('Experience & Certificates', '+ EXPERIENCE')}

          {/* ================= RAIL 9: AWARDS (EMPTY STATE) ================= */}
          {activeRail === 'awards' && renderEmptyState('Awards & Honors', '+ AWARD')}

          {/* ================= RAIL 10: ACTIVITIES (EMPTY STATE) ================= */}
          {activeRail === 'activities' && renderEmptyState('Extracurricular Activities', '+ ACTIVITY')}

          {/* ================= RAIL 11: PHOTOS & SIGNATURES ================= */}
          {activeRail === 'photos' && (
            <div className="p-6 flex-1 space-y-6 max-w-2xl">
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-start gap-3">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Official Photograph & Signature Guidelines</span>
                  Image dimensions: Width=350px, Height=450px. File size must be under 500 KB. Must be taken on a plain white background within the last 6 months.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center text-center bg-[#F8FAFC]">
                  <div className="w-32 h-40 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex items-center justify-center text-white font-bold text-3xl shadow-md mb-3 border-2 border-white">
                    {formData.firstName[0]}
                    {formData.lastName[0]}
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">Aditya Sharma</span>
                  <span className="text-[10px] text-[#10B981] font-semibold mt-0.5">✓ Biometric Photo Verified</span>
                </div>

                <div className="border border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-[#F8FAFC]">
                  <div className="w-full h-32 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center font-serif italic text-xl text-[#1E3A8A] select-none">
                    Aditya Sharma
                  </div>
                  <div className="w-full pt-2">
                    <span className="text-xs font-bold text-[#0F172A] block">Digital Signature</span>
                    <span className="text-[10px] text-[#10B981] font-semibold block">✓ Attested by Registrar</span>
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

          {/* ================= FACULTY RESEARCH & GRANTS (When Active) ================= */}
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

          {/* Footer Action Buttons */}
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
                <span>{rails.findIndex((r) => r.id === activeRail) === rails.length - 1 ? 'FINISH' : 'SAVE AND NEXT'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
