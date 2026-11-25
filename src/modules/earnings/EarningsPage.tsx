import { useMemo, useRef, useState } from 'react'
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

interface ChartPoint extends EarningsPoint {
  /** Set on live points so the bar can open that bucket's statements. */
  start?: string
  end?: string
}

interface ChartBucket {
  label: string
  start: Date
  end: Date
}

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

  if (period === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return date >= monthStart && date <= now
  }

  start.setDate(start.getDate() - 6)
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

function sumInBucket(
  deliveries: Delivery[],
  start: Date,
  end: Date,
): number {
  return deliveries
    .filter((delivery) => {
      if (!delivery.completedAt) {
        return false
      }

      const date = new Date(delivery.completedAt)
      return date >= start && date < end
    })
    .reduce((sum, delivery) => sum + delivery.earnings, 0)
}

/** Calendar month split into the requested 1–6, 7–12, 13–18, 19–24, 25–end. */
function monthBuckets(now: Date): ChartBucket[] {
  const year = now.getFullYear()
  const month = now.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const starts = [1, 7, 13, 19, 25]

  return starts.map((startDay, index) => {
    const start = new Date(year, month, startDay)
    const end =
      index === starts.length - 1
        ? new Date(year, month + 1, 1)
        : new Date(year, month, starts[index + 1])
    const endDay =
      index === starts.length - 1 ? lastDay : starts[index + 1] - 1

    return {
      label: `${startDay}-${endDay}`,
      start,
      end,
    }
  })
}

function liveChart(
  deliveries: Delivery[],
  period: EarningsPeriod,
  locale: string,
): ChartPoint[] {
  if (period === 'today') {
    const labels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM']
    const dayStart = startOfToday()

    return labels.map((label, index) => {
      const start = new Date(dayStart)
      start.setHours(index * 4, 0, 0, 0)
      const end = new Date(start)
      end.setHours(start.getHours() + 4, 0, 0, 0)

      return {
        label,
        amount: sumInBucket(deliveries, start, end),
        start: start.toISOString(),
        end: end.toISOString(),
      }
    })
  }

  if (period === 'week') {
    const start = startOfToday()
    start.setDate(start.getDate() - 6)
    const points: ChartPoint[] = []

    for (let index = 0; index < 7; index += 1) {
      const bucketStart = new Date(start)
      bucketStart.setDate(bucketStart.getDate() + index)
      const bucketEnd = new Date(bucketStart)
      bucketEnd.setDate(bucketEnd.getDate() + 1)

      points.push({
        label: formatShortDate(bucketStart.toISOString(), locale),
        amount: sumInBucket(deliveries, bucketStart, bucketEnd),
        start: bucketStart.toISOString(),
        end: bucketEnd.toISOString(),
      })
    }

    return points
  }

  return monthBuckets(new Date()).map((bucket) => ({
    label: bucket.label,
    amount: sumInBucket(deliveries, bucket.start, bucket.end),
    start: bucket.start.toISOString(),
    end: bucket.end.toISOString(),
  }))
}

export function EarningsPage() {
  const { history, isLiveSession } = useApp()
  const { t, locale } = useLanguage()
  const [period, setPeriod] = useState<EarningsPeriod>('today')
  const [selectedBucket, setSelectedBucket] = useState<ChartPoint | null>(
    null,
  )
  const statementsRef = useRef<HTMLDivElement>(null)

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
  const chartPoints: ChartPoint[] = useMemo(
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
  const statementDeliveries =
    selectedBucket?.start && selectedBucket.end
      ? history
          .filter((delivery) => {
            if (
              delivery.status !== 'delivered' ||
              !delivery.completedAt
            ) {
              return false
            }

            const at = new Date(delivery.completedAt)
            return (
              at >= new Date(selectedBucket.start!) &&
              at < new Date(selectedBucket.end!)
            )
          })
          .sort((a, b) =>
            (b.completedAt ?? '').localeCompare(a.completedAt ?? ''),
          )
      : recentDeliveries
  const visibleDeliveries = selectedBucket
    ? statementDeliveries
    : recentDeliveries

  function selectBucket(point: ChartPoint) {
    if (!point.start || !point.end) {
      return
    }

    setSelectedBucket(point)
    window.requestAnimationFrame(() => {
      statementsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

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
        : t('This month, by date range')

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
          onChange={(value) => {
            setPeriod(value as EarningsPeriod)
            setSelectedBucket(null)
          }}
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
            <div
              className="mt-4 flex h-40 items-end gap-2"
              role="group"
              aria-label={t('Earnings bar chart')}
            >
              {chartPoints.map((point) => {
                // Pixel heights are deliberate: percentage heights inside an
                // auto-height flex column can resolve to zero in some browsers.
                const barHeight =
                  point.amount === 0
                    ? 2
                    : Math.max(
                        8,
                        Math.round((point.amount / maxPoint) * 112),
                      )
                const isMax = point.amount === maxPoint

                return (
                  <div
                    key={point.label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <div className="flex min-h-0 w-full flex-1 items-end">
                      <div
                        className="group relative w-full"
                        style={{ height: `${barHeight}px` }}
                      >
                        <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white group-hover:block">
                          {formatCurrency(point.amount, locale)}
                        </span>
                        <button
                          type="button"
                          disabled={!point.start || point.amount === 0}
                          onClick={() => selectBucket(point)}
                          aria-label={`${point.label}: ${formatCurrency(point.amount, locale)}`}
                          title={`${point.label}: ${formatCurrency(point.amount, locale)}`}
                          className={[
                            'h-full w-full origin-bottom rounded-t-md border-0 p-0 transition-all duration-200',
                            isMax ? 'bg-brand-deep' : 'bg-brand/35',
                            point.start && point.amount > 0
                              ? 'cursor-pointer hover:scale-y-[1.03] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
                              : 'cursor-default',
                            selectedBucket?.label === point.label
                              ? 'ring-2 ring-brand/35'
                              : '',
                          ].join(' ')}
                        />
                      </div>
                    </div>
                    <span className="h-4 text-[11px] font-medium text-ink-soft">
                      {point.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <div
          ref={statementsRef}
          id="earnings-statements"
          className="scroll-mt-4"
        >
          <Card padding="md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold text-ink">
                  {selectedBucket
                    ? t('Earnings for {range}', {
                        range: selectedBucket.label,
                      })
                    : t('Recent deliveries')}
                </p>
                {selectedBucket ? (
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {t('Completed deliveries in this range')}
                  </p>
                ) : null}
              </div>
              {selectedBucket ? (
                <button
                  type="button"
                  onClick={() => setSelectedBucket(null)}
                  className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  {t('Clear')}
                </button>
              ) : null}
            </div>

            {visibleDeliveries.length > 0 ? (
              <ul className="mt-2 divide-y divide-line">
                {visibleDeliveries.map((delivery) => (
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
                {t(
                  selectedBucket
                    ? 'No completed deliveries in this range.'
                    : 'Completed deliveries in this period will appear here.',
                )}
              </p>
            )}
          </Card>
        </div>

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
