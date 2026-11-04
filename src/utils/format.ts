/** Formats an amount in Indian rupees, e.g. ₹1,240. */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/** Formats an ISO timestamp as a 12-hour time, e.g. 10:24 AM. */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

/** Formats an ISO timestamp as a short date, e.g. 4 Nov 2026. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

/** Formats an ISO timestamp as a day and month, e.g. 4 Nov. */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}
