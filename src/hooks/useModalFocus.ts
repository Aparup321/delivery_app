import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'

/**
 * Shared modal behaviour: initial focus, Tab trap, Escape close and focus
 * restore. All partner dialogs use this so their keyboard behaviour is equal.
 */
export function useModalFocus<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClose: () => void,
  active = true,
) {
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const scroller = document.querySelector<HTMLElement>('main.app-scrollbar')
    const previousOverflow = scroller?.style.overflow ?? ''
    if (scroller) scroller.style.overflow = 'hidden'

    const focusable = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
    ;(focusable()[0] ?? node).focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const elements = focusable()
      if (!elements.length) {
        event.preventDefault()
        node?.focus()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (scroller) scroller.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [active, ref])
}
