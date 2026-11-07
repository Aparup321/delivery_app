import type { Delivery, DeliveryStatus } from '../types/delivery'

/** The order a delivery moves through after it is accepted. */
export const deliveryProgression: DeliveryStatus[] = [
  'accepted',
  'pickup_arrived',
  'picked_up',
  'in_transit',
  'drop_arrived',
  'delivered',
]

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  assigned: 'New request',
  accepted: 'Order accepted',
  pickup_arrived: 'At pickup',
  picked_up: 'Picked up',
  in_transit: 'On the way',
  drop_arrived: 'At drop',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** The next action label shown on the active delivery screen. */
export const nextDeliveryAction: Partial<Record<DeliveryStatus, string>> = {
  accepted: 'I have reached the pickup',
  pickup_arrived: 'Confirm pickup',
  picked_up: 'Start the delivery',
  in_transit: 'I have reached the drop',
}

/** Status that requires the customer's delivery code before it can close. */
export function isAwaitingProof(status: DeliveryStatus): boolean {
  return status === 'drop_arrived'
}

/** The next milestone in the normal progression, if there is one. */
export function nextDeliveryStatus(
  status: DeliveryStatus,
): DeliveryStatus | null {
  const index = deliveryProgression.indexOf(status)

  if (index < 0 || index === deliveryProgression.length - 1) {
    return null
  }

  return deliveryProgression[index + 1] ?? null
}

export function isDeliveryActive(delivery: Delivery): boolean {
  return delivery.status !== 'delivered' && delivery.status !== 'cancelled'
}
