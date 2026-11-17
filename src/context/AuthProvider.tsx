import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isFirebaseConfigured } from '../firebase/config'
import {
  signInDemoPartner,
  signOutFirebase,
  subscribeToAuth,
} from '../services/auth'
import type { FirebaseAuthUser } from '../services/auth'
import { recordPartnerSignIn } from '../services/partner'
import { loadPartnerApplicationStatus } from '../services/partnerOnboarding'
import { getFirebaseErrorCode } from '../utils/firebaseError'
import { AuthContext } from './auth'
import type { Session } from './auth'

const STORAGE_KEY = 'fafo.partner.session'
/** Remembers the number typed for a Firebase session across reloads. */
const PHONE_KEY_PREFIX = 'fafo.partner.phone'
/**
 * Marks the current tab as already running. A reload keeps this marker (and
 * the signed-in session), while a fresh tab or browser launch starts at login.
 */
const SESSION_MARKER_KEY = 'fafo.partner.session-active'

function hasSessionMarker(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_MARKER_KEY) === '1'
  } catch {
    return false
  }
}

function markSessionActive() {
  try {
    window.sessionStorage.setItem(SESSION_MARKER_KEY, '1')
  } catch {
    // Session storage can be blocked; the in-memory session still works.
  }
}

function clearSessionMarker() {
  try {
    window.sessionStorage.removeItem(SESSION_MARKER_KEY)
  } catch {
    // Nothing to clear when session storage is blocked.
  }
}

function normalizePhone(phone: string | null): string {
  const digits = phone?.replace(/\D/g, '') ?? ''
  return digits.length > 10 ? digits.slice(-10) : digits
}

function createSessionFromFirebaseUser(user: FirebaseAuthUser): Session {
  const lastSignIn = user.lastSignInTime
    ? new Date(user.lastSignInTime)
    : new Date()
  let phone = normalizePhone(user.phoneNumber)

  // Anonymous demo sessions have no phone number; restore the one typed on
  // the login screen so each UID keeps its own draft.
  if (phone) {
    try {
      window.localStorage.setItem(`${PHONE_KEY_PREFIX}.${user.uid}`, phone)
    } catch {
      // Storage can be blocked; the session still works in memory.
    }
  } else {
    try {
      phone =
        window.localStorage.getItem(`${PHONE_KEY_PREFIX}.${user.uid}`) ?? ''
    } catch {
      phone = ''
    }
  }

  return {
    uid: user.uid,
    phone,
    signedInAt: Number.isNaN(lastSignIn.getTime())
      ? new Date().toISOString()
      : lastSignIn.toISOString(),
  }
}

/**
 * The device-only demo has no Firebase record. A partner who already submitted
 * locally can still skip the login screen on a fresh launch, while a draft
 * keeps the documented fresh-launch sign-in rule.
 */
function hasSubmittedLocalApplication(phone: string): boolean {
  try {
    const raw = window.localStorage.getItem(
      `fafo.partner.onboarding.${phone}`,
    )
    if (!raw) {
      return false
    }

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return false
    }

    const candidate = parsed as { status?: unknown; submittedAt?: unknown }
    return (
      (typeof candidate.status === 'string' &&
        candidate.status !== 'draft') ||
      typeof candidate.submittedAt === 'string'
    )
  } catch {
    return false
  }
}

function readStoredSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }

    const candidate = parsed as Partial<Session>
    if (
      typeof candidate.phone !== 'string' ||
      typeof candidate.signedInAt !== 'string'
    ) {
      return null
    }

    const session: Session = {
      uid:
        typeof candidate.uid === 'string' && candidate.uid.length > 0
          ? candidate.uid
          : `demo:${candidate.phone}`,
      phone: candidate.phone,
      signedInAt: candidate.signedInAt,
    }

    if (
      !hasSessionMarker() &&
      (isFirebaseConfigured || !hasSubmittedLocalApplication(session.phone))
    ) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    readStoredSession(),
  )
  const [isReady, setIsReady] = useState(!isFirebaseConfigured)
  const [firebaseErrorCode, setFirebaseErrorCode] = useState<string | null>(null)
  /** False on a fresh launch, true once this tab has an active session. */
  const restoreAllowed = useRef(hasSessionMarker())
  /** Ignores an onboarding check that a new sign-in or sign-out superseded. */
  const restoreCheckToken = useRef(0)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    const control = { active: true }

    const unsubscribe = subscribeToAuth((user) => {
      if (!control.active) {
        return
      }

      if (!user) {
        restoreCheckToken.current += 1
        // A Firebase sign-out must not wipe a local demo session created after
        // the Firebase connection failed. Explicit sign-out clears it below.
        setSession((current) =>
          current && current.uid.startsWith('demo:') ? current : null,
        )
        setIsReady(true)
        return
      }

      if (restoreAllowed.current) {
        restoreCheckToken.current += 1
        setSession(createSessionFromFirebaseUser(user))
        setIsReady(true)
        return
      }

      // Firebase still has a user from an earlier launch. A fresh launch may
      // skip the login screen only when Firestore confirms an onboarding
      // application; a sign-in-only or draft user starts at login instead.
      const token = restoreCheckToken.current + 1
      restoreCheckToken.current = token
      setIsReady(false)

      void loadPartnerApplicationStatus(user.uid)
        .then((status) => {
          if (
            !control.active ||
            token !== restoreCheckToken.current ||
            restoreAllowed.current
          ) {
            return
          }

          if (status && status !== 'draft') {
            restoreAllowed.current = true
            markSessionActive()
            setSession(createSessionFromFirebaseUser(user))
          } else {
            setSession(null)
          }
        })
        .catch(() => {
          // An unavailable status read must not let an unverified session in.
          if (
            control.active &&
            token === restoreCheckToken.current &&
            !restoreAllowed.current
          ) {
            setSession(null)
          }
        })
        .finally(() => {
          if (control.active && token === restoreCheckToken.current) {
            setIsReady(true)
          }
        })
    })

    return () => {
      control.active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    try {
      if (isFirebaseConfigured) {
        // Firebase persists its own session. Remove the old demo key so it
        // cannot resurrect a signed-out partner.
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }

      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Storage can be blocked; the in-memory session still works.
    }
  }, [session])

  /**
   * Creates the anonymous Firebase session used by the demo OTP flow. Records
   * the Firebase error code so the connection banner can show why it failed.
   */
  const connectToFirebase = useCallback(async (phone: string) => {
    if (!isFirebaseConfigured) {
      return false
    }

    // This tab is signing in deliberately, so its Firebase session may be
    // restored on the next reload.
    restoreAllowed.current = true
    markSessionActive()
    setFirebaseErrorCode(null)

    try {
      const firebaseSession = await signInDemoPartner(phone)

      if (!firebaseSession) {
        return false
      }

      // Remember the number for this UID so a reload can restore it. Anonymous
      // Firebase users do not carry a phone number of their own.
      try {
        window.localStorage.setItem(
          `${PHONE_KEY_PREFIX}.${firebaseSession.uid}`,
          firebaseSession.phone,
        )
      } catch {
        // Storage can be blocked; the in-memory session still works.
      }

      setSession(firebaseSession)

      // Leave a visible record in Firestore immediately, not only after the
      // onboarding form is submitted. A failure here must not block sign-in.
      void recordPartnerSignIn(firebaseSession).catch((error) => {
        console.warn(
          '[auth] Could not record the sign-in in Firestore.',
          error,
        )
      })

      return true
    } catch (error) {
      const code = getFirebaseErrorCode(error) ?? 'auth/unknown'
      setFirebaseErrorCode(code)
      console.warn(
        `[auth] Firebase connection failed (${code}); using the local demo session.`,
        error,
      )
      return false
    }
  }, [])

  const signIn = useCallback(async (phone: string) => {
    // A new sign-in makes this tab an active session, so reloads keep it.
    restoreAllowed.current = true
    markSessionActive()

    // Try the Firebase bridge first so Firestore and Storage receive a real
    // UID. The auth listener sets the session when it succeeds.
    if (isFirebaseConfigured) {
      const connected = await connectToFirebase(phone)

      if (connected) {
        return
      }
    }

    // Fallback for the demo OTP flow: no Firebase configuration, or the
    // anonymous provider is unavailable. The error code stays visible in the
    // connection banner so the setup problem is not silent.
    setSession({
      uid: `demo:${phone}`,
      phone,
      signedInAt: new Date().toISOString(),
    })
  }, [connectToFirebase])

  const retryFirebaseConnection = useCallback(async () => {
    const phone = session?.phone

    if (!phone || !isFirebaseConfigured) {
      return false
    }

    return connectToFirebase(phone)
  }, [session?.phone, connectToFirebase])

  const signOut = useCallback(async () => {
    restoreAllowed.current = false
    clearSessionMarker()
    try {
      if (isFirebaseConfigured) {
        await signOutFirebase()
      }
    } finally {
      setFirebaseErrorCode(null)
      setSession(null)
    }
  }, [])

  const firebase = useMemo(
    () => ({
      enabled: isFirebaseConfigured,
      connected: Boolean(session && !session.uid.startsWith('demo:')),
      errorCode: firebaseErrorCode,
    }),
    [session, firebaseErrorCode],
  )

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      isReady,
      signIn,
      retryFirebaseConnection,
      firebase,
      signOut,
    }),
    [session, isReady, signIn, retryFirebaseConnection, firebase, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
