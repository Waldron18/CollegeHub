import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to join live lectures.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const roomName = searchParams.get('room') || 'lecture-cs501'

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://collegehub-livekit.example.com'

    let token: string
    let isMock = false

    if (apiKey && apiSecret) {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: auth.prnNumber || auth.email || auth.name,
        name: auth.name,
        metadata: JSON.stringify({
          role: auth.role,
          prn: auth.prnNumber,
          email: auth.email,
        }),
      })

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      })

      token = await at.toJwt()
    } else {
      // Graceful fallback token for development without active LiveKit cloud project
      isMock = true
      const payload = {
        identity: auth.name,
        room: roomName,
        role: auth.role,
        prn: auth.prnNumber,
        timestamp: Date.now(),
      }
      token = `mock_livekit_${Buffer.from(JSON.stringify(payload)).toString('base64')}`
    }

    return NextResponse.json({
      success: true,
      token,
      room: roomName,
      wsUrl,
      identity: auth.name,
      role: auth.role,
      isMock,
    })
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error)
    return NextResponse.json(
      { error: 'Internal server error while generating room token.' },
      { status: 500 }
    )
  }
}
