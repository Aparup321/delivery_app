import { useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Flag,
  MapPin,
  X,
} from 'lucide-react'
import { Badge } from '../common/Badge'
import { useLanguage } from '../../context/language'
import { useModalFocus } from '../../hooks/useModalFocus'
import type { Delivery, DeliveryStop } from '../../types/delivery'
import {
  deliveryOutcome,
  isDeclinedByPartner,
} from '../../utils/delivery'
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatTime,
} from '../../utils/format'
import { DeliveryTimeline } from './DeliveryTimeline'

export interface DeliveryDetailsDialogProps {
  delivery: Delivery
  onClose: () => void
}

function StopRow({
  label,
  stop,
  tone,
}: {
  label: string
  stop: DeliveryStop
  tone: 'success' | 'warning'
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={[
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
          tone === 'success'
            ? 'bg-success-soft text-success'
            : 'bg-warning-soft text-warning',
        ].join(' ')}
      >
        {tone === 'success' ? (
          <MapPin className="size-3.5" aria-hidden="true" />
        ) : (
          <Flag className="size-3.5" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft">
          {label}
        </p>
        <p className="text-[12.5px] font-semibold text-ink">{stop.name}</p>
        <p className="text-[11.5px] leading-relaxed text-ink-muted">
          {stop.address}
        </p>
      </div>
    </div>
  )
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-3 py-2">
      <p className="text-[10.5px] font-semibold text-ink-soft">{label}</p>
      <p className="mt-0.5 text-[12px] font-semibold text-ink">{value}</p>
    </div>
  )
}

/**
 * Read-only details for a completed, cancelled or declined delivery. It is
 * portalled to the body so the page entrance transform cannot trap the fixed
 * overlay, and closes on Escape or a backdrop tap.
 */
export function DeliveryDetailsDialog({
  delivery,
  onClose,
}: DeliveryDetailsDialogProps) {
  const { t, locale } = useLanguage()
  const dialogRef = useRef<HTMLDivElement>(null)
  useModalFocus(dialogRef, onClose)
  const outcome = deliveryOutcome(delivery)
  const declined = isDeclinedByPartner(delivery)
  const isCancelled = outcome === 'cancelled'

  const statusLabel = isCancelled
    ? declined
      ? t('Cancelled by you')
      : t('Cancelled')
    : t('Delivered')

  const cancellationText = declined
    ? `${t('You declined this request.')}${
        delivery.partnerResponse?.reason
          ? ` ${t(delivery.partnerResponse.reason)}`
          : ''
      }`
    : delivery.cancellationReason
      ? t(delivery.cancellationReason)
      : t('Cancelled by operations.')

  const dialog = (
    <div
      className="overlay-enter fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-details-title"
        className="dialog-enter max-h-[88dvh] w-full max-w-[430px] overflow-y-auto overscroll-contain rounded-2xl bg-surface shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3">
          <div className="min-w-0">
            <h2
              id="delivery-details-title"
              className="text-[15px] font-bold tracking-tight text-ink"
            >
              {delivery.id}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={isCancelled ? 'danger' : 'success'} size="sm">
                {statusLabel}
              </Badge>
              <span className="text-[10.5px] text-ink-soft">
                {t('Delivery details')}
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label={t('Close')}
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-brand-tint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
          <div className="space-y-3">
            <StopRow label={t('Pickup')} stop={delivery.pickup} tone="success" />
            <StopRow label={t('Drop')} stop={delivery.destination} tone="warning" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DetailCell
              label={t('Earnings')}
              value={formatCurrency(
                isCancelled ? 0 : delivery.earnings,
                locale,
              )}
            />
            <DetailCell
              label={t('Distance')}
              value={`${t('{count} km', { count: delivery.distanceKm })} · ${t(
                '{count} min',
                { count: delivery.etaMinutes },
              )}`}
            />
            <DetailCell
              label={t('Items')}
              value={t('{count} items', { count: delivery.itemCount })}
            />
            <DetailCell
              label={t('Payment')}
              value={`${t(delivery.paymentMode)}${
                delivery.paymentMode === 'Cash on delivery' &&
                delivery.collectAmount
                  ? ` · ${t('Collect {amount}', {
                      amount: formatCurrency(delivery.collectAmount, locale),
                    })}`
                  : ''
              }`}
            />
          </div>

          {delivery.customerName ? (
            <div className="rounded-xl border border-line px-3 py-2.5">
              <p className="text-[10.5px] font-semibold text-ink-soft">
                {t('Customer')}
              </p>
              <p className="mt-0.5 text-[12.5px] font-semibold text-ink">
                {delivery.customerName}
              </p>
              {delivery.customerPhone ? (
                <p className="text-[11.5px] text-ink-muted">
                  {delivery.customerPhone}
                </p>
              ) : null}
            </div>
          ) : null}

          {delivery.note ? (
            <div className="rounded-xl bg-brand-tint px-3 py-2 text-[11.5px] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">
                {t('Delivery note')}:
              </span>{' '}
              {delivery.note}
            </div>
          ) : null}

          {isCancelled ? (
            <p className="rounded-xl bg-danger-soft px-3 py-2 text-[11.5px] text-danger">
              {cancellationText}
            </p>
          ) : (
            <div className="border-t border-line pt-3">
              <p className="text-[12px] font-semibold text-ink">
                {t('Delivery timeline')}
              </p>
              <div className="mt-2">
                <DeliveryTimeline delivery={delivery} />
              </div>
            </div>
          )}

          {delivery.proof?.recipientName || delivery.proof?.note ? (
            <div className="rounded-xl bg-success-soft px-3 py-2 text-[11.5px] leading-relaxed text-success">
              {delivery.proof?.recipientName ? (
                <p>
                  <span className="font-semibold">{t('Received by')}:</span>{' '}
                  {delivery.proof.recipientName}
                </p>
              ) : null}
              {delivery.proof?.note ? (
                <p>
                  <span className="font-semibold">{t('Handover note')}:</span>{' '}
                  {delivery.proof.note}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-ink-soft">
            {delivery.requestedAt ? (
              <span>
                {t('Requested')}: {formatShortDate(delivery.requestedAt, locale)},{' '}
                {formatTime(delivery.requestedAt, locale)}
              </span>
            ) : null}
            {delivery.acceptedAt ? (
              <span>
                {t('Accepted')}: {formatShortDate(delivery.acceptedAt, locale)},{' '}
                {formatTime(delivery.acceptedAt, locale)}
              </span>
            ) : null}
            {delivery.completedAt ? (
              <span>
                {t('Completed')}:{' '}
                {formatDate(delivery.completedAt, locale)},{' '}
                {formatTime(delivery.completedAt, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
