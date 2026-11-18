import { createContext, useContext } from 'react'

export interface Session {
  uid: string
  phone: string
  signedInAt: string
}

export interface FirebaseConnection {
  /** True when the VITE_FIREBASE_* configuration is present. */
  enabled: boolean
  /** True when the session belongs to Firebase instead of the local fallback. */
  connected: boolean
  /** Firebase error code from the last failed connection attempt. */
  errorCode: string | null
}

export interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  /** False until Firebase has restored the persisted session. */
  isReady: boolean
  /**
   * Verifies the demo OTP. When Firebase is configured it also signs in to the
   * stable per-number demo account so Firestore and Storage use a real UID;
   * when that fails, it falls back to a local demo session and records the
   * error.
   */
  signIn: (phone: string) => Promise<void>
  /** Retries the Firebase session for the signed-in number. */
  retryFirebaseConnection: () => Promise<boolean>
  firebase: FirebaseConnection
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }

  return context
}
