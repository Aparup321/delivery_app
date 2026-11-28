import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import type {
  WithdrawalRequest,
  WithdrawalStatus,
} from '../types/withdrawal'

const COLLECTION = 'payments'
const MAX_WITHDRAWALS = 20
const LAST_UPI_KEY = 'fafo.partner.upi'
const DEMO_KEY = 'fafo.partner.withdrawals'

const statuses: WithdrawalStatus[] = [
  'requested',
  'processing',
  'paid',
  'rejected',
]

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asStatus(value: unknown): WithdrawalStatus {
  return typeof value === 'string' &&
    statuses.includes(value as WithdrawalStatus)
    ? (value as WithdrawalStatus)
    : 'requested'
}

function toWithdrawal(data: unknown): WithdrawalRequest | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const id = asText(record.requestId)
  const amount = typeof record.amount === 'number' ? record.amount : NaN
  const upiId = asText(record.upiId)
  const requestedAt = asText(record.requestedAt)

  if (!id || !Number.isFinite(amount) || amount <= 0 || !requestedAt) {
    return null
  }

  return {
    id,
    amount,
    upiId,
    status: asStatus(record.status),
    requestedAt,
    updatedAt: asText(record.updatedAt) || requestedAt,
  }
}

/** Firestore document id for a request; stable and URL-safe. */
function documentId(uid: string, requestId: string): string {
  return `${uid}_${requestId}`.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function storageKey(uid: string): string {
  return `${DEMO_KEY}.${uid}`
}

function readDemoWithdrawals(uid: string): WithdrawalRequest[] {
  try {
    const raw = window.localStorage.getItem(storageKey(uid))

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is WithdrawalRequest =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as WithdrawalRequest).id === 'string' &&
            typeof (item as WithdrawalRequest).amount === 'number' &&
            typeof (item as WithdrawalRequest).requestedAt === 'string',
        )
      : []
  } catch {
    return []
  }
}

function writeDemoWithdrawal(
  uid: string,
  withdrawal: WithdrawalRequest,
): void {
  const next = [withdrawal, ...readDemoWithdrawals(uid)].slice(
    0,
    MAX_WITHDRAWALS,
  )

  try {
    window.localStorage.setItem(storageKey(uid), JSON.stringify(next))
  } catch {
    // The in-memory list still shows the request for this session.
  }
}

/** Remembers the last UPI id so the next withdrawal can prefill it (editable). */
export function readLastUpiId(uid: string): string {
  try {
    return window.localStorage.getItem(`${LAST_UPI_KEY}.${uid}`) ?? ''
  } catch {
    return ''
  }
}

export function rememberUpiId(uid: string, upiId: string): void {
  try {
    window.localStorage.setItem(`${LAST_UPI_KEY}.${uid}`, upiId)
  } catch {
    // Preference only.
  }
}

/**
 * Live withdrawal history for the signed-in partner. The hook only subscribes
 * for live sessions; demo sessions read their local list in `loadDemoWithdrawals`.
 */
export function subscribePartnerWithdrawals(
  uid: string,
  onUpdate: (withdrawals: WithdrawalRequest[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!db) {
    onUpdate([])
    return () => {}
  }

  const feed = query(
    collection(db, COLLECTION),
    where('partnerUid', '==', uid),
    orderBy('requestedAt', 'desc'),
    limit(MAX_WITHDRAWALS),
  )

  return onSnapshot(
    feed,
    (snapshot) => {
      onUpdate(
        snapshot.docs
          .map((item) => toWithdrawal(item.data()))
          .filter((item): item is WithdrawalRequest => item !== null),
      )
    },
    (error) => onError(error),
  )
}

function newRequestId(): string {
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `#WD-${Date.now().toString(36).toUpperCase()}${suffix}`
}

/**
 * Creates the payout request and, in the same atomic write, a high-priority
 * operations ticket so the administrator console sees it without extra wiring.
 */
export async function requestWithdrawal(
  uid: string,
  {
    amount,
    upiId,
    isLive,
  }: {
    amount: number
    upiId: string
    isLive: boolean
  },
): Promise<WithdrawalRequest> {
  const request: WithdrawalRequest = {
    id: newRequestId(),
    amount,
    upiId,
    status: 'requested',
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (!isLive || !db) {
    writeDemoWithdrawal(uid, request)
    rememberUpiId(uid, upiId)
    return request
  }

  const batch = writeBatch(db)
  batch.set(doc(db, COLLECTION, documentId(uid, request.id)), {
    partnerUid: uid,
    requestId: request.id,
    amount: request.amount,
    upiId: request.upiId,
    status: request.status,
    requestedAt: request.requestedAt,
    updatedAt: request.updatedAt,
  })
  batch.set(
    doc(db, 'support_tickets', documentId(uid, request.id)),
    {
      partnerUid: uid,
      id: request.id,
      subject: `High priority · Withdrawal request ${request.id}`,
      message:
        `Withdrawal requested for ${request.id}. ` +
        `Amount ₹${request.amount}. UPI ${request.upiId}. ` +
        'Credit is expected within 24 hours.',
      status: 'Open',
      priority: 'High',
      createdAt: request.requestedAt,
      updatedAt: request.updatedAt,
    },
  )

  await batch.commit()
  rememberUpiId(uid, upiId)
  return request
}

/** Reads the locally persisted demo list (used by the hook's initial state). */
export function loadDemoWithdrawals(uid: string): WithdrawalRequest[] {
  return readDemoWithdrawals(uid)
}
