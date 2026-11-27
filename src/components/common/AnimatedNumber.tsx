import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export interface AnimatedNumberProps {
  value: number
  /** Formats the in-between value, e.g. currency with the active locale. */
  format?: (value: number) => string
  className?: string
  durationMs?: number
}

/**
 * Counts from the previous value to the next one. Starts at zero on mount so
 * live totals settle in, and updates smoothly when a live delivery changes the
 * value. Reduced-motion users see the final number immediately.
 */
export function AnimatedNumber({
  value,
  format = (next) => String(Math.round(next)),
  className,
  durationMs = 720,
}: AnimatedNumberProps) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(() => (reduced ? value : 0))
  const displayRef = useRef(display)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) {
      return
    }

    const from = displayRef.current
    if (from === value) {
      return
    }

    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (value - from) * eased
      displayRef.current = next
      setDisplay(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [durationMs, reduced, value])

  return <span className={className}>{format(reduced ? value : display)}</span>
}
