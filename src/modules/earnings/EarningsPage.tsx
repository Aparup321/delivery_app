import { useMemo, useRef, useState } from 'react'
import { TrendingUp, Wallet } from 'lucide-react'
import { AnimatedNumber } from '../../components/common/AnimatedNumber'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Reveal } from '../../components/common/Reveal'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { StatCard } from '../../components/common/StatCard'
import { DeliveryDetailsDialog } from '../../components/deliveries/DeliveryDetailsDialog'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { useWithdrawals } from '../../hooks/useWithdrawals'
import {
  earningsChart,
  earningsSummary,
  payouts,
} from '../../mock/earnings'
import type { Delivery } from '../../types/delivery'
import type { EarningsPeriod } from '../../types/earnings'
import type { WithdrawalStatus } from '../../types/withdrawal'
import { formatCurrency, formatShortDate } from '../../utils/format'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { EarningsChart } from './EarningsChart'
import type { EarningsChartPoint } from './EarningsChart'
import { WithdrawDialog } from './WithdrawDialog'

const withdrawalLabels: Record<WithdrawalStatus, string> = {
  requested: 'Requested',
  processing: 'Processing',
  paid: 'Paid',
  rejected: 'Rejected',
}

const withdrawalTones: Record<
  WithdrawalStatus,
  'warning' | 'brand' | 'success' | 'danger'
> = {
  requested: 'warning',
  processing: 'brand',
  paid: 'success',
  rejected: 'danger',
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
): EarningsChartPoint[] {
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
    const points: EarningsChartPoint[] = []

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
  const { session } = useAuth()
  const { t, locale } = useLanguage()
  const reduceMotion = usePrefersReducedMotion()
  const uid = session?.uid ?? ''
  const {
    withdrawals,
    lastUpiId,
    error: withdrawalError,
    isSubmitting,
    submit,
  } = useWithdrawals({ uid, isLive: isLiveSession })
  const [period, setPeriod] = useState<EarningsPeriod>('today')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [selectedBucket, setSelectedBucket] = useState<EarningsChartPoint | null>(
    null,
  )
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
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
  const chartPoints: EarningsChartPoint[] = useMemo(
    () =>
      isLiveSession
        ? liveChart(liveDeliveries, period, locale)
        : earningsChart,
    [isLiveSession, liveDeliveries, locale, period],
  )
  const maxPoint = Math.max(1, ...chartPoints.map((point) => point.amount))
  const recentDeliveries = useMemo(
    () => (isLiveSession ? liveDeliveries.slice(0, 4) : history.slice(0, 4)),
    [history, isLiveSession, liveDeliveries],
  )
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

  const deliveredEarnings = useMemo(
    () =>
      history
        .filter((delivery) => delivery.status === 'delivered')
        .reduce((sum, delivery) => sum + delivery.earnings, 0),
    [history],
  )
  // A demo session uses its labelled demo month total; live sessions use the
  // earnings actually recorded on completed deliveries. Requested, processing
  // and paid withdrawals all reduce what is still available.
  const committedWithdrawals = withdrawals
    .filter((withdrawal) => withdrawal.status !== 'rejected')
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
  const availableBalance = Math.max(
    0,
    Math.floor(
      (isLiveSession ? deliveredEarnings : earningsSummary.month) -
        committedWithdrawals,
    ),
  )
  const hasPendingWithdrawal = withdrawals.some(
    (withdrawal) =>
      withdrawal.status === 'requested' ||
      withdrawal.status === 'processing',
  )

  function selectBucket(point: EarningsChartPoint) {
    if (!point.start || !point.end) {
      return
    }

    setSelectedBucket(point)
    window.requestAnimationFrame(() => {
      statementsRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
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
              <AnimatedNumber
                value={amount}
                format={(next) => formatCurrency(Math.round(next), locale)}
              />
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
            value={<AnimatedNumber value={deliveries} />}
            label={t('Deliveries')}
            hint={period === 'today' ? t('Today') : t('This period')}
          />
          <StatCard
            value={
              <AnimatedNumber
                value={average}
                format={(next) => formatCurrency(Math.round(next), locale)}
              />
            }
            label={t('Avg. per delivery')}
            hint={isLiveSession ? t('Earned') : t('After incentives')}
          />
        </div>

        <Card padding="md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-ink">
                {t('Withdraw earnings')}
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {t('Available to withdraw')}
              </p>
              <p className="mt-1 text-[22px] font-bold leading-none tracking-tight text-ink">
                {formatCurrency(availableBalance, locale)}
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={<Wallet className="size-4" aria-hidden="true" />}
              disabled={availableBalance < 1}
              onClick={() => setWithdrawOpen(true)}
            >
              {t('Withdraw')}
            </Button>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
            {t('The amount will take 24 hours to credit in your account.')}
          </p>

          {hasPendingWithdrawal ? (
            <p className="mt-1.5 text-[11px] font-medium text-warning">
              {t('You already have a withdrawal in progress.')}
            </p>
          ) : null}

          {withdrawalError ? (
            <p role="alert" className="mt-1.5 text-[11px] font-medium text-danger">
              {t(withdrawalError)}
            </p>
          ) : null}
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">
            {t('Withdrawal history')}
          </p>

          {withdrawals.length > 0 ? (
            <ul className="mt-2 divide-y divide-line">
              {withdrawals.map((withdrawal, index) => (
                <Reveal
                  as="li"
                  key={withdrawal.id}
                  index={index}
                  className="flex items-start justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">
                      {formatCurrency(withdrawal.amount, locale)}
                    </p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {withdrawal.upiId}
                    </p>
                    <p className="text-[10.5px] text-ink-soft">
                      {withdrawal.id} ·{' '}
                      {formatShortDate(withdrawal.requestedAt, locale)}
                    </p>
                  </div>
                  <Badge
                    tone={withdrawalTones[withdrawal.status]}
                    size="sm"
                  >
                    {t(withdrawalLabels[withdrawal.status])}
                  </Badge>
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11.5px] text-ink-muted">
              {t('No withdrawal requests yet.')}
            </p>
          )}
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">{t('Earnings trend')}</p>
          <p className="text-[11.5px] text-ink-muted">{chartSubtitle}</p>

          {chartPoints.every((point) => point.amount === 0) ? (
            <p className="mt-4 rounded-xl bg-canvas px-3 py-4 text-center text-[11.5px] text-ink-muted">
              {t('No completed deliveries in this period.')}
            </p>
          ) : (
            <EarningsChart
              points={chartPoints}
              max={maxPoint}
              selectedLabel={selectedBucket?.label}
              onSelect={selectBucket}
            />
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
                {visibleDeliveries.map((delivery, index) => (
                <Reveal
                  as="li"
                  key={delivery.id}
                  index={index}
                  className="py-2.5"
                >
                  <button
                    type="button"
                    aria-label={t('View delivery details')}
                    onClick={() => setSelectedDelivery(delivery)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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
                          delivery.status === 'cancelled'
                            ? 'danger'
                            : 'success'
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
                  </button>
                </Reveal>
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
              {payouts.map((payout, index) => (
                <Reveal
                  as="li"
                  key={payout.id}
                  index={index}
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
                </Reveal>
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

      {selectedDelivery ? (
        <DeliveryDetailsDialog
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      ) : null}

      {withdrawOpen ? (
        <WithdrawDialog
          available={availableBalance}
          lastUpiId={lastUpiId}
          isSubmitting={isSubmitting}
          submitError={withdrawalError}
          onClose={() => setWithdrawOpen(false)}
          onSubmit={submit}
        />
      ) : null}
    </div>
  )
}
