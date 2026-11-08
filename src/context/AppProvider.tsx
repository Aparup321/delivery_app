import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import {
  DEMO_PROOF_OTP,
  initialHistory,
  initialRequests,
} from '../mock/deliveries'
import { initialNotifications } from '../mock/notifications'
import { initialOnboarding } from '../mock/onboarding'
import { initialTickets } from '../mock/support'
import type { AppNotification } from '../types/notification'
import type { OnboardingState } from '../types/onboarding'
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

    return {
      ...initialOnboarding,
      ...parsed,
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
      key={session?.phone ?? 'signed-out'}
      phone={session?.phone ?? null}
    >
      {children}
    </AppDataProvider>
  )
}

function AppDataProvider({
  children,
  phone,
}: {
  children: ReactNode
  phone: string | null
}) {
  const [deliveries, dispatch] = useReducer(deliveryReducer, {
    requests: initialRequests,
    activeDelivery: null,
    history: initialHistory,
  })
  const [isOnline, setOnline] = useState(false)
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications)
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [onboarding, setOnboarding] = useState<OnboardingState>(() =>
    readOnboarding(phone),
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

  const submitOnboarding = useCallback(() => {
    setOnboarding((current) => ({
      ...current,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      step: 0,
    }))
  }, [])

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      isOnline,
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
      onboarding,
      updateOnboarding,
      submitOnboarding,
    }),
    [
      isOnline,
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
      onboarding,
      updateOnboarding,
      submitOnboarding,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
