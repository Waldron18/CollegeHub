import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import { eventBus, NotificationEventData, ChatMessageEventData } from '@/lib/eventBus'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  let auth = await getAuthUser()

  if (!auth) {
    const tokenFromQuery = req.nextUrl.searchParams.get('token')
    const tokenFromCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value
    const tokenFromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const token = tokenFromQuery || tokenFromCookie || tokenFromHeader

    if (token) {
      auth = await verifyToken(token)
    }
  }

  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized. Valid session token required for real-time stream.' },
      { status: 401 }
    )
  }

  const userId = auth.id
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      const initialPayload = JSON.stringify({
        type: 'CONNECTED',
        userId,
        timestamp: new Date().toISOString(),
      })
      controller.enqueue(encoder.encode(`event: connected\ndata: ${initialPayload}\n\n`))

      // Notification listener
      const onNotification = (data: NotificationEventData) => {
        if (data.userId === userId) {
          try {
            const payload = JSON.stringify(data.notification)
            controller.enqueue(encoder.encode(`event: notification\ndata: ${payload}\n\n`))
          } catch (err) {
            console.error('Error streaming notification:', err)
          }
        }
      }

      // Chat message listener
      const onChatMessage = (data: ChatMessageEventData) => {
        const isTarget =
          Boolean(data.channelId) ||
          data.receiverId === userId ||
          data.message.senderId === userId

        if (isTarget) {
          try {
            const payload = JSON.stringify({
              channelId: data.channelId,
              receiverId: data.receiverId,
              message: data.message,
            })
            controller.enqueue(encoder.encode(`event: chat_message\ndata: ${payload}\n\n`))
          } catch (err) {
            console.error('Error streaming chat message:', err)
          }
        }
      }

      eventBus.on('NOTIFICATION', onNotification)
      eventBus.on('CHAT_MESSAGE', onChatMessage)

      // Periodic heartbeat every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeatInterval)
        }
      }, 25000)

      // Cleanup on abort
      const cleanup = () => {
        clearInterval(heartbeatInterval)
        eventBus.off('NOTIFICATION', onNotification)
        eventBus.off('CHAT_MESSAGE', onChatMessage)
        try {
          controller.close()
        } catch {}
      }

      req.signal.addEventListener('abort', cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
