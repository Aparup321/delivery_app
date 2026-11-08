import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/app-store'

/**
 * Keeps unfinished applications in the wizard. Submitted and approved
 * partners use the app normally.
 */
export function OnboardingGate() {
  const { onboarding } = useApp()
  const location = useLocation()

  if (onboarding.status === 'draft' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
