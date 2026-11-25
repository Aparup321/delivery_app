import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { DeliveryStatus } from '../types/delivery'

/** Status values delivery_admin already uses on its delivery records. */
export type AdminDeliveryStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Transit'
  | 'Delayed'
  | 'Completed'
  | 'Cancelled'

const ADMIN_DELIVERY_STATUS: Record<DeliveryStatus, AdminDeliveryStatus> = {
  assigned: 'Pending',
  accepted: 'Assigned',
  pickup_arrived: 'Assigned',
  picked_up: 'In Transit',
  in_transit: 'In Transit',
  drop_arrived: 'In Transit',
  delivered: 'Completed',
  cancelled: 'Cancelled',
}

export function adminDeliveryStatus(
  status: DeliveryStatus,
): AdminDeliveryStatus {
  return ADMIN_DELIVERY_STATUS[status]
}

export interface PartnerLocation {
  latitude: number
  longitude: number
  accuracy: number | null
  updatedAt: string
}

/** Firestore document id: stable, URL-safe, and without the display '#'. */
export function deliveryDocumentId(deliveryId: string): string {
  return (
    deliveryId.replace(/^#/, '').replace(/[^A-Za-z0-9_-]/g, '') || 'delivery'
  )
}

/**
 * The partner's work availability, mirrored to delivery_admin. It is distinct
 * from the account status the Administrator controls: an approved account can
 * be offline, and an online partner mid-delivery is busy.
 */
export type PartnerAvailability = 'Available' | 'On Delivery' | 'Offline'

/** Publishes the partner's availability and last known position. */
export async function publishPartnerLocation(
  uid: string,
  location: PartnerLocation | null,
  online: boolean,
  availability: PartnerAvailability = online ? 'Available' : 'Offline',
): Promise<void> {
  if (!db) {
    return
  }

  await setDoc(
    doc(db, 'partners', uid),
    {
      // Firestore rules require partnerId == uid for every profile update.
      // Re-writing it here repairs legacy or manually restored documents whose
      // partnerId was lost, which otherwise silently blocks presence updates.
      partnerId: uid,
      isOnline: online,
      availability,
      lastLocation: location,
      lastLocationUpdatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

/** Updates only the availability flag, leaving the last position untouched. */
export async function publishPartnerAvailability(
  uid: string,
  availability: PartnerAvailability,
): Promise<void> {
  if (!db) {
    return
  }

  await setDoc(
    doc(db, 'partners', uid),
    { partnerId: uid, availability },
    { merge: true },
  )
}

/**
 * Publishes the online flag and work availability without requiring a GPS fix.
 * Presence and location are separate on purpose: a denied location permission
 * must not make an otherwise online partner look offline to the administrator.
 */
export async function publishPartnerStatus(
  uid: string,
  online: boolean,
  availability: PartnerAvailability,
): Promise<void> {
  if (!db) {
    return
  }

  await setDoc(
    doc(db, 'partners', uid),
    { partnerId: uid, isOnline: online, availability },
    { merge: true },
  )
}
