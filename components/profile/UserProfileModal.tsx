'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  Phone,
  Users,
  GraduationCap,
  Landmark,
  FileText,
  Building,
  BookOpen,
  CreditCard,
  CheckCircle2,
  X,
  Save,
  ArrowRight,
  Upload,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Camera,
  FileCheck2,
  FolderOpen,
  Info,
  ChevronRight,
  Plus,
  HelpCircle,
} from 'lucide-react'
import type { StudentProfile } from '@/types/dashboard'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile?: StudentProfile | null
}

export default function UserProfileModal({
  isOpen,
  onClose,
  profile,
}: UserProfileModalProps) {
  const isFaculty = profile?.role === 'FACULTY'

  // Vertical Rails:
  // Student: 'personal' | 'address' | 'family' | 'education' | 'bank' | 'portfolio'
  // Faculty: 'institutional' | 'cabin' | 'qualifications' | 'research' | 'payroll'
  const [verticalRail, setVerticalRail] = useState<string>(isFaculty ? 'institutional' : 'personal')

  // Top Horizontal Sub-Tabs
  const [personalSubTab, setPersonalSubTab] = useState<
    | 'personal_details'
    | 'identity'
    | 'religion'
    | 'handicapped'
    | 'minority'
    | 'passport'
    | 'examination'
  >('personal_details')

  const [addressSubTab, setAddressSubTab] = useState<'permanent' | 'current' | 'emergency'>('permanent')

  const [familySubTab, setFamilySubTab] = useState<'father' | 'mother' | 'brother' | 'sister'>('father')

  const [educationSubTab, setEducationSubTab] = useState<
    | 'ssc'
    | 'hsc'
    | 'qualifying'
    | 'diploma'
    | 'graduation'
    | 'post_grad'
    | 'gap_year'
  >('ssc')

  const [bankSubTab, setBankSubTab] = useState<'bank_info' | 'loan' | 'sponsorship'>('bank_info')

  const [portfolioSubTab, setPortfolioSubTab] = useState<
    | 'photo'
    | 'signature'
    | 'antiragging'
    | 'social'
    | 'publications'
    | 'empty_skills'
  >('photo')

  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Student Comprehensive Form State
  const [studentData, setStudentData] = useState({
    // Personal Details
    firstName: 'Waldron',
    middleName: 'Francis',
    lastName: 'Rodrigues',
    category: 'OPEN',
    caste: 'Anglo-Indian / Christian',
    subCaste: 'Roman Catholic',
    nationality: 'Indian',
    domicile: 'Maharashtra',
    mobileNumber: '+91 98230 11492',
    alternateMobile: '+91 98220 54129',
    personalEmail: profile?.email || 'waldron.rodrigues241@vit.edu',
    birthPlace: 'Pune, Maharashtra',
    bloodGroup: 'O +ve',
    earningParent: 'Francis Rodrigues',
    earningParentRelation: 'Father',

    // Identity
    aadhaarNumber: 'XXXX-XXXX-4821',
    nameAsPerAadhaar: 'Waldron Francis Rodrigues',
    panNumber: 'ABCDE9102K',
    voterId: 'VTR/MH/2022/49102',

    // Religion
    religion: 'Christianity',
    motherTongue: 'English',
    areaType: 'Urban',
    maritalStatus: 'Unmarried',

    // Physically Handicapped
    isHandicapped: 'No',
    handicapType: 'N/A',
    handicapPercentage: '0%',

    // Minority Details
    isMinority: 'Yes',
    minorityType: 'Religious Minority (Christian)',

    // Passport Details
    hasPassport: 'Yes',
    passportNumber: 'Z5819204',
    passportExpiry: '14-AUG-2032',
    issuePlace: 'Pune RPO',

    // Examination Details
    eligibilityNumber: '12022094819',
    abcId: '912-384-102-491',
    prnNumber: profile?.prnNumber || '12413586',
    program: 'B.Tech Computer Engineering',
    admissionYear: '2022',

    // Address
    permanentAddress: 'Flat 402, Royal Palms, Paud Road, Kothrud, Pune - 411038, Maharashtra',
    currentAddress: 'Flat 402, Royal Palms, Paud Road, Kothrud, Pune - 411038, Maharashtra',
    emergencyContactName: 'Francis Rodrigues',
    emergencyContactPhone: '+91 98220 54129',
    emergencyRelation: 'Father',
    emergencyCity: 'Pune',
    emergencyAge: '52',

    // Family Details
    fatherName: 'Francis Rodrigues',
    fatherEducation: 'B.E. (Mechanical) - COEP',
    fatherOccupation: 'Executive Technical Director',
    fatherIncome: '₹22,50,000 / Annum',
    fatherEmail: 'francis.rodrigues@techcorp.com',
    fatherMobile: '+91 98220 54129',

    motherName: 'Valerie Rodrigues',
    motherEducation: 'M.A. (English Literature), B.Ed',
    motherOccupation: 'Senior Academic Coordinator',
    motherIncome: '₹14,00,000 / Annum',
    motherEmail: 'valerie.rodrigues@edu.org',
    motherMobile: '+91 98220 54130',

    brotherName: 'Nathan Rodrigues',
    brotherEducation: '10th Standard (DAV Public School)',
    brotherOccupation: 'Student',
    sisterName: 'None',

    // Education
    sscSchool: 'St. Vincent\'s High School, Camp, Pune',
    sscBoard: 'Maharashtra State Board',
    sscMarks: '473 / 500',
    sscPercentage: '94.60%',
    sscYear: '2020',

    hscCollege: 'Fergusson Junior College, FC Road, Pune',
    hscBoard: 'Maharashtra State Board (HSC)',
    hscMarks: '547 / 600',
    hscPercentage: '91.17%',
    hscYear: '2022',
    cetScore: '98.74 %ile (MHT-CET 2022)',
    jeeScore: '94.12 %ile (JEE Mains)',

    diplomaCollege: 'Not Applicable (Direct 12th Admission)',
    gradSem1Sgpa: '9.40',
    gradSem2Sgpa: '9.25',
    gradSem3Sgpa: '8.95',
    gradSem4Sgpa: '9.12',
    gradCgpa: '9.18 / 10.0',
    gapYear: 'No Gap Year (Continuous Progression)',

    // Bank Information
    bankAccountNo: '•••• •••• •••• 4029',
    bankHolderName: 'Waldron Francis Rodrigues',
    bankName: 'State Bank of India',
    bankBranch: 'Kothrud Branch, Pune',
    bankIfsc: 'SBIN0004128',
    loanStatus: 'No Educational Loan Applied',
    sponsorship: 'Merit-Cum-Means Institutional Tuition Waiver (Approved)',

    // Social Links
    linkedInUrl: 'https://linkedin.com/in/waldron-rodrigues',
    googleScholarUrl: 'https://scholar.google.com/citations?user=waldron-rodrigues',
    githubUrl: 'https://github.com/waldron-rodrigues',
    vidwanId: 'VIDWAN-381920',
  })

  // Faculty Comprehensive State
  const [facultyData, setFacultyData] = useState({
    empId: 'EMP-CE-402',
    designation: 'Associate Professor & PG Studies Coordinator',
    department: 'Department of Computer Engineering',
    officialEmail: profile?.email || 'rajesh.kulkarni@college.edu',
    joiningDate: '12-Jul-2015',
    bloodGroup: 'B +ve',
    cabinLocation: 'Academic Block 4, Cabin 412',
    intercomExt: '2142',
    mobileNumber: '+91 94220 89104',
    address: 'B-12, Hermes Heritage, Shastri Nagar, Yerwada, Pune - 411006',
    ugDegree: 'B.E. Computer Engineering (COEP, 2007) - First Class Distinction',
    pgDegree: 'M.E. Computer Engineering (SPPU, 2011) - 78.4%',
    phdDegree: 'Ph.D. in Computer Engineering (COEP Tech Univ, 2019)',
    thesisTitle: 'Distributed Resource Allocation & Fault Tolerance in Heterogeneous Fog Clusters',
    scopusJournals: '18 Scopus / Web of Science indexed journals',
    ieeeConferences: '24 International IEEE / Springer Conference Publications',
    patentsGranted: '2 Patents Granted (Indian Patent Office)',
    scholarUrl: 'https://scholar.google.com/citations?user=rkulkarni_viit',
    vidwanId: 'VIDWAN-104928',
    salaryAccount: '•••• •••• •••• 8841',
    ifsc: 'HDFC0000103',
    pfNumber: 'MH/PUN/0048192/000/104',
    panNumber: 'ABCDE1234F',
  })

  useEffect(() => {
    setVerticalRail(isFaculty ? 'institutional' : 'personal')
  }, [isFaculty])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, onClose])

  if (!isOpen) return null

  const handleSaveDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setToastMsg('Dossier records synchronized with VIERP Academic Registrar.')
      setTimeout(() => setToastMsg(null), 3500)
    }, 500)
  }

  const handleSaveAndNext = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setToastMsg('Current section saved! Advancing to next record...')
      setTimeout(() => setToastMsg(null), 2500)

      if (!isFaculty) {
        if (verticalRail === 'personal') {
          if (personalSubTab === 'personal_details') setPersonalSubTab('identity')
          else if (personalSubTab === 'identity') setPersonalSubTab('religion')
          else if (personalSubTab === 'religion') setPersonalSubTab('examination')
          else setVerticalRail('address')
        } else if (verticalRail === 'address') {
          if (addressSubTab === 'permanent') setAddressSubTab('current')
          else if (addressSubTab === 'current') setAddressSubTab('emergency')
          else setVerticalRail('family')
        } else if (verticalRail === 'family') {
          if (familySubTab === 'father') setFamilySubTab('mother')
          else if (familySubTab === 'mother') setFamilySubTab('brother')
          else setVerticalRail('education')
        } else if (verticalRail === 'education') {
          if (educationSubTab === 'ssc') setEducationSubTab('hsc')
          else if (educationSubTab === 'hsc') setEducationSubTab('graduation')
          else setVerticalRail('bank')
        } else if (verticalRail === 'bank') {
          setVerticalRail('portfolio')
        }
      } else {
        if (verticalRail === 'institutional') setVerticalRail('cabin')
        else if (verticalRail === 'cabin') setVerticalRail('qualifications')
        else if (verticalRail === 'qualifications') setVerticalRail('research')
        else if (verticalRail === 'research') setVerticalRail('payroll')
      }
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => !isSaving && onClose()}
      />

      {/* Main Modal Shell */}
      <div className="relative w-full max-w-6xl h-[92vh] rounded-2xl bg-white shadow-2xl border border-[#E2E8F0] z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D9488] flex items-center justify-center text-white font-black text-sm shadow-md">
              VI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">
                  {isFaculty ? 'Faculty Academic & Service Dossier' : 'Student Academic Dossier & Profile'}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  VIERP VERIFIED • 2024–25
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Vishwakarma Institute of Information Technology • Academic Records Division
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Alert */}
        {toastMsg && (
          <div className="px-6 py-2 bg-[#ECFDF5] border-b border-[#A7F3D0] text-xs font-semibold text-[#065F46] flex items-center gap-2 animate-in fade-in duration-150 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Center Workspace: Left Vertical Icon Rail + Right Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Vertical Icon Rail */}
          <div className="w-16 sm:w-56 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col justify-between py-3 flex-shrink-0 select-none">
            <div className="space-y-1 px-2">
              <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-2">
                Sections
              </span>

              {!isFaculty ? (
                <>
                  {[
                    { id: 'personal', label: 'Personal', icon: User, count: '7' },
                    { id: 'address', label: 'Address', icon: Phone, count: '3' },
                    { id: 'family', label: 'Family Details', icon: Users, count: '4' },
                    { id: 'education', label: 'Education', icon: GraduationCap, count: '7' },
                    { id: 'bank', label: 'Bank & Finance', icon: Landmark, count: '3' },
                    { id: 'portfolio', label: 'Portfolio & Media', icon: FileText, count: '6' },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = verticalRail === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVerticalRail(item.id)}
                        className={`w-full flex items-center justify-center sm:justify-between px-2 sm:px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#0D9488] text-white shadow-xs'
                            : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline truncate">{item.label}</span>
                        </div>
                        <span
                          className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    )
                  })}
                </>
              ) : (
                <>
                  {[
                    { id: 'institutional', label: 'Institutional', icon: Building, count: '6' },
                    { id: 'cabin', label: 'Contact & Cabin', icon: Phone, count: '3' },
                    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap, count: '3' },
                    { id: 'research', label: 'Research & Patents', icon: BookOpen, count: '4' },
                    { id: 'payroll', label: 'Payroll & Bank', icon: CreditCard, count: '4' },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = verticalRail === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVerticalRail(item.id)}
                        className={`w-full flex items-center justify-center sm:justify-between px-2 sm:px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#0D9488] text-white shadow-xs'
                            : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline truncate">{item.label}</span>
                        </div>
                        <span
                          className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </div>

            {/* Rail Bottom Info */}
            <div className="px-3 pt-2 border-t border-[#E2E8F0] hidden sm:block">
              <div className="flex items-center gap-2 text-[#64748B] text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>SPPU Exam Audit</span>
              </div>
            </div>
          </div>

          {/* Right Main Body: Top Horizontal Sub-Tabs + Form View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Horizontal Sub-Tabs Container */}
            <div className="px-6 pt-3 bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-x-auto flex-shrink-0">
              {/* STUDENT SUB-TABS */}
              {!isFaculty && (
                <>
                  {verticalRail === 'personal' && (
                    <div className="flex items-center gap-1.5 pb-2">
                      {[
                        { id: 'personal_details', label: 'Personal Details' },
                        { id: 'identity', label: 'Identity' },
                        { id: 'religion', label: 'Religion' },
                        { id: 'handicapped', label: 'Physically Handicapped' },
                        { id: 'minority', label: 'Minority Details' },
                        { id: 'passport', label: 'Passport Details' },
                        { id: 'examination', label: 'Examination Details' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setPersonalSubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            personalSubTab === st.id
                              ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {verticalRail === 'address' && (
                    <div className="flex items-center gap-1.5 pb-2">
                      {[
                        { id: 'permanent', label: 'Permanent Address' },
                        { id: 'current', label: 'Current Address' },
                        { id: 'emergency', label: 'Emergency Contact' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setAddressSubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            addressSubTab === st.id
                              ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {verticalRail === 'family' && (
                    <div className="flex items-center gap-1.5 pb-2">
                      {[
                        { id: 'father', label: "Father's Details" },
                        { id: 'mother', label: "Mother's Details" },
                        { id: 'brother', label: "Brother's Details" },
                        { id: 'sister', label: "Sister's Details" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFamilySubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            familySubTab === st.id
                              ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {verticalRail === 'education' && (
                    <div className="flex items-center gap-1.5 pb-2">
                      {[
                        { id: 'ssc', label: 'SSC/10th Marks' },
                        { id: 'hsc', label: 'HSC/12th Marks' },
                        { id: 'qualifying', label: 'Qualifying Examination Details' },
                        { id: 'diploma', label: 'Diploma Details' },
                        { id: 'graduation', label: 'Graduation Details' },
                        { id: 'post_grad', label: 'Post Graduation Details' },
                        { id: 'gap_year', label: 'Gap In Academic Year' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setEducationSubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            educationSubTab === st.id
                              ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {verticalRail === 'bank' && (
                    <div className="flex items-center gap-1.5 pb-2">
                      {[
                        { id: 'bank_info', label: 'Student Bank Information' },
                        { id: 'loan', label: 'Loan Details' },
                        { id: 'sponsorship', label: 'Sponsorship Details' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setBankSubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            bankSubTab === st.id
                              ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {verticalRail === 'portfolio' && (
                    <div className="flex items-center gap-1.5 pb-2">
                      {[
                        { id: 'photo', label: 'Photo Upload (For I-Card & Exam)' },
                        { id: 'signature', label: "Upload Student's Signature" },
                        { id: 'antiragging', label: 'Anti Ragging Undertaking' },
                        { id: 'social', label: 'Add Social Information' },
                        { id: 'publications', label: 'Publications' },
                        { id: 'empty_skills', label: 'Skills & Experience' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setPortfolioSubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            portfolioSubTab === st.id
                              ? 'bg-white text-[#0D9488] shadow-xs border border-[#CBD5E1]'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* FACULTY SUB-HEADER */}
              {isFaculty && (
                <div className="pb-2 text-xs font-semibold text-[#0D9488]">
                  {verticalRail === 'institutional' && 'Official Faculty Credentials & Department Placement'}
                  {verticalRail === 'cabin' && 'Campus Office & Direct Faculty Communication Lines'}
                  {verticalRail === 'qualifications' && 'Graduate, Postgraduate & Doctoral Qualifications'}
                  {verticalRail === 'research' && 'Scopus / SCI Research Publications & Indian Patent Registrations'}
                  {verticalRail === 'payroll' && 'Salary Disbursement & Institutional PF Ledger'}
                </div>
              )}
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* STUDENT SECTIONS */}
              {!isFaculty && (
                <div className="space-y-4">
                  {/* Personal -> Personal Details */}
                  {verticalRail === 'personal' && personalSubTab === 'personal_details' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">First Name</label>
                        <input
                          type="text"
                          value={studentData.firstName}
                          onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Middle Name</label>
                        <input
                          type="text"
                          value={studentData.middleName}
                          onChange={(e) => setStudentData({ ...studentData, middleName: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Last Name</label>
                        <input
                          type="text"
                          value={studentData.lastName}
                          onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Category</label>
                        <input
                          type="text"
                          value={studentData.category}
                          onChange={(e) => setStudentData({ ...studentData, category: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Caste</label>
                        <input
                          type="text"
                          value={studentData.caste}
                          onChange={(e) => setStudentData({ ...studentData, caste: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Nationality</label>
                        <input
                          type="text"
                          value={studentData.nationality}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#64748B] bg-[#F1F5F9]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">State Domicile</label>
                        <input
                          type="text"
                          value={studentData.domicile}
                          onChange={(e) => setStudentData({ ...studentData, domicile: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Birth Place</label>
                        <input
                          type="text"
                          value={studentData.birthPlace}
                          onChange={(e) => setStudentData({ ...studentData, birthPlace: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Blood Group</label>
                        <input
                          type="text"
                          value={studentData.bloodGroup}
                          onChange={(e) => setStudentData({ ...studentData, bloodGroup: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Earning Parent Name & Relation</label>
                        <input
                          type="text"
                          value={`${studentData.earningParent} (${studentData.earningParentRelation})`}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#475569] bg-[#F8FAFC]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Student Primary Mobile</label>
                        <input
                          type="text"
                          value={studentData.mobileNumber}
                          onChange={(e) => setStudentData({ ...studentData, mobileNumber: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Personal -> Identity */}
                  {verticalRail === 'personal' && personalSubTab === 'identity' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Aadhaar Card Number</label>
                        <input
                          type="text"
                          value={studentData.aadhaarNumber}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9] font-mono"
                        />
                        <span className="text-[10px] text-[#10B981] font-semibold mt-1 block">✔ UIDAI Verified</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Name As Per Aadhaar</label>
                        <input
                          type="text"
                          value={studentData.nameAsPerAadhaar}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Permanent Account No (PAN)</label>
                        <input
                          type="text"
                          value={studentData.panNumber}
                          onChange={(e) => setStudentData({ ...studentData, panNumber: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Personal -> Religion */}
                  {verticalRail === 'personal' && personalSubTab === 'religion' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Religion</label>
                        <input
                          type="text"
                          value={studentData.religion}
                          onChange={(e) => setStudentData({ ...studentData, religion: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Mother Tongue</label>
                        <input
                          type="text"
                          value={studentData.motherTongue}
                          onChange={(e) => setStudentData({ ...studentData, motherTongue: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Area Type</label>
                        <select
                          value={studentData.areaType}
                          onChange={(e) => setStudentData({ ...studentData, areaType: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        >
                          <option>Urban</option>
                          <option>Rural</option>
                          <option>Semi-Urban</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Personal -> Handicapped / Minority / Passport */}
                  {verticalRail === 'personal' && (personalSubTab === 'handicapped' || personalSubTab === 'minority' || personalSubTab === 'passport') && (
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 animate-in fade-in-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A]">
                          {personalSubTab === 'handicapped' && 'Physically Handicapped (Divyangjan) Status'}
                          {personalSubTab === 'minority' && 'Linguistic / Religious Minority Status'}
                          {personalSubTab === 'passport' && 'Indian Passport Credentials'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          Verified Document
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {personalSubTab === 'handicapped' && `Declared Status: ${studentData.isHandicapped} (${studentData.handicapPercentage})`}
                        {personalSubTab === 'minority' && `Declared Status: ${studentData.isMinority} - ${studentData.minorityType}`}
                        {personalSubTab === 'passport' && `Passport No: ${studentData.passportNumber} • Valid Till: ${studentData.passportExpiry} (${studentData.issuePlace})`}
                      </p>
                    </div>
                  )}

                  {/* Personal -> Examination Details */}
                  {verticalRail === 'personal' && personalSubTab === 'examination' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">SPPU Eligibility Number</label>
                        <input
                          type="text"
                          value={studentData.eligibilityNumber}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9] font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Academic Bank of Credits (ABC ID)</label>
                        <input
                          type="text"
                          value={studentData.abcId}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0D9488] bg-[#F1F5F9] font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">PRN Registration No</label>
                        <input
                          type="text"
                          value={studentData.prnNumber}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9] font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Address Section */}
                  {verticalRail === 'address' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      {addressSubTab === 'permanent' && (
                        <div>
                          <label className="block text-xs font-semibold text-[#334155] mb-1">Permanent Home Address</label>
                          <textarea
                            rows={3}
                            value={studentData.permanentAddress}
                            onChange={(e) => setStudentData({ ...studentData, permanentAddress: e.target.value })}
                            className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                          />
                        </div>
                      )}
                      {addressSubTab === 'current' && (
                        <div>
                          <label className="block text-xs font-semibold text-[#334155] mb-1">Current Residential Address</label>
                          <textarea
                            rows={3}
                            value={studentData.currentAddress}
                            onChange={(e) => setStudentData({ ...studentData, currentAddress: e.target.value })}
                            className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                          />
                        </div>
                      )}
                      {addressSubTab === 'emergency' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Emergency Contact Name</label>
                            <input
                              type="text"
                              value={studentData.emergencyContactName}
                              onChange={(e) => setStudentData({ ...studentData, emergencyContactName: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Relationship</label>
                            <input
                              type="text"
                              value={studentData.emergencyRelation}
                              onChange={(e) => setStudentData({ ...studentData, emergencyRelation: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Primary Mobile Number</label>
                            <input
                              type="text"
                              value={studentData.emergencyContactPhone}
                              onChange={(e) => setStudentData({ ...studentData, emergencyContactPhone: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Family Section */}
                  {verticalRail === 'family' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      {familySubTab === 'father' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Father's Full Name</label>
                            <input
                              type="text"
                              value={studentData.fatherName}
                              onChange={(e) => setStudentData({ ...studentData, fatherName: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Education</label>
                            <input
                              type="text"
                              value={studentData.fatherEducation}
                              onChange={(e) => setStudentData({ ...studentData, fatherEducation: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Occupation</label>
                            <input
                              type="text"
                              value={studentData.fatherOccupation}
                              onChange={(e) => setStudentData({ ...studentData, fatherOccupation: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Annual Income</label>
                            <input
                              type="text"
                              value={studentData.fatherIncome}
                              onChange={(e) => setStudentData({ ...studentData, fatherIncome: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                        </div>
                      )}
                      {familySubTab === 'mother' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Mother's Full Name</label>
                            <input
                              type="text"
                              value={studentData.motherName}
                              onChange={(e) => setStudentData({ ...studentData, motherName: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Education</label>
                            <input
                              type="text"
                              value={studentData.motherEducation}
                              onChange={(e) => setStudentData({ ...studentData, motherEducation: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Occupation</label>
                            <input
                              type="text"
                              value={studentData.motherOccupation}
                              onChange={(e) => setStudentData({ ...studentData, motherOccupation: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Annual Income</label>
                            <input
                              type="text"
                              value={studentData.motherIncome}
                              onChange={(e) => setStudentData({ ...studentData, motherIncome: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                            />
                          </div>
                        </div>
                      )}
                      {(familySubTab === 'brother' || familySubTab === 'sister') && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <h4 className="text-xs font-bold text-[#0F172A]">
                            {familySubTab === 'brother' ? "Brother's Records" : "Sister's Records"}
                          </h4>
                          <p className="text-xs text-[#64748B] mt-1">
                            {familySubTab === 'brother'
                              ? `${studentData.brotherName} • ${studentData.brotherEducation} • ${studentData.brotherOccupation}`
                              : 'No sister records registered under family ledger.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Education & Academics */}
                  {verticalRail === 'education' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      {educationSubTab === 'ssc' && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                          <h4 className="text-xs font-bold text-[#0F172A]">SSC / 10th Standard Academic Performance</h4>
                          <div className="text-xs text-[#475569] space-y-1">
                            <p>Institution: <strong>{studentData.sscSchool}</strong></p>
                            <p>Exam Board: <strong>{studentData.sscBoard}</strong></p>
                            <p>Aggregate Marks: <strong>{studentData.sscMarks}</strong></p>
                            <p className="text-[#0D9488] font-bold">Percentage: {studentData.sscPercentage}</p>
                          </div>
                        </div>
                      )}

                      {educationSubTab === 'hsc' && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                          <h4 className="text-xs font-bold text-[#0F172A]">HSC / 12th Standard & Entrance Marks</h4>
                          <div className="text-xs text-[#475569] space-y-1">
                            <p>Junior College: <strong>{studentData.hscCollege}</strong></p>
                            <p>Board: <strong>{studentData.hscBoard}</strong></p>
                            <p>Marks: <strong>{studentData.hscMarks} ({studentData.hscPercentage})</strong></p>
                            <p className="text-[#0D9488] font-bold">Entrance Scores: {studentData.cetScore} | {studentData.jeeScore}</p>
                          </div>
                        </div>
                      )}

                      {educationSubTab === 'graduation' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Sem 1 SGPA', score: studentData.gradSem1Sgpa },
                              { label: 'Sem 2 SGPA', score: studentData.gradSem2Sgpa },
                              { label: 'Sem 3 SGPA', score: studentData.gradSem3Sgpa },
                              { label: 'Sem 4 SGPA', score: studentData.gradSem4Sgpa },
                            ].map((sg) => (
                              <div key={sg.label} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-center">
                                <span className="text-[10px] font-bold uppercase text-[#64748B]">{sg.label}</span>
                                <span className="text-lg font-black text-[#0F172A] block mt-0.5">{sg.score}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-3.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F172A]">Cumulative Grade Point Average (CGPA): {studentData.gradCgpa}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10B981] text-white">First Class with Distinction</span>
                          </div>
                        </div>
                      )}

                      {(educationSubTab === 'qualifying' || educationSubTab === 'diploma' || educationSubTab === 'post_grad' || educationSubTab === 'gap_year') && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <h4 className="text-xs font-bold text-[#0F172A]">Specialized Academic Status</h4>
                          <p className="text-xs text-[#64748B] mt-1">
                            {educationSubTab === 'gap_year' ? studentData.gapYear : 'Regular direct degree candidate. No auxiliary diploma or post-grad credits.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank & Finance */}
                  {verticalRail === 'bank' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      {bankSubTab === 'bank_info' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              value={studentData.bankHolderName}
                              disabled
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Account Number</label>
                            <input
                              type="text"
                              value={studentData.bankAccountNo}
                              disabled
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9] font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={studentData.bankName}
                              disabled
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">IFSC Code</label>
                            <input
                              type="text"
                              value={studentData.bankIfsc}
                              disabled
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] bg-[#F1F5F9] font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {(bankSubTab === 'loan' || bankSubTab === 'sponsorship') && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <h4 className="text-xs font-bold text-[#0F172A]">Financial Assistance Status</h4>
                          <p className="text-xs text-[#64748B] mt-1">
                            {bankSubTab === 'loan' ? studentData.loanStatus : studentData.sponsorship}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Portfolio & Media */}
                  {verticalRail === 'portfolio' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      {portfolioSubTab === 'photo' && (
                        <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] flex flex-col sm:flex-row items-start gap-4">
                          <div className="w-24 h-28 rounded-xl bg-slate-200 border-2 border-dashed border-[#94A3B8] flex items-center justify-center text-[#64748B] flex-shrink-0">
                            <Camera className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#0F172A]">Official Photo Guidelines (For I-Card & Hall Ticket)</h4>
                            <ul className="text-[11px] text-[#64748B] space-y-1 list-disc pl-4">
                              <li>Passport size with white or clean neutral background.</li>
                              <li>Face should occupy 70-80% of the photograph.</li>
                              <li>Accepted formats: JPG, PNG (Max 500 KB).</li>
                            </ul>
                            <button
                              type="button"
                              onClick={() => alert('Photo upload dialog opened.')}
                              className="mt-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-xs font-semibold hover:bg-[#0F766E] transition-colors cursor-pointer"
                            >
                              Upload New Photograph
                            </button>
                          </div>
                        </div>
                      )}

                      {portfolioSubTab === 'signature' && (
                        <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
                          <h4 className="text-xs font-bold text-[#0F172A]">Student's Verified Digital Signature</h4>
                          <div className="p-3 bg-white border rounded-lg max-w-xs font-serif italic text-base text-[#1E293B]">
                            Waldron F. Rodrigues
                          </div>
                          <span className="text-[10px] text-[#10B981] font-semibold block">✔ Digitally locked for SPPU Examination forms</span>
                        </div>
                      )}

                      {portfolioSubTab === 'antiragging' && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                          <h4 className="text-xs font-bold text-[#0F172A]">Anti Ragging Undertaking Reference</h4>
                          <p className="text-xs text-[#64748B]">
                            Affidavit Reference #AR-2022-94819 submitted and approved by Student Welfare Cell.
                          </p>
                        </div>
                      )}

                      {portfolioSubTab === 'social' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">LinkedIn Profile</label>
                            <input
                              type="text"
                              value={studentData.linkedInUrl}
                              onChange={(e) => setStudentData({ ...studentData, linkedInUrl: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0D9488]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1">Google Scholar / Publications</label>
                            <input
                              type="text"
                              value={studentData.googleScholarUrl}
                              onChange={(e) => setStudentData({ ...studentData, googleScholarUrl: e.target.value })}
                              className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0D9488]"
                            />
                          </div>
                        </div>
                      )}

                      {portfolioSubTab === 'publications' && (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <h4 className="text-xs font-bold text-[#0F172A]">Capstone & Conference Research Papers</h4>
                          <p className="text-xs text-[#64748B] mt-1">
                            1. <em>&ldquo;Optimized Deadlock Prevention in Edge IoT Meshes&rdquo;</em> - IEEE Student Symposium 2024.
                          </p>
                        </div>
                      )}

                      {portfolioSubTab === 'empty_skills' && (
                        /* VIERP Empty State Illustration */
                        <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-center text-[#EF4444] mb-3">
                            <FolderOpen className="w-8 h-8" />
                          </div>
                          <h4 className="text-base font-extrabold text-[#0F172A]">Oops.. Data Not Found!</h4>
                          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                            No certifications, extracurricular awards, or industry internships recorded in this section yet.
                          </p>
                          <button
                            type="button"
                            onClick={() => alert('Add Record Dialog opened.')}
                            className="mt-4 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Entry</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FACULTY SECTIONS */}
              {isFaculty && (
                <div className="space-y-4">
                  {verticalRail === 'institutional' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Employee Code</label>
                        <input
                          type="text"
                          value={facultyData.empId}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono font-bold bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Academic Designation</label>
                        <input
                          type="text"
                          value={facultyData.designation}
                          onChange={(e) => setFacultyData({ ...facultyData, designation: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Department</label>
                        <input
                          type="text"
                          value={facultyData.department}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#64748B] bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Official Email</label>
                        <input
                          type="text"
                          value={facultyData.officialEmail}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#0D9488] bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Date of Joining</label>
                        <input
                          type="text"
                          value={facultyData.joiningDate}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#64748B] bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Blood Group</label>
                        <input
                          type="text"
                          value={facultyData.bloodGroup}
                          onChange={(e) => setFacultyData({ ...facultyData, bloodGroup: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                    </div>
                  )}

                  {verticalRail === 'cabin' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Faculty Cabin Location</label>
                        <input
                          type="text"
                          value={facultyData.cabinLocation}
                          onChange={(e) => setFacultyData({ ...facultyData, cabinLocation: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Intercom Extension</label>
                        <input
                          type="text"
                          value={facultyData.intercomExt}
                          onChange={(e) => setFacultyData({ ...facultyData, intercomExt: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Residential Address</label>
                        <textarea
                          rows={2}
                          value={facultyData.address}
                          onChange={(e) => setFacultyData({ ...facultyData, address: e.target.value })}
                          className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                        />
                      </div>
                    </div>
                  )}

                  {verticalRail === 'qualifications' && (
                    <div className="space-y-3 animate-in fade-in-50">
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[10px] font-bold text-[#0D9488] uppercase">Doctorate (Ph.D.)</span>
                        <h4 className="text-xs font-bold text-[#0F172A] mt-0.5">{facultyData.phdDegree}</h4>
                        <p className="text-xs text-[#64748B] mt-1">
                          Thesis: <em>&ldquo;{facultyData.thesisTitle}&rdquo;</em>
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[10px] font-bold text-[#3B82F6] uppercase">Postgraduate (M.E. / M.Tech)</span>
                        <h4 className="text-xs font-bold text-[#0F172A] mt-0.5">{facultyData.pgDegree}</h4>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase">Undergraduate (B.E.)</span>
                        <h4 className="text-xs font-bold text-[#0F172A] mt-0.5">{facultyData.ugDegree}</h4>
                      </div>
                    </div>
                  )}

                  {verticalRail === 'research' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                          <span className="text-2xl font-black text-[#0D9488]">18</span>
                          <p className="text-xs font-semibold text-[#0F172A] mt-1">Scopus / SCI Papers</p>
                        </div>
                        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                          <span className="text-2xl font-black text-[#3B82F6]">24</span>
                          <p className="text-xs font-semibold text-[#0F172A] mt-1">IEEE Conferences</p>
                        </div>
                        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                          <span className="text-2xl font-black text-[#8B5CF6]">2</span>
                          <p className="text-xs font-semibold text-[#0F172A] mt-1">Patents Granted</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-between text-xs">
                        <span>Vidwan ID: <strong className="font-mono text-[#0D9488]">{facultyData.vidwanId}</strong></span>
                        <a
                          href={facultyData.scholarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0D9488] font-semibold hover:underline flex items-center gap-1"
                        >
                          Google Scholar Profile <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {verticalRail === 'payroll' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Salary Account</label>
                        <input
                          type="text"
                          value={facultyData.salaryAccount}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">IFSC Code</label>
                        <input
                          type="text"
                          value={facultyData.ifsc}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">PF Account Number</label>
                        <input
                          type="text"
                          value={facultyData.pfNumber}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono bg-[#F1F5F9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">PAN Number</label>
                        <input
                          type="text"
                          value={facultyData.panNumber}
                          disabled
                          className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-mono bg-[#F1F5F9]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Bar with Save Details and Save and Next */}
            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                <span className="hidden sm:inline">VIERP Academic Records • Digitally Encrypted</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span>Save and Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDetails()}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Details'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
