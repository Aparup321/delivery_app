import {
  RecaptchaVerifier,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
} from 'firebase/auth'
import type { ConfirmationResult, User } from 'firebase/auth'
import { auth } from '../firebase'
import { getFirebaseErrorCode } from '../utils/firebaseError'

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container'

export interface FirebaseAuthUser {
  uid: string
  phoneNumber: string | null
  lastSignInTime: string | null
}

let confirmationResult: ConfirmationResult | null = null
let recaptchaVerifier: RecaptchaVerifier | null = null
/**
 * Mobile number typed on the login screen while the demo OTP flow runs. The
 * anonymous Firebase user carries no phone number, so it is reported back to
 * AuthProvider through this value.
 */
let pendingPhone: string | null = null

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.')
  }

  return auth
}

function getRecaptchaVerifier() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      requireAuth(),
      RECAPTCHA_CONTAINER_ID,
      { size: 'invisible' },
    )
  }

  return recaptchaVerifier
}

function clearRecaptchaWidget() {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear()
    } catch {
      // The widget may already have been removed by the browser.
    }
    recaptchaVerifier = null
  }
}

function resetRecaptcha() {
  confirmationResult = null
  clearRecaptchaWidget()
}

/** Sends a Firebase phone-auth SMS to an Indian 10-digit mobile number. */
export async function sendPhoneOtp(phone: string): Promise<void> {
  try {
    confirmationResult = await signInWithPhoneNumber(
      requireAuth(),
      `+91${phone}`,
      getRecaptchaVerifier(),
    )
    clearRecaptchaWidget()
  } catch (error) {
    resetRecaptcha()
    throw error
  }
}

/** Confirms the SMS code. AuthProvider receives the signed-in user. */
export async function confirmPhoneOtp(code: string): Promise<void> {
  if (!confirmationResult) {
    const error = new Error('No phone verification is in progress.')
    Object.assign(error, { code: 'auth/no-confirmation' })
    throw error
  }

  await confirmationResult.confirm(code)
  confirmationResult = null
}

export interface DemoPartnerSession {
  uid: string
  phone: string
  signedInAt: string
}

/**
 * Signs the demo-OTP partner in to Firebase without running the SMS flow.
 *
 * The demo OTP stays the default verification path until the project's own
 * OTP API is connected. The anonymous session keeps a real Firebase UID so
 * Firestore and Storage continue to enforce the uid-based Security Rules, and
 * proves that Auth, Firestore and Storage are reachable. Resolves to null when
 * Firebase is not configured; throws when the anonymous provider is
 * unavailable so callers can fall back to the local demo session.
 */
export async function signInDemoPartner(
  phone: string,
): Promise<DemoPartnerSession | null> {
  if (!auth) {
    return null
  }

  const firebaseAuth = requireAuth()

  // A stale session would make the anonymous sign-in replace it mid-flight.
  if (firebaseAuth.currentUser) {
    await signOut(firebaseAuth)
  }

  pendingPhone = phone

  try {
    const credential = await signInAnonymously(firebaseAuth)

    // Anonymous users have no phone number field, so put the verified demo
    // number in the display name. It is visible in Authentication → Users as
    // soon as the partner signs in.
    try {
      await updateProfile(credential.user, { displayName: `+91${phone}` })
    } catch {
      // The display name is cosmetic; the session itself is still valid.
    }

    // The caller sets the session from this value, so it does not have to wait
    // for the next auth-state callback before navigating.
    return {
      uid: credential.user.uid,
      phone,
      signedInAt: new Date().toISOString(),
    }
  } catch (error) {
    pendingPhone = null
    throw error
  }
}

export async function signOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth)
  }
  pendingPhone = null
}

export function subscribeToAuth(
  onChange: (user: FirebaseAuthUser | null) => void,
): () => void {
  if (!auth) {
    onChange(null)
    return () => undefined
  }

  return onAuthStateChanged(
    auth,
    (user: User | null) => {
      onChange(
        user
          ? {
              uid: user.uid,
              // Anonymous demo sessions carry no phone number; report the
              // number typed on the login screen instead.
              phoneNumber: user.phoneNumber ?? pendingPhone,
              lastSignInTime: user.metadata.lastSignInTime ?? null,
            }
          : null,
      )
    },
    () => {
      onChange(null)
    },
  )
}

/**
 * Maps Firebase Auth failures to English translation keys. Callers pass the
 * relevant fallback for send and verify failures.
 */
export function getPhoneAuthErrorKey(
  error: unknown,
  fallback = 'Could not verify the code. Try again.',
): string {
  switch (getFirebaseErrorCode(error)) {
    case 'auth/invalid-phone-number':
      return 'Enter a valid mobile number.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Try again later.'
    case 'auth/captcha-check-failed':
      return 'The verification check failed. Refresh the page and try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase.'
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled in Firebase.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/invalid-verification-code':
      return 'That code is not correct. Check the digits and try again.'
    case 'auth/code-expired':
      return 'This code has expired. Resend a new code to continue.'
    case 'auth/no-confirmation':
      return 'No verification is in progress. Send a new code.'
    default:
      return fallback
  }
}
