/** Formats an amount in Indian rupees, e.g. ₹1,240. */
export function formatCurrency(amount: number, locale = 'en-IN'): string {
  return `₹${amount.toLocaleString(locale)}`
}

/** Formats an ISO timestamp as a 12-hour time, e.g. 10:24 AM. */
export function formatTime(iso: string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

/** Formats an ISO timestamp as a short date, e.g. 4 Nov 2026. */
export function formatDate(iso: string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

/** Formats an ISO timestamp as a day and month, e.g. 4 Nov. */
export function formatShortDate(iso: string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}
