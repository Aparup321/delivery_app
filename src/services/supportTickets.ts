import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { SupportTicket } from '../types/support'

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toTicket(data: unknown): SupportTicket | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const id = asText(record.id)
  const subject = asText(record.subject)
  const message = asText(record.message)
  const createdAt = asText(record.createdAt)

  if (!id || !subject || !message || !createdAt) {
    return null
  }

  return {
    id,
    subject,
    message,
    status: asText(record.status) === 'Resolved' ? 'Resolved' : 'Open',
    createdAt,
  }
}

/** Live ticket feed for the signed-in partner, newest first. */
export function subscribePartnerSupportTickets(
  uid: string,
  onUpdate: (tickets: SupportTicket[]) => void,
  onError: (error: Error) => void,
): () => void {
  const firestore = db
  if (!firestore) {
    return () => {}
  }

  const feed = query(
    collection(firestore, 'support_tickets'),
    where('partnerUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50),
  )

  return onSnapshot(
    feed,
    (snapshot) => {
      const tickets = snapshot.docs
        .map((item) => toTicket(item.data()))
        .filter((item): item is SupportTicket => item !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

      onUpdate(tickets)
    },
    (error) => onError(error),
  )
}

/** Publishes a partner support ticket for the operations console. */
export async function publishSupportTicket(uid: string, ticket: SupportTicket) {
  if (!db || !uid || uid.startsWith('demo:')) return
  await setDoc(doc(db, 'support_tickets', `${uid}_${ticket.id.replace(/[^a-zA-Z0-9_-]/g, '')}`), {
    partnerUid: uid,
    ...ticket,
    updatedAt: ticket.createdAt,
  })
}
