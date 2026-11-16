import { AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import { Button } from '../common/Button'

/**
 * Shows when an Administrator decision or a delivery lifecycle write could not
 * reach Firestore. The app keeps working locally, but the console may be stale.
 */
export function LiveSyncBanner() {
  const {
    liveSyncError,
    retryLiveSync,
    deliverySyncError,
    retryDeliverySync,
  } = useApp()
  const { t } = useLanguage()
  const message = liveSyncError ?? deliverySyncError

  if (!message) {
    return null
  }

  function handleRetry() {
    retryLiveSync()
    retryDeliverySync()
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
              {t('Live updates unavailable')}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={handleRetry}
            >
              {t('Retry sync')}
            </Button>
          </div>

          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
            {t(message)}
          </p>
        </div>
      </div>
    </div>
  )
}
