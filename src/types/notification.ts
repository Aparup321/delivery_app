export type NotificationType = 'request' | 'account' | 'delivery' | 'payment'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  at: string
  isRead: boolean
}
