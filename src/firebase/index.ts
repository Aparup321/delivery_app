import { getApp, getApps, initializeApp } from 'firebase/app'
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
