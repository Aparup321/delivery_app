import type { Delivery, DeliveryStatus } from '../types/delivery'
import { deliveryProgression } from '../utils/delivery'

export interface DeliveryState {
  requests: Delivery[]
  activeDelivery: Delivery | null
  history: Delivery[]
}

export type DeliveryAction =
  | { type: 'accept'; id: string; at: string }
  | { type: 'reject'; id: string }
  | { type: 'advance'; at: string }
  | { type: 'cancel'; reason: string; at: string }

function nextStatus(status: DeliveryStatus): DeliveryStatus | null {
  const index = deliveryProgression.indexOf(status)

  if (index < 0) {
    return null
  }

  return deliveryProgression[index + 1] ?? null
}

export function deliveryReducer(
  state: DeliveryState,
  action: DeliveryAction,
): DeliveryState {
  switch (action.type) {
    case 'accept': {
      if (state.activeDelivery) {
        return state
      }

      const request = state.requests.find((item) => item.id === action.id)
      if (!request) {
        return state
      }

      return {
        requests: state.requests.filter((item) => item.id !== action.id),
        activeDelivery: {
          ...request,
          status: 'accepted',
          acceptedAt: action.at,
          events: [{ status: 'accepted', at: action.at }],
        },
        history: state.history,
      }
    }

    case 'reject': {
      return {
        ...state,
        requests: state.requests.filter((item) => item.id !== action.id),
      }
    }

    case 'advance': {
      const delivery = state.activeDelivery
      if (!delivery) {
        return state
      }

      const next = nextStatus(delivery.status)
      if (!next) {
        return state
      }

      const updated: Delivery = {
        ...delivery,
        status: next,
        events: [...delivery.events, { status: next, at: action.at }],
      }

      if (next === 'delivered') {
        return {
          ...state,
          activeDelivery: null,
          history: [{ ...updated, completedAt: action.at }, ...state.history],
        }
      }

      return { ...state, activeDelivery: updated }
    }

    case 'cancel': {
      const delivery = state.activeDelivery
      if (!delivery) {
        return state
      }

      const cancelled: Delivery = {
        ...delivery,
        status: 'cancelled',
        cancellationReason: action.reason,
        completedAt: action.at,
        events: [...delivery.events, { status: 'cancelled', at: action.at }],
      }

      return {
        ...state,
        activeDelivery: null,
        history: [cancelled, ...state.history],
      }
    }

    default:
      return state
  }
}
