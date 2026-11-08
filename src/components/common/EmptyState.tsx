import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center px-5 py-10 text-center',
        className,
      )}
    >
      <Icon
        className="size-6 text-ink-soft"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h2 className="mt-3 text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-[32ch] text-[12.5px] leading-relaxed text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
