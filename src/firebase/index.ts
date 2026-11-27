import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check'
import type { AppCheck } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { firebaseConfig, isFirebaseConfigured } from './config'

/**
 * Reuse the existing app during Vite hot reloads instead of initializing a
 * second Firebase app.
 */
export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

/**
 * Optional App Check. It is only enabled when a reCAPTCHA site key is provided,
 * so the demo keeps working without it. Once the key is registered in Firebase
 * Console → App Check and enforcement is turned on for Auth, Firestore and
 * Storage, it rejects traffic that does not come from this app — the closest
 * practical layer to abuse/DDoS protection for a static client.
 */
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

if (import.meta.env.DEV) {
  const debugToken = import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN

  if (debugToken) {
    ;(
      globalThis as typeof globalThis & {
        FIREBASE_APPCHECK_DEBUG_TOKEN?: string
      }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken
  }
}

let appCheckInstance: AppCheck | null = null

if (isFirebaseConfigured && recaptchaSiteKey) {
  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  } catch {
    // A duplicate init during hot reload, or a rejected key, must not stop the
    // app from starting; Firebase still enforces Auth and Security Rules.
    appCheckInstance = null
  }
}

export const appCheck = appCheckInstance

/**
 * Services are null until the Firebase Web App configuration is present. The
 * mock demo remains usable without credentials, as the project requires.
 */
export const auth = isFirebaseConfigured ? getAuth(app) : null
export const db = isFirebaseConfigured ? getFirestore(app) : null

const storageInstance = isFirebaseConfigured ? getStorage(app) : null

/**
 * A missing bucket or a blocked network fails Storage uploads after the SDK's
 * retry window. The defaults are 10 minutes for uploads and 2 minutes for other
 * operations, which would leave the onboarding submit spinner running far too
 * long; cap both so the actionable error appears within about 15 seconds.
 */
if (storageInstance) {
  storageInstance.maxUploadRetryTime = 12_000
  storageInstance.maxOperationRetryTime = 12_000
}

export const storage = storageInstance
