import {
  Bell,
  ChevronRight,
  Clock3,
  History,
  LifeBuoy,
  Package,
  Star,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  description: string
  to: string
  icon: LucideIcon
}

const quickActions: QuickAction[] = [
  {
    label: 'Deliveries',
    description: 'Requests & active jobs',
    to: '/deliveries',
    icon: Package,
  },
  {
    label: 'History',
    description: 'Completed deliveries',
    to: '/history',
    icon: History,
  },
  {
    label: 'Earnings',
    description: 'Payouts & incentives',
    to: '/earnings',
    icon: Wallet,
  },
  {
    label: 'Support',
    description: 'Help & FAQs',
    to: '/support',
    icon: LifeBuoy,
  },
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

  return (
    <div className="pb-6">
      <header className="relative overflow-hidden rounded-b-[2rem] bg-brand-gradient px-5 pb-9 pt-6 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-4 size-48 rounded-full bg-white/5"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white/75">
              {getGreeting()} 👋
            </p>
            <h1 className="mt-1 truncate text-[22px] font-bold tracking-tight">
              {partner.fullName}
            </h1>
            <p className="mt-1 text-[11.5px] text-white/60">
              Partner ID · {partner.id}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <IconButton
                label={
                  unreadNotifications > 0
                    ? `Notifications, ${unreadNotifications} unread`
                    : 'Notifications'
                }
                variant="onBrand"
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
            <Avatar
              name={partner.fullName}
              src={partner.avatarUrl}
              className="ring-2 ring-white/25"
            />
          </div>
        </div>
      </header>

      <div className="-mt-6 space-y-4 px-4">
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
                  {isOnline ? 'You are online' : 'You are offline'}
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

        <section>
          <SectionHeading title="Today at a glance" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard
              icon={Package}
              value={String(earningsSummary.deliveriesToday)}
              label="Deliveries"
            />
            <StatCard
              icon={Wallet}
              value={formatCurrency(earningsSummary.today)}
              label="Earnings"
            />
            <StatCard
              icon={Clock3}
              value={dashboardStats.workingHours}
              label="Working hours"
            />
            <StatCard
              icon={Star}
              value={dashboardStats.rating.toFixed(1)}
              label="Your rating"
            />
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

        <section>
          <SectionHeading title="Quick actions" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {quickActions.map(({ label, description, to, icon: Icon }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="group rounded-card border border-line/80 bg-surface p-3.5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-deep transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="mt-2.5 block text-[13px] font-semibold text-ink">
                  {label}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-muted">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
