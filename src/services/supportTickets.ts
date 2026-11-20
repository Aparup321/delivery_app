import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { SupportTicket } from '../types/support'

/** Publishes a partner support ticket for the operations console. */
export async function publishSupportTicket(uid: string, ticket: SupportTicket) {
  if (!db || !uid || uid.startsWith('demo:')) return
  await setDoc(doc(db, 'support_tickets', `${uid}_${ticket.id.replace(/[^a-zA-Z0-9_-]/g, '')}`), {
    partnerUid: uid,
    ...ticket,
    updatedAt: ticket.createdAt,
  })
}
