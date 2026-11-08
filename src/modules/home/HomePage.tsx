import {
  Bell,
  ChevronRight,
  ClipboardList,
  LifeBuoy,
  Package,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/common/Avatar'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { IconButton } from '../../components/common/IconButton'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Toggle } from '../../components/common/Toggle'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import { dashboardStats, earningsSummary } from '../../mock/earnings'
import { currentPartner } from '../../mock/partner'
import { applicationStatusMeta } from '../../utils/applicationStatus'
import { deliveryStatusLabels } from '../../utils/delivery'
import { formatCurrency, formatDate } from '../../utils/format'

interface QuickAction {
  label: string
  to: string
  icon: LucideIcon
}

const quickActions: QuickAction[] = [
  { label: 'Find requests', to: '/deliveries', icon: Package },
  { label: 'My orders', to: '/history', icon: ClipboardList },
  { label: 'Earnings', to: '/earnings', icon: Wallet },
  { label: 'Support', to: '/support', icon: LifeBuoy },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

export function HomePage() {
  const navigate = useNavigate()
  const {
    isOnline,
    setOnline,
    requests,
    activeDelivery,
    acceptRequest,
    rejectRequest,
    unreadNotifications,
    onboarding,
  } = useApp()
  const { t } = useLanguage()
  const partner = currentPartner
  const nextRequest = requests[0]
  const displayName = onboarding.fullName.trim() || t('Partner')
  const firstName = displayName.split(' ')[0] ?? displayName
  const applicationStatus = applicationStatusMeta[onboarding.status]

  return (
    <div className="pb-6">
      <header className="bg-surface px-5 pb-3 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/profile"
            aria-label={t('Open profile')}
            className="flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Avatar
              name={displayName}
              src={onboarding.profilePhoto || partner.avatarUrl}
              className="ring-2 ring-brand-soft"
            />
            <div className="min-w-0">
              <p className="text-[11.5px] font-medium text-ink-muted">
                {t('Delivery partner')}
              </p>
              <h1 className="truncate text-[19px] font-semibold tracking-tight text-ink">
                {firstName}
              </h1>
            </div>
          </Link>

          <div className="relative shrink-0">
            <IconButton
              label={
                unreadNotifications > 0
                  ? t('Notifications, {count} unread', {
                      count: unreadNotifications,
                    })
                  : t('Notifications')
              }
              variant="soft"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="size-5" aria-hidden="true" />
            </IconButton>
            {unreadNotifications > 0 ? (
              <span className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
                {unreadNotifications}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-1">
        <Card padding="md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={
                  isOnline
                    ? 'size-2.5 rounded-full bg-success'
                    : 'size-2.5 rounded-full bg-ink-soft'
                }
              />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">
                  {t(isOnline ? 'You are Online' : 'You are Offline')}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {t(
                    isOnline
                      ? 'Receiving delivery requests'
                      : 'Go online to receive requests',
                  )}
                </p>
              </div>
            </div>
            <Toggle
              checked={isOnline}
              onChange={setOnline}
              label={t('Availability')}
            />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                {t(applicationStatus.headline)}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                {t(applicationStatus.description)}
              </p>
              {onboarding.submittedAt ? (
                <p className="mt-1 text-[11px] text-ink-soft">
                  {t('Submitted')} {formatDate(onboarding.submittedAt)}
                </p>
              ) : null}
            </div>
            <Badge tone={applicationStatus.tone} size="sm">
              {t(applicationStatus.label)}
            </Badge>
          </div>
          <Button
            className="-ml-2 mt-2"
            size="sm"
            variant="ghost"
            onClick={() =>
              navigate(
                onboarding.status === 'draft'
                  ? '/onboarding'
                  : '/application-status',
              )
            }
            rightIcon={<ChevronRight className="size-4" aria-hidden="true" />}
          >
            {t(
              onboarding.status === 'draft' ? 'Continue setup' : 'Track status',
            )}
          </Button>
        </Card>

        {activeDelivery ? (
          <Card padding="md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11.5px] font-medium text-ink-muted">
                  {t('Active delivery')}
                </p>
                <p className="mt-0.5 text-[13.5px] font-semibold text-ink">
                  {activeDelivery.id}
                </p>
              </div>
              <Badge tone="brand" size="sm">
                {t(deliveryStatusLabels[activeDelivery.status])}
              </Badge>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              {activeDelivery.pickup.name} → {activeDelivery.destination.name}
            </p>
            <Button
              className="mt-3"
              fullWidth
              variant="secondary"
              onClick={() => navigate('/deliveries/active')}
              rightIcon={<ChevronRight className="size-4" aria-hidden="true" />}
            >
              {t('Continue delivery')}
            </Button>
          </Card>
        ) : null}

        <div className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-card border border-line bg-surface">
          <Link
            to="/deliveries"
            className="px-3 py-3 transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <p className="text-[11px] font-medium text-ink-muted">
              {t('Deliveries')}
            </p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums leading-none text-ink">
              {earningsSummary.deliveriesToday}
            </p>
          </Link>
          <Link
            to="/earnings"
            className="px-3 py-3 transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <p className="text-[11px] font-medium text-ink-muted">
              {t('Earnings')}
            </p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums leading-none text-ink">
              {formatCurrency(earningsSummary.today)}
            </p>
          </Link>
          <Link
            to="/profile"
            className="px-3 py-3 transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <p className="text-[11px] font-medium text-ink-muted">
              {t('Rating')}
            </p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums leading-none text-ink">
              {dashboardStats.rating.toFixed(1)}
            </p>
          </Link>
        </div>

        <section>
          <SectionHeading title={t('Quick actions')} />
          <div className="mt-2 grid grid-cols-2 gap-x-2">
            {quickActions.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Icon
                  className="size-[18px] shrink-0 text-ink-muted"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-[12.5px] font-medium leading-tight text-ink">
                  {t(label)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title={t('New requests')}
            subtitle={
              isOnline
                ? t('{count} waiting', { count: requests.length })
                : t('Offline')
            }
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/deliveries')}
              >
                {t('View all')}
              </Button>
            }
          />
          {isOnline && nextRequest ? (
            <Card padding="md" className="mt-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">
                      {nextRequest.id}
                    </span>
                    <Badge
                      tone={
                        nextRequest.category === 'Grocery' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {t(nextRequest.category)}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-ink-muted">
                    {nextRequest.pickup.name} → {nextRequest.destination.name}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] font-semibold tabular-nums text-brand-deep">
                  {formatCurrency(nextRequest.earnings)}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-3 text-[11.5px] text-ink-muted">
                <span>
                  {t('{count} km', { count: nextRequest.distanceKm })}
                </span>
                <span>
                  {t('{count} min', { count: nextRequest.etaMinutes })}
                </span>
                <span>
                  {t('{count} items', { count: nextRequest.itemCount })}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => rejectRequest(nextRequest.id)}
                >
                  {t('Reject')}
                </Button>
                <Button
                  onClick={() => {
                    acceptRequest(nextRequest.id)
                    navigate('/deliveries/active')
                  }}
                >
                  {t('Accept')}
                </Button>
              </div>
            </Card>
          ) : (
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              {t(
                isOnline
                  ? 'No requests right now. Stay online to get the next job.'
                  : 'Turn on availability to start receiving nearby grocery and restaurant requests.',
              )}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
