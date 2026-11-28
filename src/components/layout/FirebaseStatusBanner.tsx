import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { isAppCheckConfigured } from '../../firebase'
import { Button } from '../common/Button'

/**
 * Explains the local demo fallback instead of silently pretending the app is
 * connected. Visible on every signed-in screen until a Firebase session
 * succeeds, with the Firebase error code and a retry action.
 */
export function FirebaseStatusBanner() {
  const { firebase, isAuthenticated, retryFirebaseConnection } = useAuth()
  const { t } = useLanguage()
  const [isRetrying, setIsRetrying] = useState(false)
  const appCheckMissing = import.meta.env.PROD && firebase.enabled && !isAppCheckConfigured

  if (!firebase.enabled || !isAuthenticated || (firebase.connected && !appCheckMissing)) {
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
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface/70 text-warning">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12.5px] font-semibold text-ink">
              {t(appCheckMissing ? 'App Check is not configured' : 'Firebase is not connected')}
            </p>
            {!appCheckMissing ? <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              isLoading={isRetrying}
              onClick={handleRetry}
            >
              {t(isRetrying ? 'Retrying…' : 'Retry connection')}
            </Button> : null}
          </div>

          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
            {t(
              appCheckMissing
                ? 'Production traffic is not attested. Add VITE_RECAPTCHA_SITE_KEY, register the app in Firebase App Check, and add App Check tokens to delivery_admin before enforcing Firestore or the admin REST sync will be rejected.'
                : 'This session is stored only on this device. Enable Authentication and the Email/Password provider in the Firebase console, then retry.',
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
