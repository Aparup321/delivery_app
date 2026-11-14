import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isFirebaseConfigured } from '../firebase/config'
import {
  signInDemoPartner,
  signOutFirebase,
  subscribeToAuth,
} from '../services/auth'
import { recordPartnerSignIn } from '../services/partner'
import { getFirebaseErrorCode } from '../utils/firebaseError'
import { AuthContext } from './auth'
import type { Session } from './auth'

const STORAGE_KEY = 'fafo.partner.session'
/** Remembers the number typed for a Firebase session across reloads. */
const PHONE_KEY_PREFIX = 'fafo.partner.phone'

function normalizePhone(phone: string | null): string {
  const digits = phone?.replace(/\D/g, '') ?? ''
  return digits.length > 10 ? digits.slice(-10) : digits
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

    return {
      uid:
        typeof candidate.uid === 'string' && candidate.uid.length > 0
          ? candidate.uid
          : `demo:${candidate.phone}`,
      phone: candidate.phone,
      signedInAt: candidate.signedInAt,
    }
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

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        const lastSignIn = user.lastSignInTime
          ? new Date(user.lastSignInTime)
          : new Date()
        let phone = normalizePhone(user.phoneNumber)

        // Anonymous demo sessions have no phone number; restore the one typed
        // on the login screen so each UID keeps its own draft.
        if (phone) {
          try {
            window.localStorage.setItem(`${PHONE_KEY_PREFIX}.${user.uid}`, phone)
          } catch {
            // Storage can be blocked; the session still works in memory.
          }
        } else {
          try {
            phone =
              window.localStorage.getItem(`${PHONE_KEY_PREFIX}.${user.uid}`) ??
              ''
          } catch {
            phone = ''
          }
        }

        setSession({
          uid: user.uid,
          phone,
          signedInAt: Number.isNaN(lastSignIn.getTime())
            ? new Date().toISOString()
            : lastSignIn.toISOString(),
        })
      } else {
        setSession(null)
      }
      setIsReady(true)
    })

    return unsubscribe
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
