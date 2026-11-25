import { useMemo, useState } from 'react'
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
import type { Delivery } from '../../types/delivery'
import type { EarningsPeriod, EarningsPoint } from '../../types/earnings'
import { formatCurrency, formatShortDate } from '../../utils/format'

function startOfToday(): Date {
  const value = new Date()
  value.setHours(0, 0, 0, 0)
  return value
}

function isInPeriod(value: string, period: EarningsPeriod): boolean {
  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) {
    return false
  }

  const now = new Date()
  const start = startOfToday()

  if (period === 'today') {
    return date >= start && date <= now
  }

  start.setDate(start.getDate() - (period === 'week' ? 6 : 29))
  return date >= start && date <= now
}

function completedInPeriod(
  history: Delivery[],
  period: EarningsPeriod,
): Delivery[] {
  return history
    .filter(
      (delivery) =>
        delivery.status === 'delivered' &&
        delivery.completedAt !== undefined &&
        isInPeriod(delivery.completedAt, period),
    )
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
}

function sumEarnings(deliveries: Delivery[]): number {
  return deliveries.reduce((sum, delivery) => sum + delivery.earnings, 0)
}

function liveChart(
  deliveries: Delivery[],
  period: EarningsPeriod,
  locale: string,
): EarningsPoint[] {
  if (period === 'today') {
    const labels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM']
    const amounts = labels.map(() => 0)

    for (const delivery of deliveries) {
      if (!delivery.completedAt) {
        continue
      }

      const hour = new Date(delivery.completedAt).getHours()
      const index = Math.min(5, Math.max(0, Math.floor(hour / 4)))
      amounts[index] += delivery.earnings
    }

    return labels.map((label, index) => ({
      label,
      amount: amounts[index],
    }))
  }

  const bucketCount = period === 'week' ? 7 : 5
  const bucketDays = period === 'week' ? 1 : 6
  const start = startOfToday()
  start.setDate(start.getDate() - (bucketCount * bucketDays - 1))

  const points: EarningsPoint[] = []

  for (let index = 0; index < bucketCount; index += 1) {
    const bucketStart = new Date(start)
    bucketStart.setDate(bucketStart.getDate() + index * bucketDays)
    const bucketEnd = new Date(bucketStart)
    bucketEnd.setDate(bucketEnd.getDate() + bucketDays)

    const amount = deliveries
      .filter((delivery) => {
        if (!delivery.completedAt) {
          return false
        }

        const date = new Date(delivery.completedAt)
        return date >= bucketStart && date < bucketEnd
      })
      .reduce((sum, delivery) => sum + delivery.earnings, 0)

    points.push({
      label: formatShortDate(bucketStart.toISOString(), locale),
      amount,
    })
  }

  return points
}

export function EarningsPage() {
  const { history, isLiveSession } = useApp()
  const { t, locale } = useLanguage()
  const [period, setPeriod] = useState<EarningsPeriod>('today')

  const liveDeliveries = useMemo(
    () => (isLiveSession ? completedInPeriod(history, period) : []),
    [history, isLiveSession, period],
  )

  const liveAmount = sumEarnings(liveDeliveries)

  const amount = isLiveSession
    ? liveAmount
    : period === 'today'
      ? earningsSummary.today
      : period === 'week'
        ? earningsSummary.week
        : earningsSummary.month

  const deliveries = isLiveSession
    ? liveDeliveries.length
    : period === 'today'
      ? earningsSummary.deliveriesToday
      : period === 'week'
        ? earningsSummary.deliveriesWeek
        : earningsSummary.deliveriesMonth

  const average = deliveries > 0 ? Math.round(amount / deliveries) : 0
  const chartPoints = useMemo(
    () =>
      isLiveSession
        ? liveChart(liveDeliveries, period, locale)
        : earningsChart,
    [isLiveSession, liveDeliveries, locale, period],
  )
  const maxPoint = Math.max(1, ...chartPoints.map((point) => point.amount))
  const recentDeliveries = isLiveSession
    ? liveDeliveries.slice(0, 4)
    : history.slice(0, 4)

  const periodLabel =
    period === 'today'
      ? t("Today's earnings")
      : period === 'week'
        ? t('This week')
        : t('This month')

  const chartSubtitle =
    period === 'today'
      ? t('Today, by time of day')
      : period === 'week'
        ? t('Last 7 days')
        : t('Last 30 days')

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
            {periodLabel}
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-[28px] font-bold leading-none tracking-tight text-ink">
              {formatCurrency(amount, locale)}
            </p>
            {isLiveSession ? (
              <Badge tone="success" size="sm">
                {t('Recorded')}
              </Badge>
            ) : (
              <Badge tone="success" size="sm">
                <TrendingUp className="size-3" aria-hidden="true" />
                +{earningsSummary.changePercent}%
              </Badge>
            )}
          </div>

          <p className="mt-2 text-[11.5px] text-ink-muted">
            {isLiveSession
              ? t('Based on completed deliveries')
              : t('Includes {amount} of incentives', {
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
            hint={isLiveSession ? t('Earned') : t('After incentives')}
          />
        </div>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">{t('Earnings trend')}</p>
          <p className="text-[11.5px] text-ink-muted">{chartSubtitle}</p>

          {chartPoints.every((point) => point.amount === 0) ? (
            <p className="mt-4 rounded-xl bg-canvas px-3 py-4 text-center text-[11.5px] text-ink-muted">
              {t('No completed deliveries in this period.')}
            </p>
          ) : (
            <div className="mt-4 flex h-32 items-end gap-2">
              {chartPoints.map((point) => {
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
                        title={`${point.label}: ${formatCurrency(point.amount, locale)}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-ink-soft">
                      {point.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">
            {t('Recent deliveries')}
          </p>

          {recentDeliveries.length > 0 ? (
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
                      {t(
                        isLiveSession
                          ? 'Earned'
                          : delivery.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Paid',
                      )}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11.5px] text-ink-muted">
              {t('Completed deliveries in this period will appear here.')}
            </p>
          )}
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">{t('Payouts')}</p>

          {isLiveSession ? (
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
              {t(
                'No payouts recorded yet. Earnings are tracked from completed deliveries; payout settlement is not connected.',
              )}
            </p>
          ) : (
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
          )}
        </Card>

        {isLiveSession ? (
          <p className="px-1 text-center text-[11px] leading-relaxed text-ink-soft">
            {t(
              'Earnings are calculated from completed deliveries in this app. Payout settlement and incentives are separate integrations.',
            )}
          </p>
        ) : (
          <p className="px-1 text-center text-[11px] leading-relaxed text-ink-soft">
            {t(
              'Demo data for this phase. Earnings will come from live delivery and payment records after the backend integration.',
            )}
          </p>
        )}
      </div>
    </div>
  )
}
