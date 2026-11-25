import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import {
  adminDeliveryStatus,
  deliveryDocumentId,
  type PartnerLocation,
} from './deliverySync'
import type {
  Delivery,
  DeliveryCategory,
  DeliveryCompletionProof,
  DeliveryEvent,
  DeliveryLocation,
  DeliveryProof,
  DeliveryStatus,
} from '../types/delivery'
import { nextDeliveryStatus } from '../utils/delivery'
import {
  demoDeliveryOtp,
  demoDeliveryOtpEnabled,
} from '../config/demoDelivery'

/** Stable codes the UI can turn into an actionable message. */
export type DeliveryActionCode =
  | 'firebase/not-connected'
  | 'delivery/not-found'
  | 'delivery/not-assigned'
  | 'delivery/expired'
  | 'delivery/unavailable'
  | 'delivery/invalid-transition'
  | 'delivery/no-otp'
  | 'firestore/permission-denied'
  | 'firestore/unavailable'

export class DeliveryActionError extends Error {
  readonly code: DeliveryActionCode | string

  constructor(code: DeliveryActionCode | string, message: string) {
    super(message)
    this.name = 'DeliveryActionError'
    this.code = code
  }
}

function requireDb() {
  if (!db) {
    throw new DeliveryActionError(
      'firebase/not-connected',
      'Firebase is not connected. Reconnect from the banner, then try again.',
    )
  }

  return db
}

function firestoreError(error: unknown): DeliveryActionError {
  if (error instanceof DeliveryActionError) {
    return error
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'unknown'

  if (code === 'permission-denied') {
    return new DeliveryActionError(
      'firestore/permission-denied',
      'Firestore blocked this delivery update. Deploy the Firestore rules, then try again.',
    )
  }

  return new DeliveryActionError(
    'firestore/unavailable',
    'This delivery could not be updated. Check your connection and try again.',
  )
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const DELIVERY_STATUSES: DeliveryStatus[] = [
  'assigned',
  'accepted',
  'pickup_arrived',
  'picked_up',
  'in_transit',
  'drop_arrived',
  'delivered',
  'cancelled',
]

function asStatus(value: unknown): DeliveryStatus | null {
  const status = asText(value)
  return DELIVERY_STATUSES.includes(status as DeliveryStatus)
    ? (status as DeliveryStatus)
    : null
}

function asCategory(value: unknown): DeliveryCategory {
  return asText(value) === 'Restaurant' ? 'Restaurant' : 'Grocery'
}

function asPaymentMode(value: unknown): Delivery['paymentMode'] {
  const mode = asText(value).toLowerCase()
  return mode.includes('cash') ? 'Cash on delivery' : 'Prepaid'
}

function asStop(value: unknown): Delivery['pickup'] | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const record = value as Record<string, unknown>
  const name = asText(record.name)
  const address = asText(record.address)
  const latitude = asNumber(record.latitude, Number.NaN)
  const longitude = asNumber(record.longitude, Number.NaN)

  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return { name, address, latitude, longitude }
}

function asEvents(value: unknown): DeliveryEvent[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) {
      return []
    }

    const record = item as Record<string, unknown>
    const status = asStatus(record.status)
    const at = asText(record.at)
    return status && at ? [{ status, at }] : []
  })
}

function asLocation(value: unknown): DeliveryLocation | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const record = value as Record<string, unknown>
  const latitude = asNumber(record.latitude, Number.NaN)
  const longitude = asNumber(record.longitude, Number.NaN)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
    accuracy: typeof record.accuracy === 'number' ? record.accuracy : null,
    updatedAt: asText(record.updatedAt) || new Date().toISOString(),
  }
}

/**
 * Turns one `deliveries/{id}` document into the partner-app Delivery model.
 * Returns null for records that lack the shared-contract essentials, so a
 * malformed document can never reach the request or active-delivery UI.
 */
export function toDelivery(docId: string, data: unknown): Delivery | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const status = asStatus(record.status)

  if (!status) {
    return null
  }

  const pickup = asStop(record.pickup)
  const destination = asStop(record.destination)

  if (!pickup || !destination) {
    return null
  }

  const displayId = asText(record.displayId)
  const expiresAt = asText(record.expiresAt) || undefined
  const proofRecord =
    typeof record.proof === 'object' && record.proof !== null
      ? (record.proof as Record<string, unknown>)
      : null
  const proof: DeliveryProof | undefined =
    proofRecord && asText(proofRecord.verifiedAt)
      ? { method: 'otp', verifiedAt: asText(proofRecord.verifiedAt) }
      : undefined
  const responseRecord =
    typeof record.partnerResponse === 'object' && record.partnerResponse !== null
      ? (record.partnerResponse as Record<string, unknown>)
      : null
  const partnerResponse =
    responseRecord && asText(responseRecord.decision) === 'rejected'
      ? {
        decision: 'rejected' as const,
        at: asText(responseRecord.at) || new Date().toISOString(),
        reason: asText(responseRecord.reason) || undefined,
      }
      : undefined
  const customerPhone = asText(record.customerPhone)
  const customerPhoneMasked = asText(record.customerPhoneMasked)

  return {
    id: displayId || `#${docId}`,
    documentId: docId,
    category: asCategory(record.category),
    pickup,
    destination,
    distanceKm: asNumber(record.distanceKm),
    etaMinutes: Math.round(asNumber(record.etaMinutes)),
    earnings: asNumber(record.earnings),
    itemCount: Math.max(0, Math.round(asNumber(record.itemCount))),
    paymentMode: asPaymentMode(record.paymentMode),
    orderValue:
      typeof record.orderValue === 'number' ? record.orderValue : undefined,
    collectAmount:
      typeof record.collectAmount === 'number'
        ? record.collectAmount
        : undefined,
    customerName: asText(record.customerName) || 'Customer',
    customerPhone: customerPhone || customerPhoneMasked || '',
    note: asText(record.note) || undefined,
    requestedAt: asText(record.requestedAt) || new Date().toISOString(),
    expiresAt,
    expiresInSeconds: expiresAt
      ? Math.max(
        0,
        Math.round(
          (new Date(expiresAt).getTime() - Date.now()) / 1000,
        ),
      )
      : undefined,
    dropOtp: asText(record.dropOtp) || undefined,
    partnerResponse,
    isLive: true,
    acceptedAt: asText(record.acceptedAt) || undefined,
    completedAt: asText(record.completedAt) || undefined,
    status,
    events: asEvents(record.events),
    proof,
    cancellationReason: asText(record.cancellationReason) || undefined,
  }
}

export interface LiveDeliverySnapshot {
  deliveries: Delivery[]
  locations: Record<string, DeliveryLocation | null>
}

/** Current partner position stored on each delivery document. */
function readLocations(
  docs: Array<{ id: string; data: unknown }>,
): Record<string, DeliveryLocation | null> {
  const locations: Record<string, DeliveryLocation | null> = {}

  for (const item of docs) {
    if (typeof item.data !== 'object' || item.data === null) {
      continue
    }

    locations[item.id] = asLocation(
      (item.data as Record<string, unknown>).currentLocation,
    )
  }

  return locations
}

/**
 * Live subscription to every delivery assigned to the signed-in partner.
 * Firestore rules restrict the query to documents whose `partnerUid` matches
 * the authenticated UID, so no other partner's records can arrive here.
 */
export function subscribePartnerDeliveries(
  uid: string,
  onUpdate: (snapshot: LiveDeliverySnapshot) => void,
  onError: (error: DeliveryActionError) => void,
): () => void {
  if (!db) {
    onError(
      new DeliveryActionError(
        'firebase/not-connected',
        'Firebase is not connected. Reconnect from the banner, then try again.',
      ),
    )
    return () => {}
  }

  const firestore = db
  const constraints = [where('partnerUid', '==', uid)]

  return onSnapshot(
    query(collection(firestore, 'deliveries'), ...constraints),
    (snapshot) => {
      const docs = snapshot.docs.map((item) => ({
        id: item.id,
        data: item.data(),
      }))
      const deliveries = docs
        .map((item) => toDelivery(item.id, item.data))
        .filter((item): item is Delivery => item !== null)

      onUpdate({ deliveries, locations: readLocations(docs) })
    },
    (error) => {
      onError(firestoreError(error))
    },
  )
}

function deliveryRef(delivery: Delivery) {
  const firestore = requireDb()
  // Prefer the real document id. The display id can differ for orders created
  // by another system, and writing by display id would update the wrong doc.
  return doc(firestore, 'deliveries', delivery.documentId ?? deliveryDocumentId(delivery.id))
}

function assertAssigned(
  data: Record<string, unknown>,
  uid: string,
  now: string,
) {
  const partnerUid = asText(data.partnerUid)

  if (partnerUid !== uid) {
    throw new DeliveryActionError(
      'delivery/not-assigned',
      'This delivery is no longer offered to you. The list will refresh in a moment.',
    )
  }

  if (asStatus(data.status) !== 'assigned') {
    throw new DeliveryActionError(
      'delivery/unavailable',
      'This delivery is no longer waiting for your response.',
    )
  }

  const expiresAt = asText(data.expiresAt)

  if (expiresAt && new Date(expiresAt).getTime() <= new Date(now).getTime()) {
    throw new DeliveryActionError(
      'delivery/expired',
      'This request expired before it could be accepted.',
    )
  }
}

/**
 * Accepts an assigned request inside a Firestore transaction. The transaction
 * re-reads the document, so two devices racing on the same offer cannot both
 * flip it; the Security Rules independently reject any write that changes the
 * status from anything other than `assigned`.
 */
export async function acceptAssignedDelivery(
  uid: string,
  delivery: Delivery,
): Promise<void> {
  try {
    const firestore = requireDb()
    const ref = deliveryRef(delivery)
    const now = new Date().toISOString()

    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(ref)
      const data = snapshot.data() as Record<string, unknown> | undefined

      if (!snapshot.exists() || !data) {
        throw new DeliveryActionError(
          'delivery/not-found',
          'This delivery is no longer available.',
        )
      }

      // A retry after a successful accept is an idempotent no-op.
      if (asStatus(data.status) === 'accepted') {
        return
      }

      assertAssigned(data, uid, now)

      transaction.update(ref, {
        status: 'accepted',
        adminStatus: adminDeliveryStatus('accepted'),
        acceptedAt: now,
        events: [...asEvents(data.events), { status: 'accepted', at: now }],
        updatedAt: now,
      })
    })
  } catch (error) {
    throw firestoreError(error)
  }
}

/** Records the partner's decline on the shared document for delivery_admin. */
export async function rejectAssignedDelivery(
  uid: string,
  delivery: Delivery,
  reason = '',
): Promise<void> {
  try {
    const firestore = requireDb()
    const ref = deliveryRef(delivery)
    const now = new Date().toISOString()

    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(ref)
      const data = snapshot.data() as Record<string, unknown> | undefined

      if (!snapshot.exists() || !data) {
        throw new DeliveryActionError(
          'delivery/not-found',
          'This delivery is no longer available.',
        )
      }

      assertAssigned(data, uid, now)

      const trimmedReason = reason.trim().slice(0, 160)

      transaction.update(ref, {
        partnerResponse: {
          decision: 'rejected',
          at: now,
          ...(trimmedReason ? { reason: trimmedReason } : {}),
        },
        updatedAt: now,
      })
    })
  } catch (error) {
    throw firestoreError(error)
  }
}

/**
 * Moves the active delivery to its next milestone. Retrying after a successful
 * step is an idempotent no-op, so a flaky connection cannot skip or duplicate
 * a status event.
 */
export async function advanceDeliveryStatus(
  uid: string,
  delivery: Delivery,
): Promise<void> {
  try {
    const firestore = requireDb()
    const ref = deliveryRef(delivery)
    const target = nextDeliveryStatus(delivery.status)

    if (!target || target === 'delivered') {
      throw new DeliveryActionError(
        'delivery/invalid-transition',
        'This delivery cannot move further from here.',
      )
    }

    const now = new Date().toISOString()

    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(ref)
      const data = snapshot.data() as Record<string, unknown> | undefined

      if (!snapshot.exists() || !data) {
        throw new DeliveryActionError(
          'delivery/not-found',
          'This delivery is no longer available.',
        )
      }

      const status = asStatus(data.status)

      if (asText(data.partnerUid) !== uid) {
        throw new DeliveryActionError(
          'delivery/not-assigned',
          'This delivery was reassigned to another partner.',
        )
      }

      // The write already landed; a retry must not duplicate the event.
      if (status === target) {
        return
      }

      if (status !== delivery.status) {
        throw new DeliveryActionError(
          'delivery/invalid-transition',
          'This delivery moved on while you were offline. Refresh to see the latest state.',
        )
      }

      transaction.update(ref, {
        status: target,
        adminStatus: adminDeliveryStatus(target),
        events: [...asEvents(data.events), { status: target, at: now }],
        updatedAt: now,
      })
    })
  } catch (error) {
    throw firestoreError(error)
  }
}

/**
 * Verifies the customer's delivery code and closes the job. The code is the
 * one delivery_admin issued on the assignment; there is no fallback value.
 * Returns false when the code does not match; nothing is written in that case.
 */
export async function completeDeliveryWithOtp(
  uid: string,
  delivery: Delivery,
  otp: string,
  proof: DeliveryCompletionProof = {},
): Promise<boolean> {
  try {
    const firestore = requireDb()
    const ref = deliveryRef(delivery)
    const now = new Date().toISOString()

    return await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(ref)
      const data = snapshot.data() as Record<string, unknown> | undefined

      if (!snapshot.exists() || !data) {
        throw new DeliveryActionError(
          'delivery/not-found',
          'This delivery is no longer available.',
        )
      }

      const status = asStatus(data.status)

      if (asText(data.partnerUid) !== uid) {
        throw new DeliveryActionError(
          'delivery/not-assigned',
          'This delivery was reassigned to another partner.',
        )
      }

      // The completion already landed; a retry must not fail or duplicate it.
      if (status === 'delivered') {
        return true
      }

      if (status !== 'drop_arrived') {
        throw new DeliveryActionError(
          'delivery/invalid-transition',
          'Reach the drop location before completing the delivery.',
        )
      }

      const expected = asText(data.dropOtp)
      const entered = otp.trim()
      const codeMatches = Boolean(expected) && entered === expected
      const demoMatches =
        demoDeliveryOtpEnabled && entered === demoDeliveryOtp
      const usedDemoCode = demoMatches && !codeMatches

      if (!codeMatches && !demoMatches) {
        if (!expected) {
          // No code was issued (an offer created before the console started
          // generating codes). Refuse to close the job without verification.
          throw new DeliveryActionError(
            'delivery/no-otp',
            demoDeliveryOtpEnabled
              ? 'No delivery code was issued for this delivery. Use the demo test code shown above or contact operations.'
              : 'No delivery code was issued for this delivery. Contact operations to verify the drop and complete it.',
          )
        }

        return false
      }

      const handover: DeliveryProof = {
        method: 'otp',
        verifiedAt: now,
        ...(usedDemoCode ? { demoOverride: true } : {}),
      }
      const recipientName = proof.recipientName?.trim()
      const note = proof.note?.trim()

      if (recipientName) {
        handover.recipientName = recipientName.slice(0, 80)
      }
      if (note) {
        handover.note = note.slice(0, 280)
      }
      if (
        proof.location &&
        Number.isFinite(proof.location.latitude) &&
        Number.isFinite(proof.location.longitude)
      ) {
        handover.latitude = proof.location.latitude
        handover.longitude = proof.location.longitude
        handover.accuracy = proof.location.accuracy
      }

      transaction.update(ref, {
        status: 'delivered',
        adminStatus: adminDeliveryStatus('delivered'),
        completedAt: now,
        proof: handover,
        events: [...asEvents(data.events), { status: 'delivered', at: now }],
        updatedAt: now,
      })

      return true
    })
  } catch (error) {
    throw firestoreError(error)
  }
}

/** Cancels the active delivery with a reason, shared with delivery_admin. */
export async function cancelActiveDelivery(
  uid: string,
  delivery: Delivery,
  reason: string,
): Promise<void> {
  try {
    const firestore = requireDb()
    const ref = deliveryRef(delivery)
    const now = new Date().toISOString()

    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(ref)
      const data = snapshot.data() as Record<string, unknown> | undefined

      if (!snapshot.exists() || !data) {
        throw new DeliveryActionError(
          'delivery/not-found',
          'This delivery is no longer available.',
        )
      }

      const status = asStatus(data.status)

      if (asText(data.partnerUid) !== uid) {
        throw new DeliveryActionError(
          'delivery/not-assigned',
          'This delivery was reassigned to another partner.',
        )
      }

      if (status === 'cancelled') {
        return
      }

      if (status === 'delivered' || status === 'assigned') {
        throw new DeliveryActionError(
          'delivery/invalid-transition',
          'This delivery cannot be cancelled from its current state.',
        )
      }

      transaction.update(ref, {
        status: 'cancelled',
        adminStatus: adminDeliveryStatus('cancelled'),
        cancellationReason: reason,
        completedAt: now,
        events: [...asEvents(data.events), { status: 'cancelled', at: now }],
        updatedAt: now,
      })
    })
  } catch (error) {
    throw firestoreError(error)
  }
}

/** Shares the partner's throttled GPS position on the active delivery. */
export async function publishDeliveryLocation(
  delivery: Delivery,
  location: PartnerLocation,
): Promise<void> {
  try {
    await updateDoc(deliveryRef(delivery), {
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        updatedAt: location.updatedAt,
      },
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    throw firestoreError(error)
  }
}
