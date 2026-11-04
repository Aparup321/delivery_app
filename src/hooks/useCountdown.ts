import { useCallback, useEffect, useState } from 'react'

/** Counts down from a duration in seconds and can be restarted. */
export function useCountdown(durationSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const restart = useCallback(() => {
    setSecondsLeft(durationSeconds)
  }, [durationSeconds])

  return { secondsLeft, restart, isFinished: secondsLeft <= 0 }
}
