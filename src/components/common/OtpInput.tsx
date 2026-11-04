import { useRef } from 'react'
import type {
  ClipboardEvent,
  KeyboardEvent,
} from 'react'
import { cn } from '../../utils/cn'

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  label?: string
  hasError?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  label = 'Verification code',
  hasError = false,
  autoFocus = false,
  disabled = false,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const characters = Array.from({ length }, (_, index) => value[index] ?? '')

  function focusAt(index: number) {
    inputsRef.current[Math.min(Math.max(index, 0), length - 1)]?.focus()
  }

  function commit(next: string[]) {
    onChange(next.join('').replace(/\s+/g, ''))
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)

    if (!digit) {
      return
    }

    const next = [...characters]
    next[index] = digit
    commit(next)
    focusAt(index + 1)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const next = [...characters]

      if (next[index]) {
        next[index] = ''
        commit(next)
        return
      }

      if (index > 0) {
        next[index - 1] = ''
        commit(next)
        focusAt(index - 1)
      }
    }

    if (event.key === 'ArrowLeft') {
      focusAt(index - 1)
    }

    if (event.key === 'ArrowRight') {
      focusAt(index + 1)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    if (!pasted) {
      return
    }

    onChange(pasted)
    focusAt(pasted.length)
  }

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-ink">{label}</p>
      <div
        className="flex items-center justify-between gap-2"
        role="group"
        aria-label={label}
      >
        {characters.map((character, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element
            }}
            value={character}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            aria-label={`${label} digit ${index + 1}`}
            aria-invalid={hasError || undefined}
            className={cn(
              'h-13 w-full min-w-0 rounded-2xl border bg-surface text-center text-lg font-bold text-ink transition-colors',
              'focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10',
              hasError
                ? 'border-danger/60'
                : 'border-line hover:border-brand/30',
              disabled && 'opacity-60',
            )}
          />
        ))}
      </div>
    </div>
  )
}
