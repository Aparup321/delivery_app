import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../components/common/Spinner'
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
      <div className="grid h-dvh place-items-center bg-canvas">
        <Spinner label="Loading" />
      </div>
    )
  }

  if (onboarding.status === 'draft' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
