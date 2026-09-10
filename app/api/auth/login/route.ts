import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const identifier = (body.email || body.uid || '').trim()
    const password = (body.password || '').trim()

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/PRN and password are required' },
        { status: 400 }
      )
    }

    // Lookup user by email or PRN number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { prnNumber: identifier },
        ],
      },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email/PRN or password' },
        { status: 401 }
      )
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email/PRN or password' },
        { status: 401 }
      )
    }

    // Sign JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      prnNumber: user.prnNumber,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        prnNumber: user.prnNumber,
      },
    })

    // Attach HTTP-only cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    )
  }
}
