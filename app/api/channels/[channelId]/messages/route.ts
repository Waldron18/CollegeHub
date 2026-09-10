import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * Resolves channel by id, name, or slug
 */
async function resolveChannel(channelIdentifier: string) {
  const decoded = decodeURIComponent(channelIdentifier)
  const slugMapping: Record<string, string> = {
    'te-diva-os': 'channel-cs501',
    'te-diva-dbms': 'channel-cs502',
    'te-diva-cn': 'channel-cs503',
    'te-comp-div-a': 'channel-te-comp-div-a',
    'te-div-a': 'channel-te-comp-div-a',
    'channel-te-comp-div-a': 'channel-te-comp-div-a',
  }

  const mappedId = slugMapping[decoded.toLowerCase()] || decoded

  return await prisma.channel.findFirst({
    where: {
      OR: [
        { id: mappedId },
        { id: decoded },
        { name: decoded },
        { name: decoded.replace(/^#/, '') },
        { name: { contains: decoded.replace(/^(#|channel-)/, ''), mode: 'insensitive' } },
      ],
    },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view messages.' },
        { status: 401 }
      )
    }

    const { channelId } = await params
    const channel = await resolveChannel(channelId)

    if (!channel) {
      return NextResponse.json(
        { error: `Channel "${channelId}" not found.` },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { channelId: channel.id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            prnNumber: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        fileUrl: m.fileUrl,
        createdAt: m.createdAt.toISOString(),
        senderId: m.senderId,
        sender: {
          id: m.sender.id,
          name: m.sender.name,
          role: m.sender.role,
          email: m.sender.email,
          prnNumber: m.sender.prnNumber,
        },
      })),
    })
  } catch (error: any) {
    console.error('Error fetching channel messages:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching messages.' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to post messages.' },
        { status: 401 }
      )
    }

    const { channelId } = await params
    const channel = await resolveChannel(channelId)

    if (!channel) {
      return NextResponse.json(
        { error: `Channel "${channelId}" not found.` },
        { status: 404 }
      )
    }

    const body = await req.json()
    const content = (body.content || '').trim()

    if (!content && !body.fileUrl) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content: content || 'Attachment uploaded',
        fileUrl: body.fileUrl || null,
        channelId: channel.id,
        senderId: auth.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            prnNumber: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        fileUrl: message.fileUrl,
        createdAt: message.createdAt.toISOString(),
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          role: message.sender.role,
          email: message.sender.email,
          prnNumber: message.sender.prnNumber,
        },
      },
    })
  } catch (error: any) {
    console.error('Error creating channel message:', error)
    return NextResponse.json(
      { error: 'Internal server error while posting message.' },
      { status: 500 }
    )
  }
}
