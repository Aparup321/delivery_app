import { createContext, useContext } from 'react'
import type { Delivery } from '../types/delivery'
import type { AppNotification } from '../types/notification'
import type { OnboardingState } from '../types/onboarding'
import type { SupportTicket } from '../types/support'

export interface AppContextValue {
  isOnline: boolean
  setOnline: (online: boolean) => void

  requests: Delivery[]
  activeDelivery: Delivery | null
  history: Delivery[]
  acceptRequest: (id: string) => void
  rejectRequest: (id: string) => void
  advanceDelivery: () => void
  cancelDelivery: (reason: string) => void

  notifications: AppNotification[]
  unreadNotifications: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  tickets: SupportTicket[]
  createTicket: (subject: string, message: string) => void

  onboarding: OnboardingState
  updateOnboarding: (patch: Partial<OnboardingState>) => void
  submitOnboarding: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>')
  }

  return context
}
