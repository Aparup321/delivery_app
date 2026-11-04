import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-[0_12px_26px_-16px_rgba(81,35,165,0.85)] hover:bg-brand-hover active:bg-brand-deep',
  secondary: 'bg-brand-soft text-brand-deep hover:bg-[#e3d8ff]',
  outline:
    'border border-line bg-surface text-ink hover:border-brand/35 hover:bg-brand-tint',
  ghost: 'text-brand-deep hover:bg-brand-soft',
  danger: 'bg-danger text-white hover:bg-[#c93a37]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-xl px-3.5 text-[13px]',
  md: 'h-11 rounded-2xl px-5 text-sm',
  lg: 'h-13 rounded-2xl px-6 text-[15px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-55',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
