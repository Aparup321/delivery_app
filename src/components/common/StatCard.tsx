import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  hint?: string
  /** Turns the card into a link to this route. */
  to?: string
}

const cardClasses =
  'rounded-card border border-line/80 bg-surface p-3.5 shadow-card'

export function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  to,
}: StatCardProps) {
  const content = (
    <>
      <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-deep">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-2 text-[17px] font-bold leading-tight text-ink">
        {value}
      </p>
      <p className="text-[11.5px] leading-snug text-ink-muted">{label}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-ink-soft">{hint}</p>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          cardClasses,
          'block transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        )}
      >
        {content}
      </Link>
    )
  }

  return <div className={cardClasses}>{content}</div>
}
