import { createContext, useContext } from 'react'
import type {
  Delivery,
  DeliveryCompletionProof,
  DeliveryLocation,
} from '../types/delivery'
import type { AppNotification } from '../types/notification'
import type {
  OnboardingFiles,
  OnboardingState,
  OnboardingStatus,
  SubmitOnboardingOptions,
} from '../types/onboarding'
import type { SupportTicket } from '../types/support'
import type { TrackingStatus } from '../hooks/usePartnerTracking'

/** Headline figures shown on the Home dashboard. */
export interface DashboardStats {
  deliveriesToday: number
  earningsToday: number
  /** null when the partner has no rating yet. */
  rating: number | null
}

export interface AppContextValue {
  isOnline: boolean
  /** True only for an approved application with an active account. */
  canGoOnline: boolean
  setOnline: (online: boolean) => void

  /**
   * True when the session talks to Firebase with a real UID, so every list is
   * live data and no demo fixture may be shown. The offline prototype
   * (Firebase unconfigured or the connection failed) is false.
   */
  isLiveSession: boolean

  /** Headline dashboard figures, real for live sessions. */
  dashboardStats: DashboardStats

  requests: Delivery[]
  activeDelivery: Delivery | null
  history: Delivery[]
  /**
   * Accepts an assigned request. Resolves true when the delivery is now
   * active; false means the offer expired or was taken by someone else.
   */
  acceptRequest: (id: string) => Promise<boolean>
  rejectRequest: (id: string, reason?: string) => Promise<void>
  /** Advances the active delivery to its next milestone. */
  advanceDelivery: () => Promise<boolean>
  /** Verifies the customer's delivery code and closes the active job. */
  completeDelivery: (
    otp: string,
    proof?: DeliveryCompletionProof,
  ) => Promise<boolean>
  /** Cancels the active delivery with a reason. */
  cancelDelivery: (reason: string) => Promise<boolean>

  /**
   * The delivery action currently in flight, e.g. 'accept' or 'advance', or
   * null when nothing is pending.
   */
  deliveryActionPending: string | null
  /** The request id a pending accept or reject belongs to. */
  deliveryActionPendingId: string | null
  /** Actionable message for the last failed delivery action. */
  deliveryActionError: string | null
  /** True while the first live delivery snapshot has not arrived yet. */
  deliveryRequestsLoading: boolean

  /**
   * How live location sharing is doing on the active delivery: 'active',
   * 'denied', 'paused', and so on. 'idle' when no delivery is in progress.
   */
  trackingStatus: TrackingStatus
  /** The partner's latest GPS fix on this device, when available. */
  trackingPosition: DeliveryLocation | null
  /** Requests one immediate GPS fix and publishes it to operations. */
  shareLocationNow: () => void

  notifications: AppNotification[]
  unreadNotifications: number
  /** When false, new-request sound/vibration and browser alerts are muted. */
  requestAlertsEnabled: boolean
  setRequestAlertsEnabled: (enabled: boolean) => void
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
