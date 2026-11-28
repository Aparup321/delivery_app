import { cn } from '../../utils/cn'

export interface SpinnerProps {
  /** Accessible name; omit for a decorative spinner inside a labelled control. */
  label?: string
  className?: string
}

/** The one loading indicator used by routes, guards and buttons. */
export function Spinner({ label, className }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      className={cn(
        'inline-block size-6 animate-spin rounded-full border-2 border-brand border-t-transparent',
        className,
      )}
    />
  )
}
