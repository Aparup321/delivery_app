import {
  EmailAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
} from 'firebase/auth'
import type { ConfirmationResult, User } from 'firebase/auth'
import { auth } from '../firebase'
import { getFirebaseErrorCode } from '../utils/firebaseError'
import { loadPartnerPhone } from './partner'

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container'
/** Anonymous users have no phone number; remember which number owns the UID. */
export const PHONE_STORAGE_PREFIX = 'fafo.partner.phone'

function normalizePhone(phone: string | null): string {
  const digits = phone?.replace(/\D/g, '') ?? ''
  return digits.length > 10 ? digits.slice(-10) : digits
}

function storedPhoneForUid(uid: string): string {
  try {
    return normalizePhone(
      window.localStorage.getItem(`${PHONE_STORAGE_PREFIX}.${uid}`),
    )
  } catch {
    return ''
  }
}

function rememberPhone(uid: string, phone: string): void {
  try {
    window.localStorage.setItem(
      `${PHONE_STORAGE_PREFIX}.${uid}`,
      normalizePhone(phone),
    )
  } catch {
    // Storage can be blocked; the in-memory session still works.
  }
}

export interface FirebaseAuthUser {
  uid: string
  phoneNumber: string | null
  email: string | null
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
  /** True when an existing account was reused for the same number. */
  reused?: boolean
}

/**
 * Demo-only stable identity. Anonymous Firebase accounts cannot be recovered
 * once the device switches to another number: signing in again would create a
 * new UID and orphan the submitted application. An Email/Password account
 * derived from the verified number keeps one UID per number across sign-outs,
 * number switches, browser restarts and devices.
 *
 * The fixed password is a demo bridge with the same trust level as the fixed
 * demo OTP. It is not a real credential; the phone-SMS path in this file
 * replaces it when the OTP API is connected.
 */
const DEMO_ACCOUNT_EMAIL_DOMAIN = 'fafo-demo.app'
const DEMO_ACCOUNT_PASSWORD = 'FafoDemoPartner!2026'

function demoAccountEmail(phone: string): string {
  return `p${normalizePhone(phone)}@${DEMO_ACCOUNT_EMAIL_DOMAIN}`
}

/** Recovers the number from a stable demo account after local storage clears. */
export function demoPhoneFromEmail(email: string | null): string | null {
  if (!email) {
    return null
  }

  const match = email.match(
    new RegExp(`^p(\\d{10})@${DEMO_ACCOUNT_EMAIL_DOMAIN.replace('.', '\\.')}$`),
  )
  return match ? match[1] : null
}

function isMissingEmailAccount(error: unknown): boolean {
  const code = getFirebaseErrorCode(error)
  return (
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password'
  )
}

function isEmailInUse(error: unknown): boolean {
  const code = getFirebaseErrorCode(error)
  return (
    code === 'auth/email-already-in-use' ||
    code === 'auth/credential-already-in-use'
  )
}

function isEmailProviderDisabled(error: unknown): boolean {
  return getFirebaseErrorCode(error) === 'auth/operation-not-allowed'
}

async function applyDemoProfile(user: User, phone: string): Promise<void> {
  try {
    // The number is visible in Authentication → Users for support and demos.
    await updateProfile(user, { displayName: `+91${normalizePhone(phone)}` })
  } catch {
    // The display name is cosmetic; the session itself is still valid.
  }
}

function demoSession(
  user: User,
  phone: string,
  reused: boolean,
): DemoPartnerSession {
  pendingPhone = phone
  rememberPhone(user.uid, phone)
  return {
    uid: user.uid,
    phone,
    signedInAt: new Date().toISOString(),
    reused,
  }
}

/**
 * Fallback for a Firebase project where the Email/Password provider is turned
 * off. It preserves the old anonymous behaviour so the demo still works.
 */
async function signInAnonymousPartner(
  phone: string,
): Promise<DemoPartnerSession> {
  const firebaseAuth = requireAuth()
  const normalizedPhone = normalizePhone(phone)
  const currentUser = firebaseAuth.currentUser

  if (currentUser) {
    const currentPhone =
      storedPhoneForUid(currentUser.uid) ||
      normalizePhone(currentUser.phoneNumber)

    if (currentPhone === normalizedPhone) {
      return demoSession(currentUser, phone, true)
    }

    await signOut(firebaseAuth)
  }

  pendingPhone = phone

  try {
    const credential = await signInAnonymously(firebaseAuth)
    await applyDemoProfile(credential.user, phone)
    return demoSession(credential.user, phone, false)
  } catch (error) {
    pendingPhone = null
    throw error
  }
}

/**
 * Signs the demo-OTP partner in to Firebase without running the SMS flow.
 *
 * The demo OTP stays the default verification path until the project's own
 * OTP API is connected. The session keeps a real Firebase UID so Firestore and
 * Storage continue to enforce the uid-based Security Rules, and proves that
 * Auth, Firestore and Storage are reachable. Resolves to null when Firebase is
 * not configured; throws when every provider is unavailable so callers can fall
 * back to the local demo session.
 *
 * An existing anonymous account is linked to the number's Email/Password
 * credential instead of being replaced, so its UID, Firestore documents and
 * Administrator decisions survive. Returning numbers sign in to that stable
 * account, including after another number was used on the same device.
 */
export async function signInDemoPartner(
  phone: string,
): Promise<DemoPartnerSession | null> {
  if (!auth) {
    return null
  }

  const firebaseAuth = requireAuth()
  const normalizedPhone = normalizePhone(phone)
  const email = demoAccountEmail(normalizedPhone)
  const currentUser = firebaseAuth.currentUser

  // Auth-state callbacks fire before this function resolves. Remember the
  // verified number now so the temporary session is never created without it.
  pendingPhone = phone

  // A real phone-auth session for this number already has the right identity.
  if (currentUser && !currentUser.isAnonymous) {
    const currentPhone =
      normalizePhone(currentUser.phoneNumber) ||
      storedPhoneForUid(currentUser.uid)

    if (currentPhone === normalizedPhone) {
      return demoSession(currentUser, phone, true)
    }
  }

  // Returning number: its stable account already exists.
  try {
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      DEMO_ACCOUNT_PASSWORD,
    )
    await applyDemoProfile(credential.user, normalizedPhone)
    return demoSession(credential.user, phone, true)
  } catch (error) {
    if (isEmailProviderDisabled(error)) {
      return signInAnonymousPartner(phone)
    }

    if (!isMissingEmailAccount(error)) {
      throw error
    }
  }

  // First sign-in after this bridge was added: keep the current anonymous UID
  // by linking the number's credential to it. This preserves every Firestore
  // record and makes the account recoverable from now on.
  if (currentUser?.isAnonymous) {
    let currentPhone =
      storedPhoneForUid(currentUser.uid) ||
      normalizePhone(currentUser.phoneNumber)

    if (!currentPhone) {
      const remotePhone = await loadPartnerPhone(currentUser.uid)

      if (remotePhone === null) {
        // The account may own a submitted application, but its number could
        // not be checked. Never orphan it on an unverified guess.
        const error = new Error(
          'Could not confirm which number owns this Firebase session.',
        )
        Object.assign(error, { code: 'auth/partner-phone-unavailable' })
        throw error
      }

      currentPhone = normalizePhone(remotePhone)
    }

    if (currentPhone === normalizedPhone) {
      try {
        await linkWithCredential(
          currentUser,
          EmailAuthProvider.credential(email, DEMO_ACCOUNT_PASSWORD),
        )
        await applyDemoProfile(currentUser, normalizedPhone)
        return demoSession(currentUser, phone, true)
      } catch (error) {
        if (!isEmailInUse(error)) {
          throw error
        }

        // The account was linked from another tab or device a moment ago.
        const credential = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          DEMO_ACCOUNT_PASSWORD,
        )
        await applyDemoProfile(credential.user, normalizedPhone)
        return demoSession(credential.user, phone, true)
      }
    }
  }

  // A different number is signing in. The previous account keeps its own
  // Email/Password identity and can be recovered when that number returns.
  if (currentUser) {
    await signOut(firebaseAuth)
  }

  pendingPhone = phone

  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      DEMO_ACCOUNT_PASSWORD,
    )
    await applyDemoProfile(credential.user, normalizedPhone)
    return demoSession(credential.user, phone, false)
  } catch (error) {
    if (isEmailProviderDisabled(error)) {
      return signInAnonymousPartner(phone)
    }

    if (isEmailInUse(error)) {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        DEMO_ACCOUNT_PASSWORD,
      )
      await applyDemoProfile(credential.user, normalizedPhone)
      return demoSession(credential.user, phone, true)
    }

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
              // Demo accounts carry no phone number; report the number typed
              // on the login screen or encoded in the stable demo email.
              phoneNumber:
                user.phoneNumber ??
                pendingPhone ??
                demoPhoneFromEmail(user.email),
              email: user.email,
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
