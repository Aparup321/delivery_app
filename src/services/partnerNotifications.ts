import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { AppNotification } from '../types/notification'

const COLLECTION = 'notifications'
const MAX_NOTIFICATIONS = 50

function documentId(uid: string, notificationId: string): string {
  return `${uid}_${notificationId}`.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asVars(value: unknown): Record<string, string | number> | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const vars: Record<string, string | number> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' || typeof item === 'number') {
      vars[key] = item
    }
  }
  return Object.keys(vars).length > 0 ? vars : undefined
}

function toNotification(data: unknown): AppNotification | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const notificationId = asText(record.notificationId)
  const title = asText(record.title)
  const body = asText(record.body)
  const type = asText(record.type)
  const at = asText(record.createdAt)
  const readAt = asText(record.readAt)

  if (!notificationId || !title || !body || !at) {
    return null
  }

  if (
    type !== 'request' &&
    type !== 'account' &&
    type !== 'delivery' &&
    type !== 'payment'
  ) {
    return null
  }

  return {
    id: notificationId,
    type,
    title,
    body,
    vars: asVars(record.vars),
    at,
    isRead: Boolean(readAt),
  }
}

/** Live text-only notification feed for the signed-in partner. */
export function subscribePartnerNotifications(
  uid: string,
  onUpdate: (notifications: AppNotification[]) => void,
  onError: (error: Error) => void,
): () => void {
  const firestore = db
  if (!firestore) {
    return () => {}
  }

  const feed = query(
    collection(firestore, COLLECTION),
    where('partnerUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(MAX_NOTIFICATIONS),
  )

  return onSnapshot(
    feed,
    (snapshot) => {
      const notifications = snapshot.docs
        .map((item) => toNotification(item.data()))
        .filter((item): item is AppNotification => item !== null)
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, MAX_NOTIFICATIONS)

      onUpdate(notifications)
    },
    (error) => onError(error),
  )
}

/** Writes one generated event; reusing the same notification id is idempotent. */
export async function persistPartnerNotification(
  uid: string,
  notification: AppNotification,
): Promise<void> {
  if (!db) {
    return
  }

  const now = new Date().toISOString()
  await setDoc(doc(db, COLLECTION, documentId(uid, notification.id)), {
    partnerUid: uid,
    notificationId: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    vars: notification.vars ?? {},
    createdAt: notification.at,
    readAt: notification.isRead ? notification.at : null,
    updatedAt: now,
  })
}

/** Marks one stored notification as read. Missing documents are ignored. */
export async function markPartnerNotificationRead(
  uid: string,
  notificationId: string,
): Promise<void> {
  if (!db) {
    return
  }

  try {
    await updateDoc(doc(db, COLLECTION, documentId(uid, notificationId)), {
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch {
    // The notification may have been pruned; the local read state still holds.
  }
}

/** Marks every stored notification for the partner as read. */
export async function markAllPartnerNotificationsRead(
  uid: string,
): Promise<void> {
  if (!db) {
    return
  }

  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where('partnerUid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(MAX_NOTIFICATIONS),
      ),
    )
    const batch = writeBatch(db)
    const now = new Date().toISOString()

    for (const item of snapshot.docs) {
      if (!asText(item.data().readAt)) {
        batch.update(item.ref, { readAt: now, updatedAt: now })
      }
    }

    await batch.commit()
  } catch {
    // Best-effort; the local list is already marked read.
  }
}
