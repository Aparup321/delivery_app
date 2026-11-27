import { createElement } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { revealStyle } from '../../utils/reveal'

export type RevealAs = 'div' | 'li' | 'section'

export interface RevealProps {
  children: ReactNode
  /** Position in a list; later items start 45 ms after the previous one. */
  index?: number
  as?: RevealAs
  className?: string
}

/**
 * Wraps a list item so it settles in after the page has entered. All motion is
 * disabled under `prefers-reduced-motion` by the `.reveal-up` utility.
 */
export function Reveal({
  children,
  index = 0,
  as = 'div',
  className,
}: RevealProps) {
  return createElement(
    as,
    { className: cn('reveal-up', className), style: revealStyle(index) },
    children,
  )
}
