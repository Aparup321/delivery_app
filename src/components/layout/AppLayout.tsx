import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/app-store'
import { BottomNavigation } from './BottomNavigation'

/**
 * Mobile-first application shell.
 *
 * On phones the app fills the screen; on tablet and desktop it stays a
 * comfortable 430px column so the product keeps its app-like feel instead of
 * stretching into a desktop dashboard.
 */
export function AppLayout() {
  const { pathname } = useLocation()
  const { onboarding } = useApp()
  const isOnboardingForm =
    pathname === '/onboarding' && onboarding.status === 'draft'
  const scrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex h-svh justify-center overflow-hidden bg-canvas">
      <div className="flex h-svh w-full max-w-[430px] flex-col overflow-hidden bg-canvas lg:border-x lg:border-line">
        <main
          ref={scrollRef}
          className="app-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <Outlet />
        </main>
        {isOnboardingForm ? null : <BottomNavigation />}
      </div>
    </div>
  )
}
