import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import {
  DEMO_PROOF_OTP,
  initialHistory,
  initialRequests,
} from '../mock/deliveries'
import { initialNotifications } from '../mock/notifications'
import { isFirebaseConfigured } from '../firebase/config'
import { initialOnboarding } from '../mock/onboarding'
import { initialTickets } from '../mock/support'
import {
  loadPartnerOnboarding,
  savePartnerOnboarding,
  watchPartnerAccount,
} from '../services/partnerOnboarding'
import type { AppNotification } from '../types/notification'
import type {
  OnboardingFiles,
  OnboardingState,
  OnboardingStatus,
  SubmitOnboardingOptions,
} from '../types/onboarding'
import type { SupportTicket } from '../types/support'
import { AppContext } from './app-store'
import { deliveryReducer } from './deliveryReducer'
import { useAuth } from './auth'

const ONBOARDING_STORAGE_PREFIX = 'fafo.partner.onboarding'

/** Each verified mobile number keeps its own onboarding draft. */
function onboardingKey(phone: string): string {
  return `${ONBOARDING_STORAGE_PREFIX}.${phone}`
}

function readOnboarding(phone: string | null): OnboardingState {
  if (!phone) {
    return initialOnboarding
  }

  try {
    const raw = window.localStorage.getItem(onboardingKey(phone))
    if (!raw) {
      return initialOnboarding
    }

    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    if (typeof parsed !== 'object' || parsed === null) {
      return initialOnboarding
    }

    // Earlier drafts stored the Aadhaar number at the top level.
    const legacyAadhaarNumber = (
      parsed as { aadhaarNumber?: string }
    ).aadhaarNumber

    return {
      ...initialOnboarding,
      ...parsed,
      documentNumbers: {
        ...initialOnboarding.documentNumbers,
        ...parsed.documentNumbers,
        aadhaar:
          parsed.documentNumbers?.aadhaar ?? legacyAadhaarNumber ?? '',
      },
      documents: { ...initialOnboarding.documents, ...parsed.documents },
      vehicle: { ...initialOnboarding.vehicle, ...parsed.vehicle },
      bank: { ...initialOnboarding.bank, ...parsed.bank },
      training: Array.from(
        { length: initialOnboarding.training.length },
        (_, index) => parsed.training?.[index] ?? false,
      ),
    }
  } catch {
    return initialOnboarding
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()

  return (
    <AppDataProvider
      key={session?.uid ?? 'signed-out'}
      phone={session?.phone ?? null}
      uid={session?.uid ?? null}
    >
      {children}
    </AppDataProvider>
  )
}

function AppDataProvider({
  children,
  phone,
  uid,
}: {
  children: ReactNode
  phone: string | null
  uid: string | null
}) {
  const [deliveries, dispatch] = useReducer(deliveryReducer, {
    requests: initialRequests,
    activeDelivery: null,
    history: initialHistory,
  })
  const [isOnline, setOnlineState] = useState(false)
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications)
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [onboarding, setOnboarding] = useState<OnboardingState>(() =>
    readOnboarding(phone),
  )
  const remoteEnabled = Boolean(
    uid && isFirebaseConfigured && !uid.startsWith('demo:'),
  )
  const [isLoading, setIsLoading] = useState(remoteEnabled)
  const canGoOnline =
    onboarding.status === 'approved' && onboarding.accountStatus === 'active'

  // An Administrator decision can revoke online access between renders. React's
  // documented "adjust state when an input changes" pattern resets the switch in
  // the same pass, so the partner is shown offline before anything can dispatch.
  const [wasAllowedOnline, setWasAllowedOnline] = useState(canGoOnline)
  if (wasAllowedOnline !== canGoOnline) {
    setWasAllowedOnline(canGoOnline)
    setOnlineState(false)
  }

  const setOnline = useCallback(
    (online: boolean) => {
      setOnlineState(online && canGoOnline)
    },
    [canGoOnline],
  )

  useEffect(() => {
    if (!phone) {
      return
    }

    try {
      window.localStorage.setItem(
        onboardingKey(phone),
        JSON.stringify(onboarding),
      )
    } catch {
      // Progress stays in memory when storage is blocked.
    }
  }, [onboarding, phone])

  useEffect(() => {
    if (!remoteEnabled || !uid) {
      return
    }

    let active = true

    void loadPartnerOnboarding(uid)
      .then((remote) => {
        if (active && remote) {
          setOnboarding(remote)
        }
      })
      .catch(() => {
        // Keep the local draft if Firestore is unavailable or rules deny read.
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [remoteEnabled, uid])

  useEffect(() => {
    if (!remoteEnabled || !uid) {
      return
    }

    let active = true
    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = watchPartnerAccount(uid, (snapshot) => {
        if (!active) {
          return
        }

        setOnboarding((current) => ({
          ...current,
          status: snapshot.applicationStatus,
          submittedAt: snapshot.submittedAt ?? current.submittedAt,
          statusUpdatedAt:
            snapshot.statusUpdatedAt ?? current.statusUpdatedAt,
          rejectionReason: snapshot.rejectionReason,
          accountStatus: snapshot.accountStatus,
          suspensionReason: snapshot.suspensionReason,
          accountStatusUpdatedAt: snapshot.accountStatusUpdatedAt,
          adminPartnerId: snapshot.adminPartnerId,
        }))
      })
    } catch {
      // Keep the locally loaded onboarding state if Firestore is unavailable.
    }

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [remoteEnabled, uid])

  const acceptRequest = useCallback((id: string) => {
    dispatch({ type: 'accept', id, at: new Date().toISOString() })
  }, [])

  const rejectRequest = useCallback((id: string) => {
    dispatch({ type: 'reject', id })
  }, [])

  const advanceDelivery = useCallback(() => {
    dispatch({ type: 'advance', at: new Date().toISOString() })
  }, [])

  const completeDelivery = useCallback(
    (otp: string) => {
      if (deliveries.activeDelivery?.status !== 'drop_arrived') {
        return false
      }

      if (otp.trim() !== DEMO_PROOF_OTP) {
        return false
      }

      dispatch({ type: 'complete', at: new Date().toISOString() })
      return true
    },
    [deliveries.activeDelivery],
  )

  const cancelDelivery = useCallback((reason: string) => {
    dispatch({ type: 'cancel', reason, at: new Date().toISOString() })
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    )
  }, [])

  const createTicket = useCallback((subject: string, message: string) => {
    const ticket: SupportTicket = {
      id: `#SUP-${Date.now().toString().slice(-4)}`,
      subject,
      message,
      status: 'Open',
      createdAt: new Date().toISOString(),
    }
    setTickets((current) => [ticket, ...current])
  }, [])

  const updateOnboarding = useCallback((patch: Partial<OnboardingState>) => {
    setOnboarding((current) => ({ ...current, ...patch }))
  }, [])

  const submitOnboarding = useCallback(
    async (files: OnboardingFiles, options?: SubmitOnboardingOptions) => {
      const at = new Date().toISOString()
      const isDemoSession = !uid || uid.startsWith('demo:')

      if (isDemoSession) {
        if (isFirebaseConfigured) {
          // Writing to localStorage and showing "submitted" would fake a
          // Firebase submission. Block it so the setup problem stays visible.
          const error = new Error(
            'Firebase is not connected. Reconnect from the banner, then submit again.',
          )
          Object.assign(error, { code: 'firebase/not-connected' })
          throw error
        }
      } else {
        await savePartnerOnboarding({
          uid,
          phone: phone ?? '',
          state: onboarding,
          files,
          skipUploads: options?.skipUploads,
        })
      }

      setOnboarding((current) => ({
        ...current,
        status: 'submitted',
        submittedAt: at,
        statusUpdatedAt: at,
        accountStatus: 'pending',
        accountStatusUpdatedAt: at,
        rejectionReason: null,
        suspensionReason: null,
        step: 0,
      }))
    },
    [uid, phone, onboarding],
  )

  const setApplicationStatus = useCallback((status: OnboardingStatus) => {
    setOnboarding((current) => {
      const at = new Date().toISOString()
      return {
        ...current,
        status,
        submittedAt:
          current.submittedAt ?? (status === 'draft' ? null : at),
        statusUpdatedAt: at,
        accountStatus: status === 'approved' ? 'active' : 'pending',
        accountStatusUpdatedAt: at,
        rejectionReason:
          status === 'rejected' ? current.rejectionReason : null,
        suspensionReason: null,
      }
    })
  }, [])

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      isOnline,
      canGoOnline,
      setOnline,
      requests: deliveries.requests,
      activeDelivery: deliveries.activeDelivery,
      history: deliveries.history,
      acceptRequest,
      rejectRequest,
      advanceDelivery,
      completeDelivery,
      cancelDelivery,
      notifications,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      tickets,
      createTicket,
      isLoading,
      onboarding,
      updateOnboarding,
      submitOnboarding,
      setApplicationStatus,
    }),
    [
      isOnline,
      canGoOnline,
      setOnline,
      deliveries,
      acceptRequest,
      rejectRequest,
      advanceDelivery,
      completeDelivery,
      cancelDelivery,
      notifications,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      tickets,
      createTicket,
      isLoading,
      onboarding,
      updateOnboarding,
      submitOnboarding,
      setApplicationStatus,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
