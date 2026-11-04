import { useState } from 'react'
import { Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { DeliveryRequestCard } from '../../components/deliveries/DeliveryRequestCard'
import { DeliveryTimeline } from '../../components/deliveries/DeliveryTimeline'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { deliveryStatusLabels } from '../../utils/delivery'
import { formatCurrency, formatShortDate } from '../../utils/format'

type DeliveryTab = 'available' | 'active' | 'completed'

export function DeliveriesPage() {
  const navigate = useNavigate()
  const {
    requests,
    activeDelivery,
    history,
    acceptRequest,
    rejectRequest,
  } = useApp()
  const [tab, setTab] = useState<DeliveryTab>('available')

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Deliveries"
        subtitle="Requests, active jobs and completed work"
      />

      <div className="space-y-4 px-4 pt-5">
        <SegmentedTabs
          label="Delivery views"
          value={tab}
          onChange={(value) => setTab(value as DeliveryTab)}
          items={[
            { id: 'available', label: 'Available', count: requests.length },
            { id: 'active', label: 'Active', count: activeDelivery ? 1 : 0 },
            { id: 'completed', label: 'Completed' },
          ]}
        />

        {tab === 'available' ? (
          requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((delivery) => (
                <DeliveryRequestCard
                  key={delivery.id}
                  delivery={delivery}
                  onAccept={() => {
                    acceptRequest(delivery.id)
                    navigate('/deliveries/active')
                  }}
                  onReject={() => rejectRequest(delivery.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No new requests"
              description="When you are online, nearby grocery and restaurant requests will appear here."
              action={
                <Button onClick={() => navigate('/')}>Back to home</Button>
              }
            />
          )
        ) : null}

        {tab === 'active' ? (
          activeDelivery ? (
            <Card padding="md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-bold text-ink">
                    {activeDelivery.id}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">
                    {activeDelivery.pickup.name} →{' '}
                    {activeDelivery.destination.name}
                  </p>
                </div>
                <Badge tone="brand" size="sm">
                  {deliveryStatusLabels[activeDelivery.status]}
                </Badge>
              </div>

              <div className="mt-4">
                <DeliveryTimeline delivery={activeDelivery} />
              </div>

              <Button
                className="mt-4"
                fullWidth
                onClick={() => navigate('/deliveries/active')}
              >
                Open active delivery
              </Button>
            </Card>
          ) : (
            <EmptyState
              icon={Package}
              title="No active delivery"
              description="Accept a request from the Available tab to start a delivery."
              action={
                <Button onClick={() => setTab('available')}>
                  View requests
                </Button>
              }
            />
          )
        ) : null}

        {tab === 'completed' ? (
          <div className="space-y-3">
            {history.map((delivery) => (
              <Card key={delivery.id} padding="sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold text-ink">
                        {delivery.id}
                      </span>
                      <Badge
                        tone={
                          delivery.status === 'cancelled' ? 'danger' : 'success'
                        }
                        size="sm"
                      >
                        {delivery.status === 'cancelled'
                          ? 'Cancelled'
                          : 'Completed'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                      {delivery.pickup.name} →{' '}
                      {delivery.destination.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12.5px] font-bold text-ink">
                      {formatCurrency(delivery.earnings)}
                    </p>
                    <p className="text-[10.5px] text-ink-soft">
                      {delivery.completedAt
                        ? formatShortDate(delivery.completedAt)
                        : '—'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
