import { useEffect, useId, useRef, useState } from 'react'
import { useLanguage } from '../../context/language'
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

/**
 * Six digit boxes backed by one real input.
 *
 * The previous implementation rendered six separate inputs and moved focus on
 * every digit. On a phone that produced two problems: each focus move made the
 * browser scroll the sheet, which read as the screen shaking, and Android/iOS
 * keyboards often fire no `keydown` for backspace, so the delete never reached
 * the controlled value. A single transparent input over the boxes deletes
 * natively, keeps focus in one place, and lets the platform's one-time-code
 * autofill work.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  label = 'Verification code',
  hasError = false,
  autoFocus = false,
  disabled = false,
}: OtpInputProps) {
  const { t } = useLanguage()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const labelText = t(label)
  const characters = Array.from({ length }, (_, index) => value[index] ?? '')
  // The box that shows the caret treatment: the next empty slot, or the last
  // slot once the code is complete.
  const activeIndex = Math.min(value.length, length - 1)

  // Focus without letting the browser scroll the sheet to the field; the field
  // is already on screen and that scroll is what made the page jump.
  useEffect(() => {
    if (!autoFocus || disabled) {
      return
    }

    inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus, disabled])

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[13px] font-semibold text-ink"
      >
        {labelText}
      </label>

      <div className="relative">
        <div
          className="flex items-center justify-between gap-2"
          aria-hidden="true"
        >
          {characters.map((character, index) => {
            const isActive = isFocused && index === activeIndex

            return (
              <span
                key={index}
                className={cn(
                  'grid h-13 w-full min-w-0 place-items-center rounded-2xl border bg-surface text-center text-lg font-bold text-ink transition-colors',
                  hasError ? 'border-danger/60' : 'border-line',
                  isActive && 'ring-4',
                  isActive && (hasError ? 'ring-danger/10' : 'ring-brand/10'),
                  isActive && !hasError && 'border-brand',
                  disabled && 'opacity-60',
                )}
              >
                {character}
              </span>
            )
          })}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={(event) => {
            onChange(event.target.value.replace(/\D/g, '').slice(0, length))
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          disabled={disabled}
          aria-label={labelText}
          aria-invalid={hasError || undefined}
          // Transparent but fully interactive: tapping anywhere on the boxes
          // opens the numeric keyboard and focuses this single input. 16px text
          // stops iOS Safari from zooming the page when the field is focused.
          className="absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] opacity-0 outline-none"
        />
      </div>
    </div>
  )
}
