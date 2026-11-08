import {
  Bell,
  ChevronRight,
  ClipboardList,
  LifeBuoy,
  Package,
  Star,
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
import { StatCard } from '../../components/common/StatCard'
import { Toggle } from '../../components/common/Toggle'
import { useApp } from '../../context/app-store'
import { dashboardStats, earningsSummary } from '../../mock/earnings'
import { currentPartner } from '../../mock/partner'
import { deliveryStatusLabels } from '../../utils/delivery'
import { getGreeting } from '../../utils/date'
import { formatCurrency, formatDate } from '../../utils/format'

interface QuickAction {
  label: string
  to: string
  icon: LucideIcon
}

const quickActions: QuickAction[] = [
  { label: 'Find Requests', to: '/deliveries', icon: Package },
  { label: 'My Orders', to: '/history', icon: ClipboardList },
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
  const partner = currentPartner
  const nextRequest = requests[0]
  const displayName = onboarding.fullName.trim() || 'Partner'
  const firstName = displayName.split(' ')[0] ?? displayName

  return (
    <div className="pb-6">
      <header className="bg-surface px-5 pb-3 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/profile"
            aria-label="Open profile"
            className="flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Avatar
              name={displayName}
              src={onboarding.profilePhoto || partner.avatarUrl}
              className="ring-2 ring-brand-soft"
            />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink-muted">
                {getGreeting()} 👋
              </p>
              <h1 className="truncate text-[19px] font-bold tracking-tight text-ink">
                {firstName}
              </h1>
            </div>
          </Link>

          <div className="relative shrink-0">
            <IconButton
              label={
                unreadNotifications > 0
                  ? `Notifications, ${unreadNotifications} unread`
                  : 'Notifications'
              }
              variant="soft"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="size-5" aria-hidden="true" />
            </IconButton>
            {unreadNotifications > 0 ? (
              <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white">
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
                <p className="text-[13.5px] font-bold text-ink">
                  {isOnline ? 'You are Online' : 'You are Offline'}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {isOnline
                    ? 'Receiving delivery requests'
                    : 'Go online to receive requests'}
                </p>
              </div>
            </div>
            <Toggle checked={isOnline} onChange={setOnline} label="Availability" />
          </div>
        </Card>

        {onboarding.status === 'draft' ? (
          <Card padding="md" className="border-brand/20 bg-brand-tint">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-bold text-ink">
                  Finish your partner setup
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                  Add address, KYC, vehicle and bank details to get approved for
                  deliveries.
                </p>
              </div>
              <Badge tone="warning" size="sm">
                Pending
              </Badge>
            </div>
            <Button
              className="mt-3"
              size="sm"
              fullWidth
              onClick={() => navigate('/onboarding')}
              rightIcon={<ChevronRight className="size-4" aria-hidden="true" />}
            >
              Continue setup
            </Button>
          </Card>
        ) : (
          <Card padding="md" className="border-success/20 bg-success-soft">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold text-ink">
                  Application under review
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                  Submitted on{' '}
                  {onboarding.submittedAt
                    ? formatDate(onboarding.submittedAt)
                    : 'recently'}
                  . Verification usually takes one working day.
                </p>
              </div>
              <Badge tone="success" size="sm">
                Submitted
              </Badge>
            </div>
          </Card>
        )}

        {activeDelivery ? (
          <Card padding="md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Active delivery
                </p>
                <p className="mt-0.5 text-[13.5px] font-bold text-ink">
                  {activeDelivery.id}
                </p>
              </div>
              <Badge tone="brand" size="sm">
                {deliveryStatusLabels[activeDelivery.status]}
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
              Continue delivery
            </Button>
          </Card>
        ) : null}

        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            icon={Package}
            value={String(earningsSummary.deliveriesToday)}
            label="Today's Deliveries"
            to="/deliveries"
          />
          <StatCard
            icon={Wallet}
            value={formatCurrency(earningsSummary.today)}
            label="Today's Earnings"
            to="/earnings"
          />
          <StatCard
            icon={Star}
            value={dashboardStats.rating.toFixed(1)}
            label="Your Rating"
            to="/profile"
          />
        </div>

        <section>
          <SectionHeading title="Quick Actions" />
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {quickActions.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2 rounded-card border border-line/80 bg-surface px-2 py-3 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-deep">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="text-[11.5px] font-semibold leading-tight text-ink">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="New requests"
            subtitle={isOnline ? `${requests.length} waiting` : 'Offline'}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/deliveries')}
              >
                View all
              </Button>
            }
          />
          {isOnline && nextRequest ? (
            <Card padding="md" className="mt-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-ink">
                      {nextRequest.id}
                    </span>
                    <Badge
                      tone={
                        nextRequest.category === 'Grocery' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {nextRequest.category}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-ink-muted">
                    {nextRequest.pickup.name} → {nextRequest.destination.name}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] font-bold text-brand-deep">
                  {formatCurrency(nextRequest.earnings)}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-3 text-[11.5px] text-ink-muted">
                <span>{nextRequest.distanceKm} km</span>
                <span>{nextRequest.etaMinutes} min</span>
                <span>{nextRequest.itemCount} items</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => rejectRequest(nextRequest.id)}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    acceptRequest(nextRequest.id)
                    navigate('/deliveries/active')
                  }}
                >
                  Accept
                </Button>
              </div>
            </Card>
          ) : (
            <p className="mt-2 rounded-2xl bg-brand-tint px-3 py-3 text-[12px] leading-relaxed text-ink-muted">
              {isOnline
                ? 'No requests right now. Stay online to get the next job.'
                : 'Turn on availability to start receiving nearby grocery and restaurant requests.'}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
