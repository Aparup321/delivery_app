import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function currentPreference(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches
}

/** Live reduced-motion preference; charts and counters disable motion with it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(currentPreference)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(QUERY)
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}
