import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { hasSignedOutFlag } from '../utils/sessionFlag'

export function ProtectedRoute() {
  const { isAuthenticated, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <div
        className="grid h-svh place-items-center bg-canvas"
        role="status"
        aria-label="Loading"
      >
        <span className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // An explicit sign-out happens on a protected page. Saving that page would
    // send the partner back into it after the next OTP instead of the
    // dashboard. Session-expiry redirects still keep their destination.
    return (
      <Navigate
        to="/login"
        replace
        state={
          hasSignedOutFlag()
            ? undefined
            : { from: `${location.pathname}${location.search}` }
        }
      />
    )
  }

  return <Outlet />
}
