import { useState } from 'react'
import { Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Reveal } from '../../components/common/Reveal'
import { SegmentedTabs } from '../../components/common/SegmentedTabs'
import { DeliveryRequestCard } from '../../components/deliveries/DeliveryRequestCard'
import { DeliveryDetailsDialog } from '../../components/deliveries/DeliveryDetailsDialog'
import { DeliveryTimeline } from '../../components/deliveries/DeliveryTimeline'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import type { Delivery } from '../../types/delivery'
import {
  deliveryOutcome,
  deliveryStatusLabels,
  isDeclinedByPartner,
} from '../../utils/delivery'
import { formatCurrency, formatShortDate } from '../../utils/format'
import { revealStyle } from '../../utils/reveal'

type DeliveryTab = 'available' | 'active' | 'completed'

export function DeliveriesPage() {
  const navigate = useNavigate()
  const { t, locale } = useLanguage()
  const {
    isOnline,
    canGoOnline,
    setOnline,
    requests,
    activeDelivery,
    history,
    acceptRequest,
    rejectRequest,
    deliveryActionPending,
    deliveryActionPendingId,
    deliveryActionError,
    deliveryRequestsLoading,
    onboarding,
  } = useApp()
  const [tab, setTab] = useState<DeliveryTab>('available')
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  )

  async function handleAccept(id: string) {
    const accepted = await acceptRequest(id)

    if (accepted) {
      navigate('/deliveries/active')
    }
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title={t('Orders')}
        subtitle={t('Requests, active jobs and completed work')}
        showBack
        backTo="/"
      />

      <div className="space-y-4 px-4 pt-5">
        <SegmentedTabs
          label={t('Delivery views')}
          value={tab}
          onChange={(value) => setTab(value as DeliveryTab)}
          items={[
            {
              id: 'available',
              label: t('Available'),
              count: isOnline ? requests.length : 0,
            },
            { id: 'active', label: t('Active'), count: activeDelivery ? 1 : 0 },
            { id: 'completed', label: t('Completed') },
          ]}
        />

        {tab === 'available' ? (
          !canGoOnline ? (
            <EmptyState
              icon={Package}
              title={t(
                onboarding.accountStatus === 'paused'
                  ? 'Account suspended'
                  : 'Account not active',
              )}
              description={
                onboarding.accountStatus === 'paused'
                  ? (onboarding.suspensionReason ??
                    t(
                      'An administrator suspended this account. Contact support for help.',
                    ))
                  : t(
                      'Your application must be approved before you can go online and receive requests.',
                    )
              }
              action={
                <Button onClick={() => navigate('/application-status')}>
                  {t('View application status')}
                </Button>
              }
            />
          ) : !isOnline ? (
            <EmptyState
              icon={Package}
              title={t('You are offline')}
              description={t(
                'Go online to receive nearby grocery and restaurant requests.',
              )}
              action={
                <Button onClick={() => setOnline(true)}>{t('Go online')}</Button>
              }
            />
          ) : deliveryRequestsLoading ? (
            <div className="space-y-3" aria-live="polite">
              {[0, 1].map((key) => (
                <Card key={key} padding="md" className="animate-pulse">
                  <div className="h-4 w-28 rounded bg-brand-soft" />
                  <div className="mt-3 h-3 w-48 rounded bg-brand-soft" />
                  <div className="mt-2 h-3 w-40 rounded bg-brand-soft" />
                  <div className="mt-4 h-10 w-full rounded-lg bg-brand-soft" />
                </Card>
              ))}
              <p className="text-center text-[11.5px] text-ink-soft">
                {t('Checking for new requests…')}
              </p>
            </div>
          ) : (
            <>
              {activeDelivery ? (
                <Card padding="sm" className="border-warning/20 bg-warning-soft">
                  <p className="text-[12px] font-medium text-warning">
                    {t(
                      'Finish your active delivery before accepting another request.',
                    )}
                  </p>
                </Card>
              ) : null}
              {deliveryActionError ? (
                <Card
                  padding="sm"
                  className="border-danger/30 bg-danger-soft"
                  role="alert"
                >
                  <p className="text-[12px] font-medium text-danger">
                    {t(deliveryActionError)}
                  </p>
                </Card>
              ) : null}
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.map((delivery, index) => (
                    <Reveal key={delivery.id} index={index}>
                      <DeliveryRequestCard
                        delivery={delivery}
                        isAccepting={
                          deliveryActionPending === 'accept' &&
                          deliveryActionPendingId === delivery.id
                        }
                        isRejecting={
                          deliveryActionPending === 'reject' &&
                          deliveryActionPendingId === delivery.id
                        }
                        isBusy={
                          Boolean(activeDelivery) ||
                          (deliveryActionPending !== null &&
                            deliveryActionPendingId !== delivery.id)
                        }
                        onAccept={() => void handleAccept(delivery.id)}
                        onReject={(reason) =>
                          void rejectRequest(delivery.id, reason)
                        }
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title={t('No new requests')}
                  description={t(
                    'When you are online, nearby grocery and restaurant requests will appear here.',
                  )}
                  action={
                    <Button onClick={() => navigate('/')}>
                      {t('Back to home')}
                    </Button>
                  }
                />
              )}
            </>
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
                  {t(deliveryStatusLabels[activeDelivery.status])}
                </Badge>
              </div>

              <div className="mt-4">
                <DeliveryTimeline delivery={activeDelivery} />
              </div>

              <Button
                className="mt-4"
                fullWidth
                isLoading={deliveryActionPending !== null}
                onClick={() => navigate('/deliveries/active')}
              >
                {t('Open active delivery')}
              </Button>
            </Card>
          ) : (
            <EmptyState
              icon={Package}
              title={t('No active delivery')}
              description={t(
                'Accept a request from the Available tab to start a delivery.',
              )}
              action={
                <Button onClick={() => setTab('available')}>
                  {t('View requests')}
                </Button>
              }
            />
          )
        ) : null}

        {tab === 'completed' ? (
          history.length > 0 ? (
            <div className="space-y-3">
              {history.map((delivery, index) => {
                const outcome = deliveryOutcome(delivery)
                const declined = isDeclinedByPartner(delivery)

                return (
                  <Card
                    key={delivery.id}
                    padding="sm"
                    className="reveal-up"
                    style={revealStyle(index)}
                  >
                    <button
                      type="button"
                      aria-label={t('View delivery details')}
                      onClick={() => setSelectedDelivery(delivery)}
                      className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-ink">
                              {delivery.id}
                            </span>
                            <Badge
                              tone={
                                outcome === 'cancelled' ? 'danger' : 'success'
                              }
                              size="sm"
                            >
                              {t(
                                outcome === 'delivered'
                                  ? 'Completed'
                                  : declined
                                    ? 'Cancelled by you'
                                    : 'Cancelled',
                              )}
                            </Badge>
                          </div>
                          <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                            {delivery.pickup.name} →{' '}
                            {delivery.destination.name}
                          </p>
                          {outcome === 'cancelled' ? (
                            <p className="mt-0.5 truncate text-[11px] text-danger">
                              {declined
                                ? `${t('You declined this request.')}${
                                    delivery.partnerResponse?.reason
                                      ? ` ${t(delivery.partnerResponse.reason)}`
                                      : ''
                                  }`
                                : delivery.cancellationReason
                                  ? t(delivery.cancellationReason)
                                  : t('Cancelled by operations.')}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={[
                              'text-[12.5px] font-bold',
                              outcome === 'delivered'
                                ? 'text-ink'
                                : 'text-danger',
                            ].join(' ')}
                          >
                            {formatCurrency(
                              outcome === 'delivered' ? delivery.earnings : 0,
                              locale,
                            )}
                          </p>
                          <p className="text-[10.5px] text-ink-soft">
                            {delivery.completedAt
                              ? formatShortDate(delivery.completedAt, locale)
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </button>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title={t('No completed deliveries')}
              description={t(
                'Finished and cancelled deliveries will appear here.',
              )}
            />
          )
        ) : null}
      </div>

      {selectedDelivery ? (
        <DeliveryDetailsDialog
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          paymentUpi={onboarding.upiId}
          payeeName={onboarding.fullName}
        />
      ) : null}
    </div>
  )
}
