import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { DeliveryMessage, MessageSender } from '../types/message'

const COLLECTION = 'messages'
const MAX_MESSAGES = 100
const DEMO_KEY = 'fafo.partner.messages'
const MAX_TEXT = 1000

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asSender(value: unknown): MessageSender {
  return value === 'customer' ? 'customer' : 'partner'
}

function toMessage(id: string, data: unknown): DeliveryMessage | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const text = asText(record.text)
  const createdAt = asText(record.createdAt)

  if (!text || !createdAt) {
    return null
  }

  return {
    id,
    sender: asSender(record.sender),
    senderUid: asText(record.senderUid),
    text,
    createdAt,
  }
}

/** Demo sessions keep their thread locally so the chat still works offline. */
function demoKey(deliveryId: string): string {
  return `${DEMO_KEY}.${deliveryId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

function readDemoMessages(deliveryId: string): DeliveryMessage[] {
  try {
    const raw = window.localStorage.getItem(demoKey(deliveryId))
    const parsed: unknown = raw ? JSON.parse(raw) : []

    return Array.isArray(parsed)
      ? parsed
          .map((item) => toMessage(asText((item as { id?: unknown }).id), item))
          .filter((item): item is DeliveryMessage => item !== null)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      : []
  } catch {
    return []
  }
}

function writeDemoMessage(
  deliveryId: string,
  message: DeliveryMessage,
): DeliveryMessage[] {
  const next = [...readDemoMessages(deliveryId), message].slice(
    -MAX_MESSAGES,
  )

  try {
    window.localStorage.setItem(demoKey(deliveryId), JSON.stringify(next))
  } catch {
    // The in-memory thread still shows the message for this session.
  }

  return next
}

/**
 * Live thread for one delivery. The same subcollection is written by the
 * customer apps (`sender: 'customer'`) and read by operations.
 */
export function subscribeDeliveryMessages(
  deliveryId: string,
  isLive: boolean,
  onUpdate: (messages: DeliveryMessage[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!isLive || !db) {
    onUpdate(readDemoMessages(deliveryId))
    return () => {}
  }

  const feed = query(
    collection(db, 'deliveries', deliveryId, COLLECTION),
    orderBy('createdAt', 'asc'),
    limit(MAX_MESSAGES),
  )

  return onSnapshot(
    feed,
    (snapshot) => {
      onUpdate(
        snapshot.docs
          .map((item) => toMessage(item.id, item.data()))
          .filter((item): item is DeliveryMessage => item !== null),
      )
    },
    (error) => onError(error),
  )
}

export async function sendDeliveryMessage({
  deliveryId,
  uid,
  text,
  isLive,
}: {
  deliveryId: string
  uid: string
  text: string
  isLive: boolean
}): Promise<DeliveryMessage> {
  const trimmed = text.trim()

  if (!trimmed) {
    throw new Error('Message is empty.')
  }

  if (trimmed.length > MAX_TEXT) {
    throw new Error('Message is too long.')
  }

  const message: DeliveryMessage = {
    id: `demo-${Date.now().toString(36)}`,
    sender: 'partner',
    senderUid: uid,
    text: trimmed,
    createdAt: new Date().toISOString(),
  }

  if (!isLive || !db) {
    writeDemoMessage(deliveryId, message)
    return message
  }

  const reference = await addDoc(
    collection(db, 'deliveries', deliveryId, COLLECTION),
    {
      sender: message.sender,
      senderUid: message.senderUid,
      text: message.text,
      createdAt: message.createdAt,
    },
  )

  return { ...message, id: reference.id }
}

export { MAX_TEXT as MAX_MESSAGE_LENGTH }
