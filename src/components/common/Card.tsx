import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  /** Adds a hover lift for cards the partner can tap. */
  interactive?: boolean
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

/**
 * The shared card surface. Exported for elements that cannot render a `div`
 * (buttons, `details`) so screens do not copy the border/radius/background
 * string and drift away from the design system.
 */
export const cardSurface =
  'rounded-card border border-line bg-surface shadow-card'

export function Card({
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        cardSurface,
        interactive && 'transition-colors hover:border-brand/30',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
