import { createContext, useContext } from 'react'
import type { Delivery } from '../types/delivery'
import type { AppNotification } from '../types/notification'
import type {
  OnboardingFiles,
  OnboardingState,
  OnboardingStatus,
  SubmitOnboardingOptions,
} from '../types/onboarding'
import type { SupportTicket } from '../types/support'

export interface AppContextValue {
  isOnline: boolean
  /** True only for an approved application with an active account. */
  canGoOnline: boolean
  setOnline: (online: boolean) => void

  requests: Delivery[]
  activeDelivery: Delivery | null
  history: Delivery[]
  acceptRequest: (id: string) => void
  rejectRequest: (id: string) => void
  advanceDelivery: () => void
  /** Verifies the customer's delivery code and closes the active job. */
  completeDelivery: (otp: string) => boolean
  cancelDelivery: (reason: string) => void

  notifications: AppNotification[]
  unreadNotifications: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  tickets: SupportTicket[]
  createTicket: (subject: string, message: string) => void

  /** True while a submitted application is loading from Firestore. */
  isLoading: boolean
  onboarding: OnboardingState
  updateOnboarding: (patch: Partial<OnboardingState>) => void
  submitOnboarding: (
    files: OnboardingFiles,
    options?: SubmitOnboardingOptions,
  ) => Promise<void>
  /** Demo helper for moving the application through verification. */
  setApplicationStatus: (status: OnboardingStatus) => void
  /** Set when the live partner-document listener cannot reach Firestore. */
  liveSyncError: string | null
  /** Re-subscribes to the live Administrator-controlled partner document. */
  retryLiveSync: () => void
  /** Set when a delivery lifecycle update could not reach Firestore. */
  deliverySyncError: string | null
  /** Retries the latest delivery lifecycle write. */
  retryDeliverySync: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>')
  }

  return context
}
