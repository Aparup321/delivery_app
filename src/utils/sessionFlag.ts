/**
 * The demo keeps the device's Firebase account after app sign-out so the same
 * number can resume its partner record. This flag prevents that account from
 * silently restoring the app without the OTP step, and stops an explicit
 * sign-out from saving a protected page as the next sign-in destination.
 */
const SIGNED_OUT_KEY = 'fafo.partner.signed-out'

export function hasSignedOutFlag(): boolean {
  try {
    return window.localStorage.getItem(SIGNED_OUT_KEY) === '1'
  } catch {
    return false
  }
}

export function markSignedOut(): void {
  try {
    window.localStorage.setItem(SIGNED_OUT_KEY, '1')
  } catch {
    // Storage can be blocked; the in-memory session still signs out.
  }
}

export function clearSignedOutFlag(): void {
  try {
    window.localStorage.removeItem(SIGNED_OUT_KEY)
  } catch {
    // Nothing to clear when storage is blocked.
  }
}
