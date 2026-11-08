import { Check } from 'lucide-react'
import { useLanguage } from '../../context/language'
import type { Delivery } from '../../types/delivery'
import { cn } from '../../utils/cn'
import { deliveryProgression, deliveryStatusLabels } from '../../utils/delivery'
import { formatTime } from '../../utils/format'

export interface DeliveryTimelineProps {
  delivery: Delivery
}

export function DeliveryTimeline({ delivery }: DeliveryTimelineProps) {
  const { t, locale } = useLanguage()
  const currentIndex = deliveryProgression.indexOf(delivery.status)

  return (
    <ol className="space-y-3">
      {deliveryProgression.map((status, index) => {
        const event = delivery.events.find((item) => item.status === status)
        const isDone = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <li key={status} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                isDone
                  ? 'border-success bg-success text-white'
                  : 'border-line bg-surface text-ink-soft',
                isCurrent && 'ring-4 ring-success/15',
              )}
            >
              {isDone ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>

            <div className="min-w-0">
              <p
                className={cn(
                  'text-[13px] font-semibold',
                  isDone ? 'text-ink' : 'text-ink-soft',
                )}
              >
                {t(deliveryStatusLabels[status])}
              </p>
              <p className="text-[11.5px] text-ink-muted">
                {event
                  ? formatTime(event.at, locale)
                  : index === currentIndex + 1
                    ? t('Next step')
                    : t('Pending')}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
