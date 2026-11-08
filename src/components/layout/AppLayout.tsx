import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-svh justify-center bg-canvas">
      <div className="flex min-h-svh w-full max-w-[430px] flex-col bg-canvas lg:border-x lg:border-line">
        <main className="flex-1">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  )
}
