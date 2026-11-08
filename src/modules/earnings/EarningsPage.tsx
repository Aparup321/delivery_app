import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { StatCard } from '../../components/common/StatCard'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import {
  earningsChart,
  earningsSummary,
  payouts,
} from '../../mock/earnings'
import type { EarningsPeriod } from '../../types/earnings'
import { formatCurrency, formatShortDate } from '../../utils/format'

export function EarningsPage() {
  const { history } = useApp()
  const { t, locale } = useLanguage()
  const [period, setPeriod] = useState<EarningsPeriod>('today')

  const amount =
    period === 'today'
      ? earningsSummary.today
      : period === 'week'
        ? earningsSummary.week
        : earningsSummary.month

  const deliveries =
    period === 'today'
      ? earningsSummary.deliveriesToday
      : period === 'week'
        ? earningsSummary.deliveriesWeek
        : earningsSummary.deliveriesMonth

  const average = deliveries > 0 ? Math.round(amount / deliveries) : 0
  const maxPoint = Math.max(...earningsChart.map((point) => point.amount))
  const recentDeliveries = history.slice(0, 4)

  function payoutPeriodLabel(value: string): string {
    return value.startsWith('Week of ')
      ? t('Week of {date}', { date: value.slice('Week of '.length) })
      : value
  }

  function payoutDateLabel(value: string): string {
    return value.startsWith('Expected ')
      ? t('Expected {date}', { date: value.slice('Expected '.length) })
      : value
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title={t('Earnings')}
        subtitle={t('Payouts, incentives and delivery earnings')}
        showBack
        backTo="/"
      />

      <div className="space-y-4 px-4 pt-5">
        <SegmentedTabs
          label={t('Earnings period')}
          value={period}
          onChange={(value) => setPeriod(value as EarningsPeriod)}
          items={[
            { id: 'today', label: t('Today') },
            { id: 'week', label: t('Week') },
            { id: 'month', label: t('Month') },
          ]}
        />

        <Card padding="lg">
          <p className="text-[12px] font-medium text-ink-muted">
            {period === 'today'
              ? t("Today's earnings")
              : period === 'week'
                ? t('This week')
                : t('This month')}
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-[28px] font-bold leading-none tracking-tight text-ink">
              {formatCurrency(amount, locale)}
            </p>
            <Badge tone="success" size="sm">
              <TrendingUp className="size-3" aria-hidden="true" />
              +{earningsSummary.changePercent}%
            </Badge>
          </div>

          <p className="mt-2 text-[11.5px] text-ink-muted">
            {t('Includes {amount} of incentives', {
              amount: formatCurrency(earningsSummary.incentive, locale),
            })}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            value={String(deliveries)}
            label={t('Deliveries')}
            hint={period === 'today' ? t('Today') : t('This period')}
          />
          <StatCard
            value={formatCurrency(average, locale)}
            label={t('Avg. per delivery')}
            hint={t('After incentives')}
          />
        </div>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">{t('Earnings trend')}</p>
          <p className="text-[11.5px] text-ink-muted">
            {t('Today, by time of day')}
          </p>

          <div className="mt-4 flex h-32 items-end gap-2">
            {earningsChart.map((point) => {
              const height = Math.max(
                10,
                Math.round((point.amount / maxPoint) * 100),
              )
              const isLast = point.amount === maxPoint

              return (
                <div
                  key={point.label}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div className="flex h-full w-full items-end">
                    <div
                      className={
                        isLast
                          ? 'w-full rounded-t-md bg-brand-deep'
                          : 'w-full rounded-t-md bg-brand/35'
                      }
                      style={{ height: `${height}%` }}
                      title={`${t(point.label)}: ${formatCurrency(point.amount, locale)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-ink-soft">
                    {t(point.label)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">
            {t('Recent deliveries')}
          </p>

          <ul className="mt-2 divide-y divide-line">
            {recentDeliveries.map((delivery) => (
              <li
                key={delivery.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-ink">
                    {delivery.id}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {delivery.completedAt
                      ? formatShortDate(delivery.completedAt, locale)
                      : '—'}{' '}
                    · {delivery.destination.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] font-bold text-ink">
                    {formatCurrency(delivery.earnings, locale)}
                  </span>
                  <Badge
                    tone={
                      delivery.status === 'cancelled' ? 'danger' : 'success'
                    }
                    size="sm"
                  >
                    {t(delivery.status === 'cancelled' ? 'Cancelled' : 'Paid')}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">{t('Payouts')}</p>

          <ul className="mt-2 divide-y divide-line">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">
                    {payoutPeriodLabel(payout.period)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {payout.id} · {payoutDateLabel(payout.paidOn)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] font-bold text-ink">
                    {formatCurrency(payout.amount, locale)}
                  </span>
                  <Badge
                    tone={payout.status === 'Paid' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {t(payout.status)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <p className="px-1 text-center text-[11px] leading-relaxed text-ink-soft">
          {t(
            'Demo data for this phase. Earnings will come from live delivery and payment records after the backend integration.',
          )}
        </p>
      </div>
    </div>
  )
}
