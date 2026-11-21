export type DeliveryCategory = 'Grocery' | 'Restaurant'

export type DeliveryStatus =
  | 'assigned'
  | 'accepted'
  | 'pickup_arrived'
  | 'picked_up'
  | 'in_transit'
  | 'drop_arrived'
  | 'delivered'
  | 'cancelled'

export interface DeliveryStop {
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface DeliveryEvent {
  status: DeliveryStatus
  at: string
}

/** Proof captured when the customer confirms the delivery. */
export interface DeliveryProof {
  method: 'otp'
  verifiedAt: string
  /** Optional text-only handover details, used instead of a signature/photo. */
  recipientName?: string
  note?: string
  latitude?: number
  longitude?: number
  accuracy?: number | null
}

/** Text-only handover details supplied when the partner closes a delivery. */
export interface DeliveryCompletionProof {
  recipientName?: string
  note?: string
  location?: DeliveryLocation | null
}

/** The partner's answer to an assigned request that they declined. */
export interface DeliveryPartnerResponse {
  decision: 'rejected'
  at: string
  reason?: string
}

/** A delivery job offered to, or handled by, the partner. */
export interface Delivery {
  id: string
  category: DeliveryCategory
  pickup: DeliveryStop
  destination: DeliveryStop
  distanceKm: number
  etaMinutes: number
  earnings: number
  itemCount: number
  paymentMode: 'Prepaid' | 'Cash on delivery'
  customerName: string
  customerPhone: string
  note?: string
  requestedAt: string
  /** Seconds the partner has to respond to an offered request. */
  expiresInSeconds?: number
  /** Absolute offer deadline from delivery_admin, when the admin set one. */
  expiresAt?: string
  /** Delivery code issued by delivery_admin for the customer, when provided. */
  dropOtp?: string
  /** Set when this partner already declined the assigned request. */
  partnerResponse?: DeliveryPartnerResponse
  /** True for records written by delivery_admin rather than local demo data. */
  isLive?: boolean
  acceptedAt?: string
  completedAt?: string
  status: DeliveryStatus
  events: DeliveryEvent[]
  proof?: DeliveryProof
  cancellationReason?: string
}

/** Partner position shared on the delivery document while a job is active. */
export interface DeliveryLocation {
  latitude: number
  longitude: number
  accuracy: number | null
  updatedAt: string
}
