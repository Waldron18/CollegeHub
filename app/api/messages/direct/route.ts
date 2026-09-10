import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const recipientId = searchParams.get('recipientId')

    // If recipientId provided, get message thread with this specific user
    if (recipientId) {
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          prnNumber: true,
        },
      })

      if (!recipient) {
        return NextResponse.json(
          { error: 'Recipient user not found.' },
          { status: 404 }
        )
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: auth.id, directRecipientId: recipientId },
            { senderId: recipientId, directRecipientId: auth.id },
          ],
        },
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
        recipient,
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          fileUrl: m.fileUrl,
          createdAt: m.createdAt.toISOString(),
          senderId: m.senderId,
          sender: m.sender,
        })),
      })
    }

    // If user is FACULTY, return student contacts; if STUDENT, return faculty contacts
    const targetUsers =
      auth.role === 'FACULTY'
        ? await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              prnNumber: true,
            },
          })
        : await prisma.user.findMany({
            where: { role: 'FACULTY' },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              prnNumber: true,
            },
          })

    // Fetch the latest message for each contact
    const contacts = await Promise.all(
      targetUsers.map(async (contactUser) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: auth.id, directRecipientId: contactUser.id },
              { senderId: contactUser.id, directRecipientId: auth.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            fileUrl: true,
            createdAt: true,
            senderId: true,
          },
        })

        return {
          id: contactUser.id,
          name: contactUser.name,
          email: contactUser.email,
          role: contactUser.role,
          prnNumber: contactUser.prnNumber,
          online: true,
          lastMessage: lastMessage
            ? {
                ...lastMessage,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
        }
      })
    )

    // Sort contacts: those with recent messages first
    contacts.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
      return timeB - timeA
    })

    return NextResponse.json({
      success: true,
      contacts,
    })
  } catch (error: any) {
    console.error('Error in direct messages GET:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching direct messages.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { recipientId, content, fileUrl } = body

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required.' },
        { status: 400 }
      )
    }

    const textContent = (content || '').trim()
    if (!textContent && !fileUrl) {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content: textContent || 'Attachment sent',
        fileUrl: fileUrl || null,
        senderId: auth.id,
        directRecipientId: recipientId,
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
        sender: message.sender,
      },
    })
  } catch (error: any) {
    console.error('Error in direct messages POST:', error)
    return NextResponse.json(
      { error: 'Internal server error while sending direct message.' },
      { status: 500 }
    )
  }
}
