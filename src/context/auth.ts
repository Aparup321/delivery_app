import { createContext, useContext } from 'react'

export interface Session {
  phone: string
  signedInAt: string
}

export interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  signIn: (phone: string) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }

  return context
}
