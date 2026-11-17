import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
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
import {
  publishDelivery,
  publishPartnerLocation,
  type PartnerLocation,
} from '../services/deliverySync'
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
  const remoteEnabled = Boolean(
    uid && isFirebaseConfigured && !uid.startsWith('demo:'),
  )
  // Firebase is configured but Authentication failed, so the app fell back to
  // the device-only demo session. It has no verified application and must not
  // inherit an old locally approved state from an earlier session.
  const unverifiedDemoSession = Boolean(
    uid && isFirebaseConfigured && uid.startsWith('demo:'),
  )
  const [deliveries, dispatch] = useReducer(deliveryReducer, remoteEnabled
    ? { requests: [], activeDelivery: null, history: [] }
    : {
        requests: initialRequests,
        activeDelivery: null,
        history: initialHistory,
      })
  const [isOnline, setOnlineState] = useState(false)
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications)
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const local = readOnboarding(phone)

    if (!remoteEnabled && !unverifiedDemoSession) {
      return local
    }

    // A live account's status comes from Firestore. A demo fallback while
    // Firebase is configured has no verified application either, so both must
    // start the wizard until a real submission exists. Preserve draft progress,
    // but reset a locally submitted application back to the first step.
    const wasSubmitted = local.status !== 'draft' || Boolean(local.submittedAt)

    return {
      ...local,
      step: wasSubmitted ? 0 : local.step,
      status: 'draft',
      submittedAt: null,
      statusUpdatedAt: null,
      accountStatus: 'pending',
      rejectionReason: null,
      suspensionReason: null,
      accountStatusUpdatedAt: null,
      adminPartnerId: null,
      reviewedBy: null,
      reviewedAt: null,
    }
  })
  const [isLoading, setIsLoading] = useState(remoteEnabled)
  const [liveSyncError, setLiveSyncError] = useState<string | null>(null)
  const [liveRetryToken, setLiveRetryToken] = useState(0)
  const [deliverySyncError, setDeliverySyncError] = useState<string | null>(
    null,
  )
  const [deliveryRetryToken, setDeliveryRetryToken] = useState(0)
  const [locationTick, setLocationTick] = useState(0)
  const locationRef = useRef<PartnerLocation | null>(null)
  const publishedDeliveriesRef = useRef<Map<string, string>>(new Map())
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
        if (!active) {
          return
        }

        if (remote) {
          setOnboarding(remote)
        }
        // Apply the status and clear the gate in one batch. Clearing it in a
        // separate finally callback can render the draft state once and send a
        // submitted partner to the wizard before the remote state lands.
        setIsLoading(false)
      })
      .catch(() => {
        // Keep the local draft if Firestore is unavailable or rules deny read.
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
    let reportTimer: number | undefined

    try {
      unsubscribe = watchPartnerAccount(
        uid,
        (snapshot) => {
          if (!active) {
            return
          }

          setLiveSyncError(null)
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
            reviewedBy: snapshot.reviewedBy,
            reviewedAt: snapshot.reviewedAt,
          }))
        },
        () => {
          if (active) {
            setLiveSyncError(
              'Live Administrator updates are unavailable. Check your connection and retry.',
            )
          }
        },
      )
    } catch {
      // Defer the fallback so mounting does not trigger a second render.
      reportTimer = window.setTimeout(() => {
        if (active) {
          setLiveSyncError(
            'Live Administrator updates are unavailable. Check your connection and retry.',
          )
        }
      }, 0)
    }

    return () => {
      active = false
      window.clearTimeout(reportTimer)
      unsubscribe?.()
    }
  }, [remoteEnabled, uid, liveRetryToken])

  const retryLiveSync = useCallback(() => {
    setLiveSyncError(null)
    setLiveRetryToken((value) => value + 1)
  }, [])

  // Mirror each accepted or progressed job into Firestore. The signature keeps
  // retries idempotent and avoids writing on every unrelated render.
  useEffect(() => {
    if (!remoteEnabled || !uid) {
      return
    }

    const delivery = deliveries.activeDelivery ?? deliveries.history[0]
    if (!delivery) {
      return
    }

    const signature = [
      delivery.status,
      delivery.events.length,
      delivery.completedAt ?? '',
      delivery.proof?.verifiedAt ?? '',
      locationRef.current?.updatedAt ?? '',
    ].join('|')

    if (publishedDeliveriesRef.current.get(delivery.id) === signature) {
      return
    }

    publishedDeliveriesRef.current.set(delivery.id, signature)

    void publishDelivery(delivery, {
      partnerUid: uid,
      partnerName:
        onboarding.fullName.trim() || phone || 'Delivery partner',
      vehicleType: onboarding.vehicle.type,
      source: 'live',
      currentLocation: locationRef.current,
    })
      .then(() => {
        setDeliverySyncError(null)
      })
      .catch(() => {
        publishedDeliveriesRef.current.delete(delivery.id)
        setDeliverySyncError(
          'This delivery could not be synced to the Administrator console. Retry when you are back online.',
        )
      })
  }, [
    deliveries,
    remoteEnabled,
    uid,
    onboarding.fullName,
    onboarding.vehicle.type,
    phone,
    deliveryRetryToken,
    locationTick,
  ])

  // Share the partner's last known position while they are online. This is
  // best-effort: a denied permission never blocks deliveries. Wait until the
  // first Firestore read has settled: a merge write started before that read
  // can surface as a location-only document locally and make a submitted
  // partner look like a brand-new sign-in, which sends them to the wizard.
  useEffect(() => {
    if (!remoteEnabled || !uid || isLoading) {
      return
    }

    if (!isOnline) {
      locationRef.current = null
      void publishPartnerLocation(uid, null, false).catch(() => {
        // Offline state is also best-effort.
      })
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }

    const control = { cancelled: false }

    const update = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (control.cancelled) {
            return
          }

          const location: PartnerLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Number.isFinite(position.coords.accuracy)
              ? position.coords.accuracy
              : null,
            updatedAt: new Date().toISOString(),
          }
          locationRef.current = location
          setLocationTick((value) => value + 1)

          void publishPartnerLocation(uid, location, true).catch(() => {
            // The next status change retries the delivery document.
          })
        },
        () => {
          // Permission denied or unavailable: online work still continues.
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
      )
    }

    update()
    const timer = window.setInterval(update, 60_000)

    return () => {
      control.cancelled = true
      window.clearInterval(timer)
      locationRef.current = null
      void publishPartnerLocation(uid, null, false).catch(() => {
        // The next sign-in can correct a stale online flag.
      })
    }
  }, [remoteEnabled, uid, isOnline, isLoading])

  const retryDeliverySync = useCallback(() => {
    setDeliverySyncError(null)
    setDeliveryRetryToken((value) => value + 1)
  }, [])

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

  const setApplicationStatus = useCallback(
    (status: OnboardingStatus) => {
      // Live accounts are controlled by delivery_admin. This helper exists only
      // for the offline prototype.
      if (remoteEnabled) {
        return
      }

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
    },
    [remoteEnabled],
  )

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
      liveSyncError,
      retryLiveSync,
      deliverySyncError,
      retryDeliverySync,
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
      liveSyncError,
      retryLiveSync,
      deliverySyncError,
      retryDeliverySync,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
