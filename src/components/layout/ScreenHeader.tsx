import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'

export type ScreenHeaderVariant = 'brand' | 'surface'

export interface ScreenHeaderProps {
  title: string
  subtitle?: string
  variant?: ScreenHeaderVariant
  showBack?: boolean
  /** Fallback destination when there is no in-app history to go back to. */
  backTo?: string
  right?: ReactNode
  className?: string
}

export function ScreenHeader({
  title,
  subtitle,
  variant = 'brand',
  showBack = false,
  backTo,
  right,
  className,
}: ScreenHeaderProps) {
  const navigate = useNavigate()
  const isBrand = variant === 'brand'

  return (
    <header
      className={cn(
        'relative overflow-hidden px-5 pb-5',
        isBrand
          ? 'rounded-b-2xl bg-brand-deep pt-6 text-white'
          : 'border-b border-line bg-surface pt-5 text-ink',
        className,
      )}
    >
      <div className="relative flex items-start gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            aria-label="Go back"
            className={cn(
              'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
              isBrand
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-brand-soft text-brand-deep hover:bg-[#e3d8ff]',
            )}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p
              className={cn(
                'mt-0.5 truncate text-[12.5px]',
                isBrand ? 'text-white/75' : 'text-ink-muted',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  )
}
