import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth'
import type { Session } from './auth'

const STORAGE_KEY = 'fafo.partner.session'

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

    return { phone: candidate.phone, signedInAt: candidate.signedInAt }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    readStoredSession(),
  )

  useEffect(() => {
    try {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Storage can be blocked; the in-memory session still works.
    }
  }, [session])

  const signIn = useCallback((phone: string) => {
    setSession({ phone, signedInAt: new Date().toISOString() })
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
