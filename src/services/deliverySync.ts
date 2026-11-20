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

/** Publishes the partner's last known position while they are online. */
export async function publishPartnerLocation(
  uid: string,
  location: PartnerLocation | null,
  online: boolean,
): Promise<void> {
  if (!db) {
    return
  }

  await setDoc(
    doc(db, 'partners', uid),
    {
      isOnline: online,
      lastLocation: location,
      lastLocationUpdatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}
