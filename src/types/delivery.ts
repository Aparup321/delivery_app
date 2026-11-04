export type DeliveryCategory = 'Grocery' | 'Restaurant'

export type DeliveryStatus =
  | 'assigned'
  | 'accepted'
  | 'reached_pickup'
  | 'picked_up'
  | 'in_transit'
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
  cancellationReason?: string
}
