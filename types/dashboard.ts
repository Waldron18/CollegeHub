export interface StudentProfile {
  id: string
  name: string
  email: string
  prnNumber?: string | null
  role: string
  department: string
  departmentCode?: string
  division?: string
  semester?: number
}

export interface FeeStatus {
  status: string
  amount: number
  transactionRef: string
  cleared: boolean
}

export interface TimetableSlot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  roomNumber: string
  faculty: string
}

export interface EnrolledSubject {
  id: string
  name: string
  code: string
  timetableSlots: TimetableSlot[]
}

export interface DashboardData {
  success: boolean
  profile: StudentProfile
  feeStatus: FeeStatus
  enrolledSubjects: EnrolledSubject[]
}
