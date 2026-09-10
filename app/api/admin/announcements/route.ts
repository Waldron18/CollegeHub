import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrative privileges required.' },
        { status: 403 }
      )
    }

    // Fetch messages in college and dept announcement channels
    const messages = await prisma.message.findMany({
      where: {
        channel: {
          type: {
            in: ['COLLEGE_ANNOUNCEMENT', 'DEPT_ANNOUNCEMENT'],
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      announcements: messages.map((m) => {
        let title = 'Campus Notice'
        let text = m.content
        if (m.content.startsWith('[')) {
          const closeIdx = m.content.indexOf(']')
          if (closeIdx !== -1) {
            title = m.content.slice(1, closeIdx)
            text = m.content.slice(closeIdx + 1).trim()
          }
        }

        return {
          id: m.id,
          title,
          content: text,
          channelName: m.channel?.name || 'General',
          channelType: m.channel?.type || 'COLLEGE_ANNOUNCEMENT',
          senderName: m.sender.name,
          senderRole: m.sender.role,
          createdAt: m.createdAt.toISOString(),
        }
      }),
    })
  } catch (error: any) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Internal server error fetching announcements.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser()

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrative privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, isPinned, departmentId } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required for broadcast.' },
        { status: 400 }
      )
    }

    // Find target channel: college announcements or department channel
    let targetChannel = await prisma.channel.findFirst({
      where: {
        type: 'COLLEGE_ANNOUNCEMENT',
      },
    })

    if (!targetChannel) {
      // Fallback to any channel in first community
      targetChannel = await prisma.channel.findFirst()
    }

    if (!targetChannel) {
      return NextResponse.json(
        { error: 'No broadcast channel available in system.' },
        { status: 404 }
      )
    }

    const formattedContent = `[${title.trim()}] ${content.trim()}${
      isPinned ? ' 📌 [PINNED NOTICE]' : ''
    }`

    const message = await prisma.message.create({
      data: {
        content: formattedContent,
        channelId: targetChannel.id,
        senderId: auth.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'College circular published and broadcasted successfully.',
      announcement: {
        id: message.id,
        title: title.trim(),
        content: content.trim(),
        isPinned: !!isPinned,
        channelName: message.channel?.name || 'General',
        publisher: message.sender.name,
        createdAt: message.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error broadcasting announcement:', error)
    return NextResponse.json(
      { error: 'Internal server error publishing circular.' },
      { status: 500 }
    )
  }
}
