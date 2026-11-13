import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/app-store'

/**
 * Keeps unfinished applications in the wizard. Submitted and approved
 * partners use the app normally.
 */
export function OnboardingGate() {
  const { onboarding, isLoading } = useApp()
  const location = useLocation()

  if (isLoading) {
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

  if (onboarding.status === 'draft' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
