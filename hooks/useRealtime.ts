'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type { NotificationPayload, ChatMessagePayload } from '@/lib/eventBus'

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'

export interface RealtimeChatMessageEvent {
  channelId?: string
  receiverId?: string
  message: ChatMessagePayload
}

type NotificationHandler = (notification: NotificationPayload) => void
type ChatMessageHandler = (event: RealtimeChatMessageEvent) => void
type StatusHandler = (status: ConnectionStatus) => void

class RealtimeClient {
  private static instance: RealtimeClient | null = null
  private eventSource: EventSource | null = null
  private status: ConnectionStatus = 'DISCONNECTED'
  private retryCount = 0
  private retryTimeout: NodeJS.Timeout | null = null
  private heartbeatTimeout: NodeJS.Timeout | null = null

  private notificationHandlers = new Set<NotificationHandler>()
  private chatHandlers = new Set<ChatMessageHandler>()
  private statusHandlers = new Set<StatusHandler>()

  private constructor() {}

  public static getInstance(): RealtimeClient {
    if (!RealtimeClient.instance) {
      RealtimeClient.instance = new RealtimeClient()
    }
    return RealtimeClient.instance
  }

  public getStatus(): ConnectionStatus {
    return this.status
  }

  private setStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      this.status = status
      this.statusHandlers.forEach((handler) => {
        try {
          handler(status)
        } catch (e) {
          console.error('Error in status handler:', e)
        }
      })
    }
  }

  private connect() {
    if (typeof window === 'undefined') return
    if (this.eventSource) return

    this.setStatus('CONNECTING')

    try {
      this.eventSource = new EventSource('/api/realtime')

      this.eventSource.addEventListener('connected', () => {
        this.setStatus('CONNECTED')
        this.retryCount = 0
      })

      this.eventSource.addEventListener('notification', (event: MessageEvent) => {
        try {
          const data: NotificationPayload = JSON.parse(event.data)
          this.notificationHandlers.forEach((handler) => {
            try {
              handler(data)
            } catch (err) {
              console.error('Error executing notification handler:', err)
            }
          })
        } catch (err) {
          console.error('Error parsing notification event:', err)
        }
      })

      this.eventSource.addEventListener('chat_message', (event: MessageEvent) => {
        try {
          const data: RealtimeChatMessageEvent = JSON.parse(event.data)
          this.chatHandlers.forEach((handler) => {
            try {
              handler(data)
            } catch (err) {
              console.error('Error executing chat handler:', err)
            }
          })
        } catch (err) {
          console.error('Error parsing chat message event:', err)
        }
      })

      this.eventSource.onerror = () => {
        this.disconnect(true)
      }
    } catch (err) {
      console.error('Failed to initialize EventSource:', err)
      this.disconnect(true)
    }
  }

  private disconnect(retry = false) {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.setStatus('DISCONNECTED')

    if (retry && (this.notificationHandlers.size > 0 || this.chatHandlers.size > 0)) {
      if (this.retryTimeout) clearTimeout(this.retryTimeout)
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 16000)
      this.retryCount++
      this.retryTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    }
  }

  public subscribeStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    handler(this.status)
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  public subscribeNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler)
    if (!this.eventSource) {
      this.connect()
    }
    return () => {
      this.notificationHandlers.delete(handler)
      if (this.notificationHandlers.size === 0 && this.chatHandlers.size === 0) {
        this.disconnect(false)
      }
    }
  }

  public subscribeChat(handler: ChatMessageHandler): () => void {
    this.chatHandlers.add(handler)
    if (!this.eventSource) {
      this.connect()
    }
    return () => {
      this.chatHandlers.delete(handler)
      if (this.notificationHandlers.size === 0 && this.chatHandlers.size === 0) {
        this.disconnect(false)
      }
    }
  }
}

/**
 * Hook to track overall SSE connection status
 */
export function useRealtimeConnection(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED')

  useEffect(() => {
    const client = RealtimeClient.getInstance()
    return client.subscribeStatus(setStatus)
  }, [])

  return status
}

/**
 * Hook to listen for real-time notification alerts
 */
export function useRealtimeNotification(onNotification: (notification: NotificationPayload) => void) {
  const handlerRef = useRef(onNotification)
  handlerRef.current = onNotification

  useEffect(() => {
    const client = RealtimeClient.getInstance()
    const unsubscribe = client.subscribeNotification((data) => {
      handlerRef.current?.(data)
    })
    return unsubscribe
  }, [])
}

/**
 * Hook to listen for incoming real-time chat messages
 */
export function useRealtimeChat(options: {
  channelId?: string
  contactId?: string
  onMessage: (event: RealtimeChatMessageEvent) => void
}) {
  const { channelId, contactId, onMessage } = options
  const handlerRef = useRef(onMessage)
  handlerRef.current = onMessage

  const filterRef = useRef({ channelId, contactId })
  filterRef.current = { channelId, contactId }

  useEffect(() => {
    const client = RealtimeClient.getInstance()
    const unsubscribe = client.subscribeChat((event) => {
      const currentFilter = filterRef.current

      // Channel matching: match by channelId or slug
      if (currentFilter.channelId && event.channelId) {
        if (
          event.channelId === currentFilter.channelId ||
          currentFilter.channelId.includes(event.channelId) ||
          event.channelId.includes(currentFilter.channelId)
        ) {
          handlerRef.current?.(event)
          return
        }
      }

      // Direct message matching: match by receiverId or senderId
      if (currentFilter.contactId && !event.channelId) {
        if (
          event.receiverId === currentFilter.contactId ||
          event.message.senderId === currentFilter.contactId
        ) {
          handlerRef.current?.(event)
          return
        }
      }
    })

    return unsubscribe
  }, [channelId, contactId])
}
