import { EventEmitter } from 'events'

export interface NotificationPayload {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

export interface ChatMessagePayload {
  id: string
  content: string
  fileUrl?: string | null
  senderId: string
  senderName: string
  createdAt: string
  channelId?: string
}

export interface NotificationEventData {
  userId: string
  notification: NotificationPayload
}

export interface ChatMessageEventData {
  channelId?: string
  receiverId?: string
  message: ChatMessagePayload
}

export type EventBusMap = {
  NOTIFICATION: [NotificationEventData]
  CHAT_MESSAGE: [ChatMessageEventData]
}

// Ensure singleton EventEmitter across Next.js module reloads in dev
const globalForEvents = globalThis as unknown as {
  eventBus?: EventEmitter
}

export const eventBus: EventEmitter = globalForEvents.eventBus ?? new EventEmitter()

// Increase max listeners for multiple client connections
eventBus.setMaxListeners(200)

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventBus = eventBus
}

/**
 * Publish a real-time notification to a specific user
 */
export function publishNotification(userId: string, notification: NotificationPayload): void {
  eventBus.emit('NOTIFICATION', {
    userId,
    notification,
  })
}

/**
 * Publish a real-time chat message to a channel or direct recipient
 */
export function publishChatMessage(payload: {
  channelId?: string
  receiverId?: string
  message: ChatMessagePayload
}): void {
  eventBus.emit('CHAT_MESSAGE', payload)
}
