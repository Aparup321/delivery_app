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
}

export interface DeliveryEvent {
  status: DeliveryStatus
  at: string
}

/** Proof captured when the customer confirms the delivery. */
export interface DeliveryProof {
  method: 'otp'
  verifiedAt: string
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
  acceptedAt?: string
  completedAt?: string
  status: DeliveryStatus
  events: DeliveryEvent[]
  proof?: DeliveryProof
  cancellationReason?: string
}
