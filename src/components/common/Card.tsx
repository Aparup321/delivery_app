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
        'rounded-card border border-line/80 bg-surface shadow-card',
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
