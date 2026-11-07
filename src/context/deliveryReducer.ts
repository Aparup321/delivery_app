import type { Delivery } from '../types/delivery'
import { nextDeliveryStatus } from '../utils/delivery'

export interface DeliveryState {
  requests: Delivery[]
  activeDelivery: Delivery | null
  history: Delivery[]
}

export type DeliveryAction =
  | { type: 'accept'; id: string; at: string }
  | { type: 'reject'; id: string }
  | { type: 'advance'; at: string }
  | { type: 'complete'; at: string }
  | { type: 'cancel'; reason: string; at: string }

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

      const next = nextDeliveryStatus(delivery.status)
      if (!next || next === 'delivered') {
        return state
      }

      const updated: Delivery = {
        ...delivery,
        status: next,
        events: [...delivery.events, { status: next, at: action.at }],
      }

      return { ...state, activeDelivery: updated }
    }

    case 'complete': {
      const delivery = state.activeDelivery
      if (!delivery || delivery.status !== 'drop_arrived') {
        return state
      }

      const completed: Delivery = {
        ...delivery,
        status: 'delivered',
        completedAt: action.at,
        proof: { method: 'otp', verifiedAt: action.at },
        events: [
          ...delivery.events,
          { status: 'delivered', at: action.at },
        ],
      }

      return {
        ...state,
        activeDelivery: null,
        history: [completed, ...state.history],
      }
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
