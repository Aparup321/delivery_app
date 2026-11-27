import type { CSSProperties } from 'react'

/**
 * Stagger delay for an element that applies `.reveal-up` directly (grid cells,
 * links). The Reveal component uses the same value.
 */
export function revealStyle(index = 0): CSSProperties {
  return { '--reveal-delay': `${Math.min(index, 9) * 45}ms` } as CSSProperties
}
