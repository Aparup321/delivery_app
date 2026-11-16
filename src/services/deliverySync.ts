import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Delivery, DeliveryStatus } from '../types/delivery'
import type { VehicleType } from '../types/partner'

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

export interface DeliveryPublishContext {
  partnerUid: string
  partnerName: string
  vehicleType: VehicleType | string
  source?: 'live' | 'demo'
  currentLocation?: PartnerLocation | null
}

/** Firestore document id: stable, URL-safe, and without the display '#'. */
export function deliveryDocumentId(deliveryId: string): string {
  return (
    deliveryId.replace(/^#/, '').replace(/[^A-Za-z0-9_-]/g, '') || 'delivery'
  )
}

/** Only the last four digits of the customer number leave the device. */
function maskedPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  return digits.length >= 4 ? `+91 ***** ${digits.slice(-4)}` : '—'
}

/** Payload published by delivery_app and read by delivery_admin. */
export function buildDeliveryDocument(
  delivery: Delivery,
  context: DeliveryPublishContext,
) {
  return {
    deliveryId: deliveryDocumentId(delivery.id),
    displayId: delivery.id,
    partnerUid: context.partnerUid,
    partnerName: context.partnerName,
    vehicleType: context.vehicleType,
    source: context.source ?? 'live',
    category: delivery.category,
    status: delivery.status,
    adminStatus: adminDeliveryStatus(delivery.status),
    pickup: {
      name: delivery.pickup.name,
      address: delivery.pickup.address,
      latitude: delivery.pickup.latitude,
      longitude: delivery.pickup.longitude,
    },
    destination: {
      name: delivery.destination.name,
      address: delivery.destination.address,
      latitude: delivery.destination.latitude,
      longitude: delivery.destination.longitude,
    },
    distanceKm: delivery.distanceKm,
    etaMinutes: delivery.etaMinutes,
    earnings: delivery.earnings,
    itemCount: delivery.itemCount,
    paymentMode: delivery.paymentMode,
    customerName: delivery.customerName,
    customerPhoneMasked: maskedPhone(delivery.customerPhone),
    note: delivery.note ?? null,
    requestedAt: delivery.requestedAt,
    acceptedAt: delivery.acceptedAt ?? null,
    completedAt: delivery.completedAt ?? null,
    cancellationReason: delivery.cancellationReason ?? null,
    proof: delivery.proof ?? null,
    events: delivery.events,
    currentLocation: context.currentLocation ?? null,
    createdAt: delivery.acceptedAt ?? delivery.requestedAt,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Mirrors one partner-side lifecycle change into `deliveries/{id}`. Using
 * setDoc with merge keeps retries idempotent and never creates duplicate jobs.
 */
export async function publishDelivery(
  delivery: Delivery,
  context: DeliveryPublishContext,
): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  await setDoc(
    doc(db, 'deliveries', deliveryDocumentId(delivery.id)),
    buildDeliveryDocument(delivery, context),
    { merge: true },
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
