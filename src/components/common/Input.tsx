import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  containerClassName?: string
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  required,
  ...props
}: InputProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-ink"
        >
          {label}
          {required ? <span className="text-danger">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
            {leftIcon}
          </span>
        ) : null}

        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-2xl border bg-surface px-4 text-sm font-medium text-ink transition-colors',
            'placeholder:font-normal placeholder:text-ink-soft',
            'focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10',
            leftIcon ? 'pl-10' : null,
            rightIcon ? 'pr-10' : null,
            error ? 'border-danger/60' : 'border-line hover:border-brand/30',
            className,
          )}
          {...props}
        />

        {rightIcon ? (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
            {rightIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
