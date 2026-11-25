import { useState } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { useLanguage } from '../../context/language'

const rejectReasons = [
  'Too far away',
  'Vehicle issue',
  'Already on a delivery',
  'Other',
] as const

export interface RejectOfferDialogProps {
  onCancel: () => void
  onConfirm: (reason: string) => void
  isBusy?: boolean
}

/**
 * Text-only rejection flow. The selected reason and optional note are stored on
 * the delivery document so the administrator can see why the offer was
 * declined.
 */
export function RejectOfferDialog({
  onCancel,
  onConfirm,
  isBusy = false,
}: RejectOfferDialogProps) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<string>('')
  const [note, setNote] = useState('')

  const reason = selected === 'Other' ? note.trim() : selected
  const canSubmit = Boolean(reason) && !isBusy

  return (
    <div
      className="overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-offer-title"
        className="dialog-enter w-full max-w-[398px] pb-[env(safe-area-inset-bottom)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Card padding="md">
          <h2
            id="reject-offer-title"
            className="text-[15px] font-bold tracking-tight text-ink"
          >
            {t('Why are you rejecting this request?')}
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
            {t('The reason helps operations reassign the delivery.')}
          </p>

          <div className="mt-3 space-y-2" role="group" aria-label={t('Rejection reason')}>
            {rejectReasons.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={selected === item}
                onClick={() => setSelected(item)}
                className={
                  selected === item
                    ? 'w-full rounded-xl border border-brand/40 bg-brand-tint px-3.5 py-2.5 text-left text-[12.5px] font-semibold text-brand-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
                    : 'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-[12.5px] font-medium text-ink transition-colors hover:border-brand/25 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
                }
              >
                {t(item)}
              </button>
            ))}
          </div>

          {selected === 'Other' ? (
            <div className="mt-3">
              <Input
                label={t('Reason')}
                value={note}
                maxLength={160}
                placeholder={t('Short reason')}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isBusy}>
              {t('Cancel')}
            </Button>
            <Button
              variant="danger"
              disabled={!canSubmit}
              isLoading={isBusy}
              onClick={() => onConfirm(reason)}
            >
              {t('Reject request')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
