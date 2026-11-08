import { CheckCheck, Package, ShieldCheck, Truck, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import type { NotificationType } from '../../types/notification'
import { formatTime } from '../../utils/format'

const typeIcons: Record<NotificationType, LucideIcon> = {
  request: Package,
  account: ShieldCheck,
  delivery: Truck,
  payment: Wallet,
}

export function NotificationsPage() {
  const {
    notifications,
    unreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp()

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Notifications"
        subtitle={
          unreadNotifications > 0
            ? `${unreadNotifications} unread`
            : 'You are all caught up'
        }
        showBack
        backTo="/"
      />

      <div className="space-y-4 px-4 pt-5">
        {unreadNotifications > 0 ? (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsRead}
              leftIcon={<CheckCheck className="size-4" aria-hidden="true" />}
            >
              Mark all as read
            </Button>
          </div>
        ) : null}

        {notifications.length > 0 ? (
          <ul className="space-y-2.5">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type]

              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => markNotificationRead(notification.id)}
                    aria-label={`${notification.title}${notification.isRead ? '' : ', unread'}`}
                    className={
                      notification.isRead
                        ? 'w-full rounded-card border border-line bg-surface p-3.5 text-left transition-colors hover:border-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
                        : 'w-full rounded-card border border-brand/20 bg-brand-tint p-3.5 text-left transition-colors hover:border-brand/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-deep">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12.5px] font-bold text-ink">
                            {notification.title}
                          </p>
                          {!notification.isRead ? (
                            <span
                              className="mt-1 size-2 shrink-0 rounded-full bg-brand"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-[10.5px] text-ink-soft">
                          {formatTime(notification.at)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            icon={CheckCheck}
            title="No notifications"
            description="Delivery requests, payment updates and account messages will appear here."
          />
        )}
      </div>
    </div>
  )
}
