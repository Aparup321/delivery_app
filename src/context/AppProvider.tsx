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
  earningsSummary,
  dashboardStats as mockDashboardStats,
} from '../mock/earnings'
import {
  loadPartnerOnboarding,
  savePartnerOnboarding,
  watchPartnerAccount,
} from '../services/partnerOnboarding'
import {
  deliveryDocumentId,
  publishPartnerAvailability,
  publishPartnerLocation,
  type PartnerLocation,
} from '../services/deliverySync'
import {
  acceptAssignedDelivery,
  advanceDeliveryStatus,
  cancelActiveDelivery,
  completeDeliveryWithOtp,
  publishDeliveryLocation,
  rejectAssignedDelivery,
  subscribePartnerDeliveries,
} from '../services/deliveryRequests'
import { usePartnerTracking } from '../hooks/usePartnerTracking'
import type { AppNotification } from '../types/notification'
import type {
  OnboardingFiles,
  OnboardingState,
  OnboardingStatus,
  SubmitOnboardingOptions,
} from '../types/onboarding'
import type { SupportTicket } from '../types/support'
import type { Delivery, DeliveryLocation } from '../types/delivery'
import { publishSupportTicket } from '../services/supportTickets'
import { todayDateString } from '../utils/date'
import {
  notifyIfBackground,
  requestNotificationPermission,
} from '../utils/browserNotifications'
import { translate } from '../i18n/translations'
import { isCompleteApplication } from '../utils/onboardingValidation'
import { AppContext } from './app-store'
import type { DashboardStats } from './app-store'
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

/**
 * A local record qualifies for restoration when it was actually submitted, or
 * when an earlier draft reset stripped the submitted flag but left every
 * mandatory field valid. The reset also forced the wizard to step 0, while an
 * unfinished application keeps the step the partner was editing.
 */
function hasSubmittedLocalApplication(state: OnboardingState): boolean {
  if (state.status !== 'draft' && Boolean(state.submittedAt)) {
    return true
  }

  return state.step === 0 && isCompleteApplication(state)
}

/** Resets a live account with no remote application to a fresh wizard. */
function draftOnboarding(state: OnboardingState): OnboardingState {
  const wasSubmitted = state.status !== 'draft' || Boolean(state.submittedAt)

  return {
    ...state,
    step: wasSubmitted ? 0 : state.step,
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
}

/** Active-delivery statuses: everything between offer and a final outcome. */
function isActiveStatus(delivery: Delivery): boolean {
  return !['assigned', 'delivered', 'cancelled'].includes(delivery.status)
}

/** Newest first, using the completion time with sensible fallbacks. */
function historySort(left: Delivery, right: Delivery): number {
  const leftAt = left.completedAt ?? left.acceptedAt ?? left.requestedAt
  const rightAt = right.completedAt ?? right.acceptedAt ?? right.requestedAt

  return rightAt.localeCompare(leftAt)
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
  // The local reducer only drives the offline prototype. A live account keeps
  // every delivery in Firestore, so mock requests can never leak into the
  // production flow.
  const [demoDeliveries, dispatch] = useReducer(deliveryReducer, remoteEnabled
    ? { requests: [], activeDelivery: null, history: [] }
    : {
        requests: initialRequests,
        activeDelivery: null,
        history: initialHistory,
      })
  const [liveDeliveries, setLiveDeliveries] = useState<Delivery[]>([])
  const [liveLocations, setLiveLocations] = useState<
    Record<string, DeliveryLocation | null>
  >({})
  const [liveLoaded, setLiveLoaded] = useState(false)
  const [isOnline, setOnlineState] = useState(false)
  // Demo fixtures are the offline prototype's content. A live account starts
  // with empty lists so a brand-new number never sees demo data; real records
  // arrive from Firestore.
  const [notifications, setNotifications] = useState<AppNotification[]>(
    remoteEnabled ? [] : initialNotifications,
  )
  const [tickets, setTickets] = useState<SupportTicket[]>(
    remoteEnabled ? [] : initialTickets,
  )
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const local = readOnboarding(phone)

    if (!unverifiedDemoSession) {
      // A live account is reconciled with Firestore while the gate shows its
      // loading state; keeping the local copy first lets a submitted
      // application be restored into a newly created stable account.
      return local
    }

    // A demo fallback while Firebase is configured has no verified
    // application, so it must start the wizard until a real submission exists.
    // Preserve draft progress, but reset a locally submitted application back
    // to the first step.
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
  const [deliveryActionPending, setDeliveryActionPending] = useState<
    string | null
  >(null)
  const [deliveryActionPendingId, setDeliveryActionPendingId] = useState<
    string | null
  >(null)
  const [deliveryActionError, setDeliveryActionError] = useState<string | null>(
    null,
  )
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
    if (!phone || isLoading) {
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
  }, [onboarding, phone, isLoading])

  useEffect(() => {
    if (!remoteEnabled || !uid) {
      return
    }

    const accountUid = uid
    const accountPhone = phone
    let active = true
    const local = readOnboarding(accountPhone)

    async function loadOrRestore() {
      const remote = await loadPartnerOnboarding(accountUid)

      if (!active) {
        return
      }

      if (remote) {
        // Firestore is authoritative for a live account. Set the complete
        // application together with the loading flag so the gate cannot see
        // the temporary draft state and redirect an already-registered
        // partner to the data-entry wizard.
        setOnboarding(remote)
        setLiveSyncError(null)
        setIsLoading(false)
        return
      }

      // The account has no remote application, but this device holds a
      // submitted one for the same number. This happens after the old demo
      // bridge orphaned an anonymous account by switching numbers, or when a
      // stable account was created after clearing the browser's Firebase
      // session. Restore the submission instead of reopening the wizard with
      // the same data.
      if (accountPhone && hasSubmittedLocalApplication(local)) {
        try {
          await savePartnerOnboarding({
            uid: accountUid,
            phone: accountPhone,
            state: local,
            files: { documents: {} },
            skipUploads: true,
          })

          const restored = await loadPartnerOnboarding(accountUid)

          if (!active) {
            return
          }

          setOnboarding(
            restored ?? {
              ...local,
              status: 'submitted',
              submittedAt: local.submittedAt ?? new Date().toISOString(),
              accountStatus: 'pending',
            },
          )
          setLiveSyncError(null)
          setIsLoading(false)
          return
        } catch {
          if (!active) {
            return
          }

          // Keep the partner out of the wizard, but show an unverified state
          // until the submission reaches Firestore. Retry re-runs this effect.
          setOnboarding({
            ...local,
            status: 'submitted',
            accountStatus: 'pending',
          })
          setLiveSyncError(
            'Your application is saved on this device but could not be restored to Firebase. Check your connection and retry.',
          )
          setIsLoading(false)
          return
        }
      }

      // A genuinely new account starts the mandatory wizard.
      setOnboarding(draftOnboarding(local))
      setIsLoading(false)
    }

    void loadOrRestore().catch(() => {
      if (!active) {
        return
      }

      // An unavailable read must not reopen the wizard with submitted data.
      // Keep the local state and surface the failure with a retry action.
      if (hasSubmittedLocalApplication(local)) {
        setOnboarding({
          ...local,
          status: 'submitted',
          accountStatus: 'pending',
        })
        setLiveSyncError(
          'Could not verify your application with Firebase. Check your connection and retry.',
        )
      } else {
        setOnboarding(draftOnboarding(local))
        setLiveSyncError(
          'Could not load your application from Firebase. Check your connection and retry.',
        )
      }

      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [remoteEnabled, uid, phone, liveRetryToken])

  // Real-event notifications for live sessions: the first delivery snapshot
  // and account snapshot are baselines, and every later change the partner did
  // not make themselves becomes an in-app notification.
  const seenDeliveriesRef = useRef(new Map<string, string>())
  const deliveriesBaselinedRef = useRef(false)
  const lastAccountStatusRef = useRef<string | null>(null)

  const addLiveNotifications = useCallback((items: AppNotification[]) => {
    if (items.length === 0) {
      return
    }

    const first = items[0]
    notifyIfBackground(
      translate('en', first.title, first.vars),
      translate('en', first.body, first.vars),
    )

    setNotifications((current) => {
      const known = new Set(current.map((item) => item.id))
      const additions = items.filter((item) => !known.has(item.id))

      return additions.length > 0
        ? [...additions, ...current].slice(0, 30)
        : current
    })
  }, [])

  // A ref keeps the stale-snapshot guard without a mutable closure variable.
  const accountWatcherActiveRef = useRef(true)
  const deliveriesWatcherActiveRef = useRef(true)

  useEffect(() => {
    if (!remoteEnabled || !uid) {
      return
    }

    accountWatcherActiveRef.current = true
    let unsubscribe: (() => void) | null = null
    let reportTimer: number | undefined

    try {
      unsubscribe = watchPartnerAccount(
        uid,
        (snapshot) => {
          if (!accountWatcherActiveRef.current) {
            return
          }

          setLiveSyncError(null)

          // Administrator decisions become notifications. The first snapshot
          // only records the baseline so a reload never replays old decisions.
          const previousStatus = lastAccountStatusRef.current
          lastAccountStatusRef.current = snapshot.accountStatus

          if (previousStatus !== null && previousStatus !== snapshot.accountStatus) {
            if (snapshot.accountStatus === 'active') {
              addLiveNotifications([
                {
                  id: `live-account-active-${snapshot.statusUpdatedAt ?? ''}`,
                  type: 'account',
                  title: 'Your account was approved',
                  body: 'You can now go online and receive delivery requests.',
                  at: new Date().toISOString(),
                  isRead: false,
                },
              ])
            } else if (snapshot.accountStatus === 'paused') {
              addLiveNotifications([
                {
                  id: `live-account-paused-${snapshot.statusUpdatedAt ?? ''}`,
                  type: 'account',
                  title: 'Your account was suspended',
                  body: '{reason} Check the Profile page for details.',
                  vars: { reason: snapshot.suspensionReason ?? '' },
                  at: new Date().toISOString(),
                  isRead: false,
                },
              ])
            }
          }

          setOnboarding((current) => {
            const hasSubmittedApplication =
              snapshot.applicationStatus !== 'draft' ||
              Boolean(snapshot.submittedAt)

            // A stale sign-in snapshot must not move a submitted partner back
            // into the data-entry wizard.
            if (!hasSubmittedApplication && current.status !== 'draft') {
              return current
            }

            return {
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
              step: hasSubmittedApplication ? 0 : current.step,
            }
          })
        },
        () => {
          if (accountWatcherActiveRef.current) {
            setLiveSyncError(
              'Live Administrator updates are unavailable. Check your connection and retry.',
            )
          }
        },
      )
    } catch {
      // Defer the fallback so mounting does not trigger a second render.
      reportTimer = window.setTimeout(() => {
        if (accountWatcherActiveRef.current) {
          setLiveSyncError(
            'Live Administrator updates are unavailable. Check your connection and retry.',
          )
        }
      }, 0)
    }

    return () => {
      accountWatcherActiveRef.current = false
      window.clearTimeout(reportTimer)
      unsubscribe?.()
    }
  }, [remoteEnabled, uid, liveRetryToken, addLiveNotifications])

  const retryLiveSync = useCallback(() => {
    setLiveSyncError(null)
    setLiveRetryToken((value) => value + 1)
  }, [])

  // Live subscription to the deliveries assigned to this partner. Firestore
  // rules limit the query to the signed-in UID, so assigned requests arrive
  // without polling and no other partner's deliveries can appear here. The
  // provider remounts per session UID, so demo sessions simply never start it.
  useEffect(() => {
    if (!remoteEnabled || !uid) {
      return
    }

    deliveriesWatcherActiveRef.current = true

    const unsubscribe = subscribePartnerDeliveries(
      uid,
      (snapshot) => {
        if (!deliveriesWatcherActiveRef.current) {
          return
        }

        setLiveDeliveries(snapshot.deliveries)
        setLiveLocations(snapshot.locations)
        setLiveLoaded(true)
        setDeliverySyncError(null)

        // Turn snapshot changes the partner did not make themselves into
        // notifications. The first snapshot is the baseline, so reloading the
        // app never replays old events.
        const seen = seenDeliveriesRef.current
        const fresh: AppNotification[] = []

        if (!deliveriesBaselinedRef.current) {
          for (const delivery of snapshot.deliveries) {
            seen.set(delivery.id, delivery.status)
          }
          deliveriesBaselinedRef.current = true
          return
        }

        const currentIds = new Set(snapshot.deliveries.map((d) => d.id))

        for (const delivery of snapshot.deliveries) {
          const previous = seen.get(delivery.id)
          seen.set(delivery.id, delivery.status)

          if (previous === undefined && delivery.status === 'assigned') {
            fresh.push({
              id: `live-${delivery.id}-assigned`,
              type: 'request',
              title: 'New delivery request {id}',
              body: '{category} · {pickup} to {drop}. Accept before it expires.',
              vars: {
                id: delivery.id,
                category: delivery.category,
                pickup: delivery.pickup.name,
                drop: delivery.destination.name,
              },
              at: new Date().toISOString(),
              isRead: false,
            })
            // Ask once for browser alerts so background offers can surface.
            void requestNotificationPermission()
            continue
          }

          if (
            previous !== undefined &&
            previous !== 'cancelled' &&
            delivery.status === 'cancelled'
          ) {
            fresh.push({
              id: `live-${delivery.id}-cancelled`,
              type: 'delivery',
              title: 'Delivery {id} was cancelled',
              body: '{reason}',
              vars: {
                id: delivery.id,
                reason: delivery.cancellationReason ?? '',
              },
              at: new Date().toISOString(),
              isRead: false,
            })
          }
        }

        for (const [id, status] of seen) {
          if (currentIds.has(id)) {
            continue
          }

          seen.delete(id)

          if (status === 'assigned') {
            fresh.push({
              id: `live-${id}-gone`,
              type: 'request',
              title: 'The offer for {id} is no longer available',
              body: 'This request expired or was assigned to another partner.',
              vars: { id },
              at: new Date().toISOString(),
              isRead: false,
            })
          }
        }

        addLiveNotifications(fresh)
      },
      (error) => {
        if (!deliveriesWatcherActiveRef.current) {
          return
        }

        setLiveLoaded(true)
        setDeliverySyncError(error.message)
      },
    )

    return () => {
      deliveriesWatcherActiveRef.current = false
      unsubscribe()
    }
  }, [remoteEnabled, uid, deliveryRetryToken, addLiveNotifications])

  // Live mode derives every list from Firestore; demo mode keeps the reducer.
  const requests = useMemo(() => {
    if (!remoteEnabled) {
      return demoDeliveries.requests
    }

    return liveDeliveries.filter(
      (delivery) => delivery.status === 'assigned' && !delivery.partnerResponse,
    )
  }, [remoteEnabled, demoDeliveries.requests, liveDeliveries])

  const activeDelivery = useMemo(() => {
    if (!remoteEnabled) {
      return demoDeliveries.activeDelivery
    }

    return liveDeliveries.find(isActiveStatus) ?? null
  }, [remoteEnabled, demoDeliveries.activeDelivery, liveDeliveries])

  const history = useMemo(() => {
    if (!remoteEnabled) {
      return demoDeliveries.history
    }

    return liveDeliveries
      .filter((delivery) => !isActiveStatus(delivery))
      .sort(historySort)
  }, [remoteEnabled, demoDeliveries.history, liveDeliveries])

  // Headline dashboard figures. Live sessions compute them from real
  // deliveries completed today and show no rating until one exists; the
  // offline prototype keeps its labelled demo figures.
  const dashboardStats = useMemo<DashboardStats>(() => {
    if (!remoteEnabled) {
      return {
        deliveriesToday: earningsSummary.deliveriesToday,
        earningsToday: earningsSummary.today,
        rating: mockDashboardStats.rating,
      }
    }

    const today = todayDateString()
    const todays = history.filter(
      (delivery) =>
        delivery.status === 'delivered' &&
        delivery.completedAt !== undefined &&
        new Date(delivery.completedAt).toDateString() === today,
    )

    return {
      deliveriesToday: todays.length,
      earningsToday: todays.reduce((sum, delivery) => sum + delivery.earnings, 0),
      rating: null,
    }
  }, [remoteEnabled, history])

  const retryDeliverySync = useCallback(() => {
    setDeliverySyncError(null)
    setDeliveryActionError(null)
    setDeliveryRetryToken((value) => value + 1)
  }, [])

  /**
   * Runs one delivery action against Firestore, surfacing a single pending
   * flag and one actionable error message. The boolean return lets screens
   * navigate only when the change actually landed.
   */
  const runDeliveryAction = useCallback(
    async (
      action: string,
      id: string | null,
      run: () => Promise<void | boolean>,
    ): Promise<boolean> => {
      setDeliveryActionPending(action)
      setDeliveryActionPendingId(id)
      setDeliveryActionError(null)

      try {
        const result = await run()
        return result !== false
      } catch (error) {
        setDeliveryActionError(
          error instanceof Error ? error.message : 'The delivery update failed. Try again.',
        )
        return false
      } finally {
        setDeliveryActionPending(null)
        setDeliveryActionPendingId(null)
      }
    },
    [],
  )

  const acceptRequest = useCallback(
    (id: string) => {
      const request = requests.find((item) => item.id === id)

      if (!request) {
        setDeliveryActionError(
          'This request is no longer in the list. Refresh to see the latest requests.',
        )
        return Promise.resolve(false)
      }

      // Offline prototype: the reducer keeps the local state consistent.
      if (!uid || uid.startsWith('demo:')) {
        if (activeDelivery) {
          setDeliveryActionError(
            'Finish your active delivery before accepting another request.',
          )
          return Promise.resolve(false)
        }

        dispatch({ type: 'accept', id, at: new Date().toISOString() })
        return Promise.resolve(true)
      }

      if (activeDelivery) {
        setDeliveryActionError(
          'Finish your active delivery before accepting another request.',
        )
        return Promise.resolve(false)
      }

      return runDeliveryAction('accept', id, () =>
        acceptAssignedDelivery(uid, request),
      )
    },
    [requests, activeDelivery, runDeliveryAction, uid],
  )

  const rejectRequest = useCallback(
    (id: string) => {
      const request = requests.find((item) => item.id === id)

      if (!request) {
        return Promise.resolve()
      }

      if (!uid || uid.startsWith('demo:')) {
        dispatch({ type: 'reject', id })
        return Promise.resolve()
      }

      return runDeliveryAction('reject', id, () =>
        rejectAssignedDelivery(uid, request),
      ).then(() => undefined)
    },
    [requests, runDeliveryAction, uid],
  )

  const advanceDelivery = useCallback(() => {
    const delivery = activeDelivery

    if (!delivery) {
      return Promise.resolve(false)
    }

    if (!uid || uid.startsWith('demo:')) {
      dispatch({ type: 'advance', at: new Date().toISOString() })
      return Promise.resolve(true)
    }

    return runDeliveryAction('advance', null, () =>
      advanceDeliveryStatus(uid, delivery),
    )
  }, [activeDelivery, runDeliveryAction, uid])

  const completeDelivery = useCallback(
    (otp: string) => {
      const delivery = activeDelivery

      if (!delivery) {
        return Promise.resolve(false)
      }

      // Offline prototype (no Firebase session, or a device-only fallback):
      // verify against the delivery's demo code locally.
      if (!uid || uid.startsWith('demo:')) {
        if (delivery.status !== 'drop_arrived') {
          return Promise.resolve(false)
        }

        if (otp.trim() !== (delivery.dropOtp ?? DEMO_PROOF_OTP)) {
          return Promise.resolve(false)
        }

        dispatch({ type: 'complete', at: new Date().toISOString() })
        return Promise.resolve(true)
      }

      return runDeliveryAction('complete', null, () =>
        completeDeliveryWithOtp(uid, delivery, otp),
      )
    },
    [activeDelivery, runDeliveryAction, uid],
  )

  const cancelDelivery = useCallback(
    (reason: string) => {
      const delivery = activeDelivery

      if (!delivery) {
        return Promise.resolve(false)
      }

      if (!uid || uid.startsWith('demo:')) {
        dispatch({
          type: 'cancel',
          reason,
          at: new Date().toISOString(),
        })
        return Promise.resolve(true)
      }

      return runDeliveryAction('cancel', null, () =>
        cancelActiveDelivery(uid, delivery, reason),
      )
    },
    [activeDelivery, runDeliveryAction, uid],
  )

  // Availability is read by the presence interval without re-subscribing GPS
  // every time a delivery starts or ends.
  const hasActiveDeliveryRef = useRef(false)

  useEffect(() => {
    hasActiveDeliveryRef.current = activeDelivery !== null
  }, [activeDelivery])

  // Reflect Available ↔ On Delivery immediately when a delivery starts or
  // ends, instead of waiting up to a minute for the next presence tick.
  useEffect(() => {
    if (!remoteEnabled || !uid || !isOnline || isLoading) {
      return
    }

    void publishPartnerAvailability(
      uid,
      activeDelivery !== null ? 'On Delivery' : 'Available',
    ).catch(() => {
      // The next presence tick retries the availability flag.
    })
  }, [remoteEnabled, uid, isOnline, isLoading, activeDelivery])

  // Share the partner's availability and last known position while they are
  // online. This is best-effort: a denied permission never blocks deliveries.
  // Wait until the first Firestore read has settled: a merge write started
  // before that read can surface as a location-only document locally and make
  // a submitted partner look like a brand-new sign-in, which sends them to the
  // wizard.
  useEffect(() => {
    if (!remoteEnabled || !uid || isLoading) {
      return
    }

    if (!isOnline) {
      void publishPartnerLocation(uid, null, false, 'Offline').catch(() => {
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

          void publishPartnerLocation(
            uid,
            location,
            true,
            hasActiveDeliveryRef.current ? 'On Delivery' : 'Available',
          ).catch(() => {
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
      void publishPartnerLocation(uid, null, false, 'Offline').catch(() => {
        // The next sign-in can correct a stale online flag.
      })
    }
  }, [remoteEnabled, uid, isOnline, isLoading])

  // Active-delivery GPS tracking. The hook throttles publishes by time and
  // movement; each accepted fix is written to the shared delivery document so
  // delivery_admin sees the partner's latest position.
  const handleTrackingPublish = useCallback(
    (location: PartnerLocation) => {
      const delivery = activeDelivery

      if (!delivery || !uid || uid.startsWith('demo:')) {
        return
      }

      void publishDeliveryLocation(delivery, location)
        .then(() => setDeliverySyncError(null))
        .catch((error: unknown) => {
          setDeliverySyncError(
            error instanceof Error
              ? error.message
              : 'Your location could not be shared with operations. It will retry automatically.',
          )
        })
    },
    [activeDelivery, uid],
  )

  const { status: trackingStatus, position: trackingPosition } =
    usePartnerTracking({
      enabled: activeDelivery !== null,
      onPublish: handleTrackingPublish,
    })

  // The partner marker prefers this device's GPS fix; when sharing is denied
  // or paused, the last position stored on the delivery document still shows
  // where the partner was last seen.
  const trackingLocation: DeliveryLocation | null =
    trackingPosition ??
    (activeDelivery
      ? liveLocations[deliveryDocumentId(activeDelivery.id)] ?? null
      : null)

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
    void publishSupportTicket(uid ?? '', ticket).catch(() => {
      // The local ticket remains visible if the network is unavailable.
    })
  }, [uid])

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
      isLiveSession: remoteEnabled,
      dashboardStats,
      requests,
      activeDelivery,
      history,
      acceptRequest,
      rejectRequest,
      advanceDelivery,
      completeDelivery,
      cancelDelivery,
      deliveryActionPending,
      deliveryActionPendingId,
      deliveryActionError,
      deliveryRequestsLoading: remoteEnabled && !liveLoaded,
      trackingStatus,
      trackingPosition: trackingLocation,
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
      remoteEnabled,
      dashboardStats,
      requests,
      activeDelivery,
      history,
      acceptRequest,
      rejectRequest,
      advanceDelivery,
      completeDelivery,
      cancelDelivery,
      deliveryActionPending,
      deliveryActionPendingId,
      deliveryActionError,
      liveLoaded,
      trackingStatus,
      trackingLocation,
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
