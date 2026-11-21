import { useEffect } from 'react'

interface WakeLockSentinelLike {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: 'release', listener: () => void) => void
}

type WakeLockNavigator = {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>
  }
}

/**
 * Keeps the screen awake while a delivery is active, when the browser supports
 * the Screen Wake Lock API. This is not background GPS: browsers still pause
 * geolocation when the tab is hidden.
 */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const wakeLock = (navigator as unknown as WakeLockNavigator).wakeLock
    if (!wakeLock) {
      return
    }

    const session = { active: true, sentinel: null as WakeLockSentinelLike | null }

    const request = async () => {
      try {
        const next = await wakeLock.request('screen')
        if (!session.active) {
          void next.release()
          return
        }
        session.sentinel = next
      } catch {
        // Not allowed, not visible, or unsupported: tracking still runs.
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void request()
      }
    }

    void request()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      session.active = false
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void session.sentinel?.release().catch(() => {
        // The browser may have released it already.
      })
    }
  }, [enabled])
}
