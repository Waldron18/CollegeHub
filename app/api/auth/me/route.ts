import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()

    if (!auth || !auth.id) {
      const response = NextResponse.json(
        { user: null, error: 'Session expired or invalid' },
        { status: 401 }
      )
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
      })
      return response
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        name: true,
        email: true,
        prnNumber: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
            semester: true,
          },
        },
      },
    })

    if (!user) {
      console.warn(`[Auth API] User ID "${auth.id}" not found in database. Invaliding session.`)
      const response = NextResponse.json(
        { user: null, error: 'Session expired or invalid' },
        { status: 401 }
      )
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
      })
      return response
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error('Session verification failed:', error)
    const response = NextResponse.json(
      { user: null, error: 'Session expired or invalid' },
      { status: 401 }
    )
    try {
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
      })
    } catch {
      // ignore cookie clearing error if headers already written
    }
    return response
  }
}
