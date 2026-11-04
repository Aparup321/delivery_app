import { useState } from 'react'
import {
  AlertTriangle,
  MapPin,
  Navigation,
  Phone,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionHeading } from '../../components/common/SectionHeading'
import { DeliveryTimeline } from '../../components/deliveries/DeliveryTimeline'
import { MapPreview } from '../../components/deliveries/MapPreview'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import {
  deliveryStatusLabels,
  nextDeliveryAction,
} from '../../utils/delivery'
import { formatCurrency } from '../../utils/format'

const issueReasons = [
  'Customer is unreachable',
  'Address could not be found',
  'Order was damaged',
  'Vehicle breakdown',
]

export function ActiveDeliveryPage() {
  const navigate = useNavigate()
  const { activeDelivery, advanceDelivery, cancelDelivery } = useApp()
  const [showIssues, setShowIssues] = useState(false)

  if (!activeDelivery) {
    return (
      <div className="pb-8">
        <ScreenHeader
          title="Active delivery"
          subtitle="No delivery in progress"
          showBack
        />
        <div className="px-4 pt-6">
          <EmptyState
            icon={MapPin}
            title="No active delivery"
            description="Accept a delivery request to see the route, timeline and delivery actions here."
            action={
              <Button onClick={() => navigate('/deliveries')}>
                View requests
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const actionLabel = nextDeliveryAction[activeDelivery.status]
  const isFinalStep = activeDelivery.status === 'in_transit'

  function handleAdvance() {
    advanceDelivery()

    if (isFinalStep) {
      navigate('/history')
    }
  }

  function handleCancel(reason: string) {
    cancelDelivery(reason)
    navigate('/deliveries')
  }

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Active delivery"
        subtitle={activeDelivery.id}
        showBack
        right={
          <Badge tone="brand" size="sm">
            {deliveryStatusLabels[activeDelivery.status]}
          </Badge>
        }
      />

      <div className="space-y-4 px-4 pt-5">
        <Card padding="md">
          <div className="flex items-center justify-between gap-2">
            <Badge
              tone={activeDelivery.category === 'Grocery' ? 'success' : 'warning'}
              size="sm"
            >
              {activeDelivery.category}
            </Badge>
            <span className="text-[11.5px] text-ink-muted">
              {activeDelivery.paymentMode}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-success-soft text-success">
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Pickup
                </p>
                <p className="text-[12.5px] font-semibold text-ink">
                  {activeDelivery.pickup.name}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {activeDelivery.pickup.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-danger-soft text-danger">
                <Navigation className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Deliver to
                </p>
                <p className="text-[12.5px] font-semibold text-ink">
                  {activeDelivery.destination.name}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {activeDelivery.destination.address}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-[11.5px] font-medium text-ink-muted">
            <span>{activeDelivery.distanceKm} km</span>
            <span>{activeDelivery.etaMinutes} min</span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3.5" aria-hidden="true" />
              {formatCurrency(activeDelivery.earnings)}
            </span>
          </div>
        </Card>

        <MapPreview
          pickup={activeDelivery.pickup.name}
          destination={activeDelivery.destination.name}
        />

        <Card padding="md">
          <SectionHeading title="Delivery progress" />
          <div className="mt-4">
            <DeliveryTimeline delivery={activeDelivery} />
          </div>
        </Card>

        {activeDelivery.note ? (
          <Card padding="sm" className="border-warning/20 bg-warning-soft">
            <p className="text-[11.5px] font-semibold text-ink">
              Customer note
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              {activeDelivery.note}
            </p>
          </Card>
        ) : null}

        <div className="space-y-2">
          <Button fullWidth size="lg" onClick={handleAdvance}>
            {actionLabel ?? 'Delivery completed'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = `tel:${activeDelivery.customerPhone.replace(/\s/g, '')}`
              }}
              leftIcon={<Phone className="size-4" aria-hidden="true" />}
            >
              Contact
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowIssues((value) => !value)}
              leftIcon={<AlertTriangle className="size-4" aria-hidden="true" />}
            >
              Report issue
            </Button>
          </div>
        </div>

        {showIssues ? (
          <Card padding="md">
            <SectionHeading
              title="What went wrong?"
              subtitle="This cancels the delivery and informs support."
            />
            <div className="mt-3 space-y-2">
              {issueReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleCancel(reason)}
                  className="w-full rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-left text-[12.5px] font-medium text-ink transition-colors hover:border-danger/40 hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                >
                  {reason}
                </button>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
