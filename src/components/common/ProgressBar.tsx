import { cn } from '../../utils/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  hint?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  hint,
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100))

  return (
    <div className={cn('w-full', className)}>
      {label || hint ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px] font-semibold">
          {label ? <span className="text-ink">{label}</span> : null}
          {hint ? <span className="text-ink-muted">{hint}</span> : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-label={label ?? 'Progress'}
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-brand-soft"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
