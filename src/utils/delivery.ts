import type { Delivery, DeliveryStatus } from '../types/delivery'

/** The order a delivery moves through after it is accepted. */
export const deliveryProgression: DeliveryStatus[] = [
  'accepted',
  'reached_pickup',
  'picked_up',
  'in_transit',
  'delivered',
]

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  assigned: 'New request',
  accepted: 'Order accepted',
  reached_pickup: 'Reached pickup',
  picked_up: 'Picked up',
  in_transit: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** The next action label shown on the active delivery screen. */
export const nextDeliveryAction: Partial<Record<DeliveryStatus, string>> = {
  accepted: 'I have reached the pickup',
  reached_pickup: 'Confirm pickup',
  picked_up: 'Start the delivery',
  in_transit: 'Complete delivery',
}

export function isDeliveryActive(delivery: Delivery): boolean {
  return deliveryProgression.includes(delivery.status)
}
