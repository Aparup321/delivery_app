import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type IconButtonVariant = 'surface' | 'soft' | 'ghost' | 'onBrand'
export type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name for the icon-only button. */
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  children: ReactNode
}

const variantClasses: Record<IconButtonVariant, string> = {
  surface:
    'border border-line bg-surface text-ink hover:border-brand/30 hover:bg-brand-tint',
  soft: 'bg-brand-soft text-brand-deep hover:bg-[#e3d8ff]',
  ghost: 'text-ink-muted hover:bg-brand-soft hover:text-brand-deep',
  onBrand: 'bg-white/15 text-white hover:bg-white/25',
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-9',
  md: 'size-11',
}

export function IconButton({
  label,
  variant = 'surface',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
