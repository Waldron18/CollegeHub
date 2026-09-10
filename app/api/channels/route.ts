import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view channels.' },
        { status: 401 }
      )
    }

    const channels = await prisma.channel.findMany({
      include: {
        _count: {
          select: { messages: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      channels: channels.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        messageCount: c._count.messages,
        lastMessage: c.messages[0] || null,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching channels.' },
      { status: 500 }
    )
  }
}
