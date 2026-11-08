import { ArrowDownRight, Clock3, MapPin, Navigation, Wallet } from 'lucide-react'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { useLanguage } from '../../context/language'
import { useCountdown } from '../../hooks/useCountdown'
import type { Delivery } from '../../types/delivery'
import { formatCurrency } from '../../utils/format'

export interface DeliveryRequestCardProps {
  delivery: Delivery
  onAccept: () => void
  onReject: () => void
}

export function DeliveryRequestCard({
  delivery,
  onAccept,
  onReject,
}: DeliveryRequestCardProps) {
  const { t, locale } = useLanguage()
  const { secondsLeft, isFinished } = useCountdown(
    delivery.expiresInSeconds ?? 45,
  )

  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-ink">
              {delivery.id}
            </span>
            <Badge
              tone={delivery.category === 'Grocery' ? 'success' : 'warning'}
              size="sm"
            >
              {t(delivery.category)}
            </Badge>
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {t('{count} items', { count: delivery.itemCount })} ·{' '}
            {t(delivery.paymentMode)}
          </p>
        </div>

        <Badge tone={isFinished ? 'danger' : 'warning'} size="sm">
          <Clock3 className="size-3" aria-hidden="true" />
          {isFinished
            ? t('Expired')
            : t('{count}s', { count: secondsLeft })}
        </Badge>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-5 place-items-center rounded-full bg-success-soft text-success">
            <MapPin className="size-3" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium text-ink-muted">
              {t('Pickup')}
            </p>
            <p className="text-[12.5px] font-semibold text-ink">
              {delivery.pickup.name}
            </p>
            <p className="text-[11.5px] text-ink-muted">
              {delivery.pickup.address}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-5 place-items-center rounded-full bg-danger-soft text-danger">
            <ArrowDownRight className="size-3" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium text-ink-muted">
              {t('Deliver to')}
            </p>
            <p className="text-[12.5px] font-semibold text-ink">
              {delivery.destination.name}
            </p>
            <p className="text-[11.5px] text-ink-muted">
              {delivery.destination.address}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11.5px] font-medium text-ink-muted">
        <span className="flex items-center gap-1">
          <Navigation className="size-3.5" aria-hidden="true" />
          {t('{count} km', { count: delivery.distanceKm })}
        </span>
        <span className="flex items-center gap-1">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {t('{count} min', { count: delivery.etaMinutes })}
        </span>
        <span className="flex items-center gap-1">
          <Wallet className="size-3.5" aria-hidden="true" />
          {formatCurrency(delivery.earnings, locale)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onReject}>
          {t('Reject')}
        </Button>
        <Button onClick={onAccept} disabled={isFinished}>
          {t('Accept')}
        </Button>
      </div>
    </Card>
  )
}
