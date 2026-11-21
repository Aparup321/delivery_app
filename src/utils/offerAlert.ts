/**
 * A short generated alert for a new delivery offer. No audio file is stored or
 * fetched: the tone is created with the Web Audio API, and vibration is used
 * where the device supports it.
 */
export function playOfferAlert(): void {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (AudioContextClass) {
      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, context.currentTime)
      oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.32)
      void context.close().catch(() => {
        // Some browsers close the context automatically.
      })
    }
  } catch {
    // Audio is best-effort; the visual alert always remains.
  }

  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate([200, 100, 200])
    }
  } catch {
    // Vibration is optional.
  }
}
