import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface OptionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders the selected (pressed) treatment. Omit for one-shot actions. */
  selected?: boolean
  /** `brand` for choices, `danger` for destructive reasons. */
  tone?: 'brand' | 'danger'
  children: ReactNode
}

/**
 * The one shape used for reason and choice lists: rejection reasons on the
 * offer card and issue reasons on an active delivery previously drifted apart
 * in radius and hover tone.
 */
export function OptionButton({
  selected,
  tone = 'brand',
  className,
  children,
  ...props
}: OptionButtonProps) {
  const isSelectable = selected !== undefined

  return (
    <button
      type="button"
      aria-pressed={isSelectable ? selected : undefined}
      className={cn(
        'w-full rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2',
        tone === 'danger'
          ? 'border-line bg-surface font-medium text-ink hover:border-danger/40 hover:bg-danger-soft focus-visible:ring-danger/30'
          : selected
            ? 'border-brand/40 bg-brand-tint font-semibold text-brand-deep focus-visible:ring-brand/40'
            : 'border-line bg-surface font-medium text-ink hover:border-brand/25 hover:bg-brand-tint focus-visible:ring-brand/40',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
