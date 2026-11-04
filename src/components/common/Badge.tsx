import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  size?: BadgeSize
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-ink-muted ring-1 ring-line',
  brand: 'bg-brand-soft text-brand-deep',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10.5px]',
  md: 'px-2.5 py-1 text-[11.5px]',
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
