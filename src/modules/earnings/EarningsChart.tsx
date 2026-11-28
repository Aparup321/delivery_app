import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLanguage } from '../../context/language'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { formatCurrency } from '../../utils/format'

export interface EarningsChartPoint {
  label: string
  amount: number
  /** Present on live points so a bar can open that bucket's statements. */
  start?: string
  end?: string
}

export interface EarningsChartProps {
  points: EarningsChartPoint[]
  max: number
  selectedLabel?: string
  onSelect: (point: EarningsChartPoint) => void
}

interface TooltipItem {
  payload?: EarningsChartPoint
}

interface TooltipContentProps {
  active?: boolean
  payload?: TooltipItem[]
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const { t, locale } = useLanguage()
  const point = payload?.[0]?.payload

  if (!active || !point) {
    return null
  }

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-float">
      <p className="text-[10.5px] font-semibold text-ink-muted">{point.label}</p>
      <p className="mt-0.5 text-[13px] font-bold tabular-nums text-ink">
        {formatCurrency(point.amount, locale)}
      </p>
      {point.start && point.amount > 0 ? (
        <p className="mt-0.5 text-[10px] text-ink-soft">
          {t('Tap to open this range')}
        </p>
      ) : null}
    </div>
  )
}

/** Animated, interactive earnings bars. Recharts handles the grow-in, hover
 * tooltip and touch; clicking a bar opens that bucket's statements. */
export function EarningsChart({
  points,
  max,
  selectedLabel,
  onSelect,
}: EarningsChartProps) {
  const { t } = useLanguage()
  const reduced = usePrefersReducedMotion()

  function handleChartClick(state: unknown) {
    const active = (
      state as
        | { activePayload?: Array<{ payload?: EarningsChartPoint }> }
        | null
        | undefined
    )?.activePayload?.[0]?.payload

    if (active?.start && active.end && active.amount > 0) {
      onSelect(active)
    }
  }

  return (
    <div
      className="mt-3 h-44 w-full"
      role="group"
      aria-label={t('Earnings bar chart')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 10, right: 2, bottom: 0, left: 2 }}
          onClick={handleChartClick}
          accessibilityLayer
        >
          <defs>
            <linearGradient id="earnings-bar" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-brand)"
                stopOpacity={0.9}
              />
              <stop
                offset="100%"
                stopColor="var(--color-brand)"
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="var(--color-line)"
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 10.5 }}
            dy={4}
          />
          <YAxis hide domain={[0, Math.max(1, max) * 1.18]} />
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="amount"
            radius={[7, 7, 2, 2]}
            maxBarSize={46}
            isAnimationActive={!reduced}
            animationDuration={780}
            animationEasing="ease-out"
          >
            {points.map((point) => (
              <Cell
                key={point.label}
                fill={
                  selectedLabel === point.label
                    ? 'var(--color-brand-deep)'
                    : 'url(#earnings-bar)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
