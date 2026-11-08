import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export interface StatCardProps {
  value: string
  label: string
  hint?: string
  /** Turns the card into a link to this route. */
  to?: string
}

const cardClasses = 'rounded-card border border-line bg-surface p-4'

export function StatCard({ value, label, hint, to }: StatCardProps) {
  const content = (
    <>
      <p className="text-[11.5px] font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-[20px] font-semibold tabular-nums leading-none text-ink">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-ink-soft">{hint}</p>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          cardClasses,
          'block transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        )}
      >
        {content}
      </Link>
    )
  }

  return <div className={cardClasses}>{content}</div>
}
