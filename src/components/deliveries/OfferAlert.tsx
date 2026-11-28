import { useEffect, useRef, useState } from 'react'
import { BellRing, Clock3 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { RejectOfferDialog } from './RejectOfferDialog'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import { formatCurrency } from '../../utils/format'
import { playOfferAlert } from '../../utils/offerAlert'

/**
 * A new offer is important enough to interrupt any screen. This overlay keeps
 * the accept/reject decision one tap away while the partner is on Profile,
 * History, Earnings or Support instead of only showing a bell badge.
 */
export function OfferAlert() {
  const {
    requests,
    activeDelivery,
    isOnline,
    acceptRequest,
    rejectRequest,
    deliveryActionPending,
    deliveryActionPendingId,
    deliveryActionError,
    requestAlertsEnabled,
  } = useApp()
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const offer = requests[0]
  // Do not beep for an offer that was already present when this screen loaded;
  // only a newly arriving offer should interrupt the partner.
  const previousOfferId = useRef<string | null>(offer?.id ?? null)
  const [now, setNow] = useState(() => Date.now())
  const [showReject, setShowReject] = useState(false)

  useEffect(() => {
    const id = offer?.id ?? null

    if (id && id !== previousOfferId.current && requestAlertsEnabled) {
      playOfferAlert()
    }

    previousOfferId.current = id
  }, [offer?.id, requestAlertsEnabled])

  const deadline =
    offer?.expiresAt !== undefined
      ? new Date(offer.expiresAt).getTime()
      : null

  useEffect(() => {
    if (deadline === null || !Number.isFinite(deadline)) {
      return
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [deadline])

  if (
    !offer ||
    !isOnline ||
    activeDelivery ||
    pathname === '/' ||
    pathname === '/deliveries' ||
    pathname === '/deliveries/active'
  ) {
    return null
  }

  const secondsLeft =
    deadline !== null && Number.isFinite(deadline)
      ? Math.max(0, Math.ceil((deadline - now) / 1_000))
      : null

  if (secondsLeft !== null && secondsLeft <= 0) {
    return null
  }

  const busy = deliveryActionPending !== null
  const error =
    deliveryActionPendingId === offer.id ? deliveryActionError : null
  const countdown =
    secondsLeft === null
      ? null
      : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 px-3">
      <div className="pointer-events-auto" role="alert" aria-live="assertive">
        <Card padding="sm" className="offer-enter border-brand/35">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
              <BellRing className="size-4" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-[12.5px] font-bold text-ink">
                  {t('New request')} · {offer.id}
                </p>
                {countdown ? (
                  <Badge tone="warning" size="sm">
                    <Clock3 className="size-3" aria-hidden="true" />
                    {countdown}
                  </Badge>
                ) : null}
              </div>

              <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                {offer.pickup.name} → {offer.destination.name}
              </p>
              <p className="mt-0.5 text-[11.5px] font-semibold text-brand-deep">
                {formatCurrency(offer.earnings, locale)} ·{' '}
                {t('{count} km', { count: offer.distanceKm })} ·{' '}
                {t('{count} min', { count: offer.etaMinutes })}
              </p>

              {error ? (
                <p role="alert" className="mt-1 text-[11px] font-medium text-danger">
                  {t(error)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              isLoading={
                deliveryActionPending === 'reject' &&
                deliveryActionPendingId === offer.id
              }
              onClick={() => setShowReject(true)}
            >
              {t('Reject')}
            </Button>
            <Button
              size="sm"
              disabled={busy}
              isLoading={
                deliveryActionPending === 'accept' &&
                deliveryActionPendingId === offer.id
              }
              onClick={() => {
                void acceptRequest(offer.id).then((accepted) => {
                  if (accepted) {
                    navigate('/deliveries/active')
                  }
                })
              }}
            >
              {t('Accept')}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/deliveries')}
            className="mt-1.5 w-full rounded-lg py-2.5 text-center text-[10.5px] font-medium text-ink-soft transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {t('View all')}
          </button>
        </Card>

        {showReject ? (
          <RejectOfferDialog
            isBusy={
              deliveryActionPending === 'reject' &&
              deliveryActionPendingId === offer.id
            }
            onCancel={() => setShowReject(false)}
            onConfirm={(reason) => {
              setShowReject(false)
              void rejectRequest(offer.id, reason)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
