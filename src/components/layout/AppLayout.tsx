import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/app-store'
import { OfferAlert } from '../deliveries/OfferAlert'
import { BottomNavigation } from './BottomNavigation'
import { FirebaseStatusBanner } from './FirebaseStatusBanner'
import { LiveSyncBanner } from './LiveSyncBanner'

/** One redirect per real document reload; survives React StrictMode mounts. */
let handledReloadRedirect = false

/**
 * Mobile-first application shell.
 *
 * On phones the app fills the screen; on tablet and desktop it stays a
 * comfortable 430px column so the product keeps its app-like feel instead of
 * stretching into a desktop dashboard.
 */
export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { onboarding } = useApp()
  const isOnboardingForm =
    pathname === '/onboarding' && onboarding.status === 'draft'
  const scrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (handledReloadRedirect) {
      return
    }

    handledReloadRedirect = true

    const navigation = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming | undefined

    if (
      navigation?.type === 'reload' &&
      pathname !== '/' &&
      pathname !== '/onboarding'
    ) {
      navigate('/', { replace: true })
    }
  }, [navigate, pathname])

  return (
    <div className="flex h-svh justify-center overflow-hidden bg-canvas">
      <div className="relative flex h-svh w-full max-w-[430px] flex-col overflow-hidden bg-canvas lg:border-x lg:border-line">
        <FirebaseStatusBanner />
        <LiveSyncBanner />
        <main
          ref={scrollRef}
          className="app-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
        {isOnboardingForm ? null : <BottomNavigation />}
        {isOnboardingForm ? null : <OfferAlert />}
      </div>
    </div>
  )
}
