/** Returns a time-aware greeting such as "Good Morning". */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()

  if (hour < 12) {
    return 'Good Morning'
  }

  if (hour < 17) {
    return 'Good Afternoon'
  }

  return 'Good Evening'
}

/** Calendar-date key (local time) used to group records by day. */
export function todayDateString(): string {
  return new Date().toDateString()
}
