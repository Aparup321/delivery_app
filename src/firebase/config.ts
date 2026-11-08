import type { FirebaseOptions } from 'firebase/app'

const env = import.meta.env

/**
 * Public Firebase Web App configuration.
 *
 * Vite embeds every VITE_* value in the browser bundle. `.env.local` keeps the
 * values out of Git, not out of the browser. These values identify the project
 * and are not secrets; access control belongs in Firebase Authentication and
 * Firestore/Storage Security Rules. Never put service-account credentials,
 * private keys or admin SDK secrets in a VITE_* variable.
 */
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
} satisfies FirebaseOptions
