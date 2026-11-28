import { useState } from 'react'
import { History as HistoryIcon, Search } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Input } from '../../components/common/Input'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { DeliveryDetailsDialog } from '../../components/deliveries/DeliveryDetailsDialog'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import type { Delivery } from '../../types/delivery'
import { formatCurrency, formatDate } from '../../utils/format'
import {
  deliveryOutcome,
  isDeclinedByPartner,
} from '../../utils/delivery'
import { revealStyle } from '../../utils/reveal'

type HistoryFilter = 'all' | 'delivered' | 'cancelled'

export function HistoryPage() {
  const { history, onboarding } = useApp()
  const { t, locale } = useLanguage()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  )

  const searchTerm = query.trim().toLowerCase()
  const filtered = history.filter((delivery) => {
    const outcome = deliveryOutcome(delivery)
    const matchesFilter = filter === 'all' || filter === outcome

    if (!matchesFilter) {
      return false
    }

    if (!searchTerm) {
      return true
    }

    return (
      delivery.id.toLowerCase().includes(searchTerm) ||
      delivery.customerName.toLowerCase().includes(searchTerm) ||
      delivery.pickup.name.toLowerCase().includes(searchTerm) ||
      delivery.destination.name.toLowerCase().includes(searchTerm)
    )
  })

  const deliveredCount = filtered.filter(
    (delivery) => deliveryOutcome(delivery) === 'delivered',
  ).length
  const cancelledCount = filtered.length - deliveredCount
  // Only completed jobs earn; declined or cancelled offers keep their payout
  // estimate on the document but it was never earned.
  const totalEarnings = filtered.reduce(
    (total, delivery) =>
      deliveryOutcome(delivery) === 'delivered'
        ? total + delivery.earnings
        : total,
    0,
  )

  return (
    <div className="pb-6">
      <ScreenHeader
        title={t('History')}
        subtitle={t('Every delivery you have completed or cancelled')}
        showBack
        backTo="/"
      />

      <div className="space-y-4 px-4 pt-5">
        <Input
          placeholder={t('Search by delivery ID or customer')}
          value={query}
          leftIcon={<Search className="size-4" aria-hidden="true" />}
          aria-label={t('Search deliveries')}
          onChange={(event) => setQuery(event.target.value)}
        />

        <SegmentedTabs
          label={t('Filter deliveries')}
          value={filter}
          onChange={(value) => setFilter(value as HistoryFilter)}
          items={[
            { id: 'all', label: t('All') },
            { id: 'delivered', label: t('Delivered') },
            { id: 'cancelled', label: t('Cancelled') },
          ]}
        />

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-brand-soft/60 px-3.5 py-2.5 text-[12px] font-semibold text-ink">
          <span>
            {t('{count} delivered', { count: deliveredCount })}
            {cancelledCount > 0
              ? ` · ${t('{count} cancelled', { count: cancelledCount })}`
              : null}
          </span>
          <span className="shrink-0">
            {t('{amount} earned', {
              amount: formatCurrency(totalEarnings, locale),
            })}
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map((delivery, index) => {
              const outcome = deliveryOutcome(delivery)
              const declined = isDeclinedByPartner(delivery)
              const reason = declined
                ? delivery.partnerResponse?.reason
                : delivery.cancellationReason

              return (
                <Card
                  key={delivery.id}
                  padding="sm"
                  className="reveal-up"
                  style={revealStyle(index)}
                >
                  <button
                    type="button"
                    aria-label={t('View delivery details')}
                    onClick={() => setSelectedDelivery(delivery)}
                    className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-bold text-ink">
                            {delivery.id}
                          </span>
                          <Badge
                            tone={outcome === 'cancelled' ? 'danger' : 'success'}
                            size="sm"
                          >
                            {t(
                              outcome === 'delivered'
                                ? 'Delivered'
                                : declined
                                  ? 'Cancelled by you'
                                  : 'Cancelled',
                            )}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                          {delivery.pickup.name} → {delivery.destination.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-soft">
                          {delivery.completedAt
                            ? formatDate(delivery.completedAt, locale)
                            : t('Not completed')}{' '}
                          · {t('{count} km', { count: delivery.distanceKm })}
                        </p>
                      </div>

                      <p
                        className={[
                          'shrink-0 text-[12.5px] font-bold',
                          outcome === 'delivered' ? 'text-ink' : 'text-danger',
                        ].join(' ')}
                      >
                        {formatCurrency(
                          outcome === 'delivered' ? delivery.earnings : 0,
                          locale,
                        )}
                      </p>
                    </div>

                    {outcome === 'cancelled' ? (
                      <p className="mt-2 rounded-xl bg-danger-soft px-2.5 py-1.5 text-[11px] text-danger">
                        {declined
                          ? `${t('You declined this request.')}${
                              reason ? ` ${t(reason)}` : ''
                            }`
                          : reason
                            ? t(reason)
                            : t('Cancelled by operations.')}
                      </p>
                    ) : null}
                  </button>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title={t('No deliveries found')}
            description={t('Try a different search term or status filter.')}
          />
        )}
      </div>

      {selectedDelivery ? (
        <DeliveryDetailsDialog
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          paymentUpi={onboarding.upiId}
          payeeName={onboarding.fullName}
        />
      ) : null}
    </div>
  )
}
