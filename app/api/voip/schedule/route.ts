import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseTimeToMinutes(t: string): number {
  try {
    const clean = t.trim().toUpperCase()
    const parts = clean.split(' ')
    const modifier = parts[1] || ''
    const [hStr, mStr] = (parts[0] || '').split(':')
    let hours = parseInt(hStr, 10) || 0
    const minutes = parseInt(mStr, 10) || 0

    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  } catch {
    return 0
  }
}

// High-performance in-memory cache for fast sub-100ms responses
interface CacheEntry {
  payload: any
  timestamp: number
}
const scheduleCache = new Map<string, CacheEntry>()
const userMetaCache = new Map<string, { id: string; role: string; divisionId: string | null; timestamp: number }>()
const CACHE_TTL_MS = 60 * 1000 // 60s TTL

export function clearVoipScheduleCache() {
  scheduleCache.clear()
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const nowMs = Date.now()
    let user = userMetaCache.get(authUser.id)
    if (!user || nowMs - user.timestamp > CACHE_TTL_MS) {
      const dbUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, role: true, divisionId: true },
      })

      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      user = { ...dbUser, timestamp: nowMs }
      userMetaCache.set(authUser.id, user)
    }

    // Determine target date and day of week
    const { searchParams } = new URL(req.url)
    const dayParam = searchParams.get('day')
    const dateParam = searchParams.get('date')
    const now = new Date()
    const targetDateStr = dateParam || now.toISOString().split('T')[0]

    let dayOfWeek: string
    if (dayParam) {
      const cleanDay = dayParam.trim().toLowerCase()
      const found = DAYS_MAP.find((d) => d.toLowerCase() === cleanDay)
      dayOfWeek = found || DAYS_MAP[new Date(targetDateStr + 'T12:00:00.000Z').getUTCDay()]
    } else {
      const targetDateObj = new Date(targetDateStr + 'T12:00:00.000Z')
      dayOfWeek = DAYS_MAP[targetDateObj.getUTCDay()]
    }

    // Fast Cache Hit check (< 5ms response)
    const cacheKey = `${user.role}:${user.id}:${user.divisionId || 'none'}:${dayOfWeek}:${targetDateStr}`
    const cached = scheduleCache.get(cacheKey)
    if (cached && nowMs - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.payload)
    }

    const startOfDay = new Date(targetDateStr + 'T00:00:00.000Z')
    const endOfDay = new Date(targetDateStr + 'T23:59:59.999Z')

    // 1. Prepare query filters
    let baseWhere: any = { dayOfWeek }
    if (user.role === 'STUDENT') {
      if (user.divisionId) {
        baseWhere.divisionId = user.divisionId
      }
    } else if (user.role === 'FACULTY') {
      baseWhere.facultyId = user.id
    }

    let extraWhere: any = {
      status: 'APPROVED',
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    }

    if (user.role === 'STUDENT') {
      if (user.divisionId) {
        extraWhere.divisionId = user.divisionId
      }
    } else if (user.role === 'FACULTY') {
      extraWhere.facultyId = user.id
    }

    // 2. Fetch base slots and approved extra lectures concurrently with explicit selects
    console.time('voip-schedule-query')
    const [baseSlots, extraLectures] = await Promise.all([
      prisma.timetableSlot.findMany({
        where: baseWhere,
        select: {
          id: true,
          subjectId: true,
          divisionId: true,
          facultyId: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          roomNumber: true,
          subject: { select: { id: true, name: true, code: true } },
          division: { select: { id: true, name: true, semester: true } },
          faculty: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.extraLecture.findMany({
        where: extraWhere,
        select: {
          id: true,
          subjectId: true,
          divisionId: true,
          facultyId: true,
          date: true,
          startTime: true,
          endTime: true,
          roomNumber: true,
          reason: true,
          status: true,
          subject: { select: { id: true, name: true, code: true } },
          division: { select: { id: true, name: true, semester: true } },
          faculty: { select: { id: true, name: true, email: true } },
        },
      }),
    ])
    console.timeEnd('voip-schedule-query')

    // 3. Map & Combine into unified VoIP daily schedule items
    const formattedBase = baseSlots.map((slot) => ({
      id: slot.id,
      subjectId: slot.subjectId,
      subjectName: slot.subject.name,
      subjectCode: slot.subject.code,
      subject: slot.subject.name,
      code: slot.subject.code,
      divisionId: slot.divisionId,
      divisionName: slot.division.name,
      facultyId: slot.facultyId,
      facultyName: slot.faculty.name,
      faculty: slot.faculty.name,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      roomNumber: slot.roomNumber,
      room: slot.roomNumber,
      topic: `${slot.subject.name} Lecture & Lab Practice`,
      isExtra: false,
      reason: null,
    }))

    const formattedExtra = extraLectures.map((ex) => ({
      id: ex.id,
      subjectId: ex.subjectId,
      subjectName: ex.subject.name,
      subjectCode: ex.subject.code,
      subject: ex.subject.name,
      code: ex.subject.code,
      divisionId: ex.divisionId,
      divisionName: ex.division.name,
      facultyId: ex.facultyId,
      facultyName: ex.faculty.name,
      faculty: ex.faculty.name,
      dayOfWeek,
      startTime: ex.startTime,
      endTime: ex.endTime,
      roomNumber: ex.roomNumber,
      room: ex.roomNumber,
      topic: ex.reason || 'Extra Curriculum Session',
      isExtra: true,
      reason: ex.reason,
      status: ex.status,
    }))

    // Sort combined daily list chronologically by start time
    const merged = [...formattedBase, ...formattedExtra].sort((a, b) => {
      const minA = parseTimeToMinutes(a.startTime)
      const minB = parseTimeToMinutes(b.startTime)
      return minA - minB
    })

    const payload = {
      success: true,
      date: targetDateStr,
      day: dayOfWeek,
      dayOfWeek,
      schedule: merged,
      totalLectures: merged.length,
      regularCount: formattedBase.length,
      extraCount: formattedExtra.length,
    }

    scheduleCache.set(cacheKey, { payload, timestamp: Date.now() })

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error('Error fetching VoIP live schedule:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to load VoIP daily schedule' },
      { status: 500 }
    )
  }
}
