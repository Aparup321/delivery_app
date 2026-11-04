import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { initialHistory, initialRequests } from '../mock/deliveries'
import { initialNotifications } from '../mock/notifications'
import { initialOnboarding } from '../mock/onboarding'
import { initialTickets } from '../mock/support'
import type { AppNotification } from '../types/notification'
import type { OnboardingState } from '../types/onboarding'
import type { SupportTicket } from '../types/support'
import { AppContext } from './app-store'
import { deliveryReducer } from './deliveryReducer'

const ONBOARDING_STORAGE_KEY = 'fafo.partner.onboarding'

function readOnboarding(): OnboardingState {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
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
      training: parsed.training ?? initialOnboarding.training,
    }
  } catch {
    return initialOnboarding
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [deliveries, dispatch] = useReducer(deliveryReducer, {
    requests: initialRequests,
    activeDelivery: null,
    history: initialHistory,
  })
  const [isOnline, setOnline] = useState(false)
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications)
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [onboarding, setOnboarding] = useState<OnboardingState>(readOnboarding)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(onboarding),
      )
    } catch {
      // Progress stays in memory when storage is blocked.
    }
  }, [onboarding])

  const acceptRequest = useCallback((id: string) => {
    dispatch({ type: 'accept', id, at: new Date().toISOString() })
  }, [])

  const rejectRequest = useCallback((id: string) => {
    dispatch({ type: 'reject', id })
  }, [])

  const advanceDelivery = useCallback(() => {
    dispatch({ type: 'advance', at: new Date().toISOString() })
  }, [])

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
