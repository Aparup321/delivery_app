import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type IconTileTone =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'

export type IconTileSize = 'sm' | 'md' | 'lg'

export interface IconTileProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: IconTileTone
  size?: IconTileSize
  /** Decorative icon; the surrounding label carries the meaning. */
  children: ReactNode
}

const toneClasses: Record<IconTileTone, string> = {
  brand: 'bg-brand-soft text-brand-deep',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-canvas text-ink-muted',
}

const sizeClasses: Record<IconTileSize, string> = {
  sm: 'size-8 rounded-lg',
  md: 'size-9 rounded-lg',
  lg: 'size-12 rounded-xl',
}

export function IconTile({
  tone = 'brand',
  size = 'md',
  className,
  children,
  ...props
}: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center',
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
