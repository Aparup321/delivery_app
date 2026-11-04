import { useState } from 'react'
import { TrendingUp, Wallet } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { StatCard } from '../../components/common/StatCard'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import {
  earningsChart,
  earningsSummary,
  payouts,
} from '../../mock/earnings'
import type { EarningsPeriod } from '../../types/earnings'
import { formatCurrency, formatShortDate } from '../../utils/format'

export function EarningsPage() {
  const { history } = useApp()
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

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Earnings"
        subtitle="Payouts, incentives and delivery earnings"
      />

      <div className="space-y-4 px-4 pt-5">
        <SegmentedTabs
          label="Earnings period"
          value={period}
          onChange={(value) => setPeriod(value as EarningsPeriod)}
          items={[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
          ]}
        />

        <Card padding="lg">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">
            {period === 'today'
              ? "Today's earnings"
              : period === 'week'
                ? 'This week'
                : 'This month'}
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-[28px] font-bold leading-none tracking-tight text-ink">
              {formatCurrency(amount)}
            </p>
            <Badge tone="success" size="sm">
              <TrendingUp className="size-3" aria-hidden="true" />
              +{earningsSummary.changePercent}%
            </Badge>
          </div>

          <p className="mt-2 text-[11.5px] text-ink-muted">
            Includes {formatCurrency(earningsSummary.incentive)} of incentives
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Wallet}
            value={String(deliveries)}
            label="Deliveries"
            hint={period === 'today' ? 'Today' : 'This period'}
          />
          <StatCard
            icon={TrendingUp}
            value={formatCurrency(average)}
            label="Avg. per delivery"
            hint="After incentives"
          />
        </div>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">Earnings trend</p>
          <p className="text-[11.5px] text-ink-muted">
            Today, by time of day
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
                          ? 'w-full rounded-t-lg bg-brand-deep transition-all duration-300'
                          : 'w-full rounded-t-lg bg-brand/35 transition-all duration-300'
                      }
                      style={{ height: `${height}%` }}
                      title={`${point.label}: ${formatCurrency(point.amount)}`}
                    />
                  </div>
                  <span className="text-[9.5px] font-medium text-ink-soft">
                    {point.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">Recent deliveries</p>

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
                      ? formatShortDate(delivery.completedAt)
                      : '—'}{' '}
                    · {delivery.destination.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] font-bold text-ink">
                    {formatCurrency(delivery.earnings)}
                  </span>
                  <Badge
                    tone={
                      delivery.status === 'cancelled' ? 'danger' : 'success'
                    }
                    size="sm"
                  >
                    {delivery.status === 'cancelled' ? 'Cancelled' : 'Paid'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">Payouts</p>

          <ul className="mt-2 divide-y divide-line">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">
                    {payout.period}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {payout.id} · {payout.paidOn}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] font-bold text-ink">
                    {formatCurrency(payout.amount)}
                  </span>
                  <Badge
                    tone={payout.status === 'Paid' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {payout.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <p className="px-1 text-center text-[11px] leading-relaxed text-ink-soft">
          Demo data for this phase. Earnings will come from live delivery and
          payment records after the backend integration.
        </p>
      </div>
    </div>
  )
}
