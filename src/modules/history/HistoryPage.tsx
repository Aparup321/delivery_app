import { useState } from 'react'
import { History as HistoryIcon, Search } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Input } from '../../components/common/Input'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import { formatCurrency, formatDate } from '../../utils/format'

type HistoryFilter = 'all' | 'delivered' | 'cancelled'

export function HistoryPage() {
  const { history } = useApp()
  const { t, locale } = useLanguage()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<HistoryFilter>('all')

  const searchTerm = query.trim().toLowerCase()
  const filtered = history.filter((delivery) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'delivered' && delivery.status === 'delivered') ||
      (filter === 'cancelled' && delivery.status === 'cancelled')

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
    (delivery) => delivery.status === 'delivered',
  ).length
  const totalEarnings = filtered.reduce(
    (total, delivery) => total + delivery.earnings,
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

        <div className="flex items-center justify-between rounded-2xl bg-brand-soft/60 px-3.5 py-2.5 text-[12px] font-semibold text-ink">
          <span>{t('{count} delivered', { count: deliveredCount })}</span>
          <span>
            {t('{amount} earned', {
              amount: formatCurrency(totalEarnings, locale),
            })}
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map((delivery) => (
              <Card key={delivery.id} padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold text-ink">
                        {delivery.id}
                      </span>
                      <Badge
                        tone={
                          delivery.status === 'cancelled' ? 'danger' : 'success'
                        }
                        size="sm"
                      >
                        {t(
                          delivery.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Delivered',
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

                  <p className="shrink-0 text-[12.5px] font-bold text-ink">
                    {formatCurrency(delivery.earnings, locale)}
                  </p>
                </div>

                {delivery.cancellationReason ? (
                  <p className="mt-2 rounded-xl bg-danger-soft px-2.5 py-1.5 text-[11px] text-danger">
                    {t(delivery.cancellationReason)}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title={t('No deliveries found')}
            description={t('Try a different search term or status filter.')}
          />
        )}
      </div>
    </div>
  )
}
