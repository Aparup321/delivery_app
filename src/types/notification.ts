export type NotificationType = 'request' | 'account' | 'delivery' | 'payment'

export interface AppNotification {
  id: string
  type: NotificationType
  /** Translation template; {placeholders} are filled from vars. */
  title: string
  body: string
  /** Values for the title/body placeholders, so notifications translate. */
  vars?: Record<string, string | number>
  at: string
  isRead: boolean
}
