import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { Button } from '../common/Button'

/**
 * Explains the local demo fallback instead of silently pretending the app is
 * connected. Visible on every signed-in screen until the anonymous Firebase
 * session succeeds, with the Firebase error code and a retry action.
 */
export function FirebaseStatusBanner() {
  const { firebase, isAuthenticated, retryFirebaseConnection } = useAuth()
  const { t } = useLanguage()
  const [isRetrying, setIsRetrying] = useState(false)

  if (!firebase.enabled || !isAuthenticated || firebase.connected) {
    return null
  }

  async function handleRetry() {
    setIsRetrying(true)

    try {
      await retryFirebaseConnection()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      role="status"
      className="shrink-0 border-b border-line bg-warning-soft px-4 py-2.5"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/70 text-warning">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12.5px] font-semibold text-ink">
              {t('Firebase is not connected')}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              isLoading={isRetrying}
              onClick={handleRetry}
            >
              {t(isRetrying ? 'Retrying…' : 'Retry connection')}
            </Button>
          </div>

          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
            {t(
              'This session is stored only on this device. Enable Authentication and the Anonymous provider in the Firebase console, then retry.',
            )}
          </p>

          {firebase.errorCode ? (
            <p className="mt-1 font-mono text-[10.5px] text-ink-soft">
              {t('Error: {code}', { code: firebase.errorCode })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
