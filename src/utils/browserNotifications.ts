/**
 * Foreground browser notifications for delivery events that arrive while the
 * tab is in the background. The Web Notifications API only works while the app
 * is open — notifying a partner whose app is closed needs Firebase Cloud
 * Messaging plus a server-side sender (a Cloud Function), which this project
 * does not run yet.
 */

export function canUseBrowserNotifications(): boolean {
  return (
    typeof window !== 'undefined' && typeof Notification !== 'undefined'
  )
}

/** Resolves true when browser notifications may be shown. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!canUseBrowserNotifications()) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  try {
    return (await Notification.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

/**
 * Shows a system notification only when the app tab is not visible. Nothing
 * is shown while the partner is actively looking at the app.
 */
export function notifyIfBackground(title: string, body: string): void {
  if (!canUseBrowserNotifications()) {
    return
  }

  if (Notification.permission !== 'granted') {
    return
  }

  if (
    typeof document !== 'undefined' &&
    document.visibilityState === 'visible'
  ) {
    return
  }

  try {
    new Notification(title, { body })
  } catch {
    // Some browsers require a service worker for constructor notifications.
  }
}
