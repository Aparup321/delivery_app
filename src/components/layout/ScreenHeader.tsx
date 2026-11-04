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
  right?: ReactNode
  className?: string
}

export function ScreenHeader({
  title,
  subtitle,
  variant = 'brand',
  showBack = false,
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
          ? 'rounded-b-3xl bg-brand-gradient pt-6 text-white'
          : 'border-b border-line bg-surface pt-5 text-ink',
        className,
      )}
    >
      {isBrand ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-white/10"
        />
      ) : null}

      <div className="relative flex items-start gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={cn(
              'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full transition-colors',
              isBrand
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-brand-soft text-brand-deep hover:bg-[#e3d8ff]',
            )}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-bold tracking-tight">{title}</h1>
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
