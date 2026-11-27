import { useState } from 'react'
import {
  AlertTriangle,
  Crosshair,
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
import { Input } from '../../components/common/Input'
import { SectionHeading } from '../../components/common/SectionHeading'
import { DeliveryMap } from '../../components/deliveries/DeliveryMap'
import { DeliveryTimeline } from '../../components/deliveries/DeliveryTimeline'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import {
  demoDeliveryOtp,
  demoDeliveryOtpEnabled,
} from '../../config/demoDelivery'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import type { TrackingStatus } from '../../hooks/usePartnerTracking'
import {
  deliveryStatusLabels,
  nextDeliveryAction,
} from '../../utils/delivery'
import { formatCurrency, formatTime } from '../../utils/format'
import { navigationUrl } from '../../utils/navigation'

const issueReasons = [
  'Customer is unreachable',
  'Address could not be found',
  'Order was damaged',
  'Vehicle breakdown',
]

const trackingStatusLabels: Record<TrackingStatus, string> = {
  idle: 'Location sharing off',
  requesting: 'Finding your location…',
  active: 'Sharing your live location',
  paused: 'Location paused while the app is in the background',
  denied: 'Location permission denied — your position is not shared',
  unavailable: 'Your location is temporarily unavailable',
  unsupported: 'This device cannot share its location',
  error: 'Finding your location is taking longer than usual',
}

const trackingStatusTones: Record<TrackingStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  idle: 'neutral',
  requesting: 'warning',
  active: 'success',
  paused: 'warning',
  denied: 'danger',
  unavailable: 'warning',
  unsupported: 'neutral',
  error: 'warning',
}

export function ActiveDeliveryPage() {
  const navigate = useNavigate()
  const { t, locale } = useLanguage()
  const {
    activeDelivery,
    advanceDelivery,
    completeDelivery,
    cancelDelivery,
    createTicket,
    deliveryActionPending,
    deliveryActionError,
    isLiveSession,
    trackingStatus,
    trackingPosition,
    shareLocationNow,
  } = useApp()
  const [showIssues, setShowIssues] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [handoverNote, setHandoverNote] = useState('')
  const [actionError, setActionError] = useState('')

  if (!activeDelivery) {
    return (
      <div className="pb-8">
        <ScreenHeader
          title={t('Active delivery')}
          subtitle={t('No delivery in progress')}
          showBack
          backTo="/deliveries"
        />
        <div className="px-4 pt-6">
          <EmptyState
            icon={MapPin}
            title={t('No active delivery')}
            description={t(
              'Accept a delivery request to see the route, timeline and delivery actions here.',
            )}
            action={
              <Button onClick={() => navigate('/deliveries')}>
                {t('View requests')}
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const actionLabel = nextDeliveryAction[activeDelivery.status]
  const isAwaitingDropCode = activeDelivery.status === 'drop_arrived'
  // Before pickup the map and navigation lead to the shop; afterwards they
  // lead to the customer's drop location.
  const focus: 'pickup' | 'destination' =
    activeDelivery.status === 'accepted' || activeDelivery.status === 'pickup_arrived'
      ? 'pickup'
      : 'destination'
  const pendingAction = deliveryActionPending
  const contactNumber = activeDelivery.customerPhone.replace(/[^\d+]/g, '')
  const canContact = contactNumber.replace(/\D/g, '').length >= 10

  async function handleAdvance() {
    setActionError('')
    setOtpError('')

    const advanced = await advanceDelivery()

    if (!advanced) {
      setActionError(
        deliveryActionError ??
          'The delivery status could not be updated. Check your connection and try again.',
      )
    }
  }

  async function handleComplete() {
    setActionError('')

    if (otp.length !== 4) {
      setOtpError('Enter the 4-digit delivery code from the customer.')
      return
    }

    const completed = await completeDelivery(otp, {
      recipientName,
      note: handoverNote,
      location: trackingPosition,
    })

    if (!completed) {
      setOtpError(
        deliveryActionError ??
          'That code does not match. Check with the customer and try again.',
      )
      return
    }

    setOtp('')
    setOtpError('')
    setRecipientName('')
    setHandoverNote('')
    navigate('/history')
  }

  async function handleCancel(reason: string) {
    setActionError('')

    const delivery = activeDelivery

    if (!delivery) {
      setActionError(
        'This delivery is no longer active. Return to Orders to refresh.',
      )
      return
    }

    const cancelled = await cancelDelivery(reason)

    if (cancelled) {
      createTicket(
        `Delivery issue · ${delivery.id}`,
        `${reason}\nPickup: ${delivery.pickup.name}\nDrop: ${delivery.destination.name}`,
      )
      navigate('/deliveries')
    } else {
      setActionError(
        deliveryActionError ??
          'The delivery could not be cancelled. Check your connection and try again.',
      )
    }
  }

  return (
    <div className="pb-8">
      <ScreenHeader
        title={t('Active delivery')}
        subtitle={activeDelivery.id}
        showBack
        backTo="/deliveries"
        right={
          <Badge tone="brand" size="sm">
            {t(deliveryStatusLabels[activeDelivery.status])}
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
              {t(activeDelivery.category)}
            </Badge>
            <span className="text-[11.5px] text-ink-muted">
              {t(activeDelivery.paymentMode)}
              {activeDelivery.paymentMode === 'Cash on delivery' &&
              activeDelivery.collectAmount
                ? ` · ${t('Collect {amount}', {
                    amount: formatCurrency(
                      activeDelivery.collectAmount,
                      locale,
                    ),
                  })}`
                : null}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-success-soft text-success">
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium text-ink-muted">
                  {t('Pickup')}
                </p>
                <p className="text-[12.5px] font-semibold text-ink">
                  {activeDelivery.pickup.name}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {activeDelivery.pickup.address}
                </p>
              </div>
              <a
                href={navigationUrl(activeDelivery.pickup)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label={t('Navigate to pickup')}
              >
                <Navigation className="size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-danger-soft text-danger">
                <Navigation className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium text-ink-muted">
                  {t('Deliver to')}
                </p>
                <p className="text-[12.5px] font-semibold text-ink">
                  {activeDelivery.destination.name}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {activeDelivery.destination.address}
                </p>
              </div>
              <a
                href={navigationUrl(activeDelivery.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label={t('Navigate to drop')}
              >
                <Navigation className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-[11.5px] font-medium text-ink-muted">
            <span>{t('{count} km', { count: activeDelivery.distanceKm })}</span>
            <span>{t('{count} min', { count: activeDelivery.etaMinutes })}</span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3.5" aria-hidden="true" />
              {formatCurrency(activeDelivery.earnings, locale)}
            </span>
          </div>
        </Card>

        <section aria-label={t('Current location')}>
          <SectionHeading
            title={t('Current location')}
            subtitle={t('Live map, route and your last shared position')}
          />

          <div className="mt-2 space-y-2">
            <DeliveryMap
              pickup={activeDelivery.pickup}
              destination={activeDelivery.destination}
              partnerLocation={trackingPosition}
              focus={focus}
            />

            <Card padding="sm">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Crosshair className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <Badge
                    tone={trackingStatusTones[trackingStatus]}
                    size="sm"
                  >
                    {t(trackingStatusLabels[trackingStatus])}
                  </Badge>
                  {trackingPosition ? (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      {t('Updated {time}', {
                        time: formatTime(trackingPosition.updatedAt, locale),
                      })}
                    </p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto shrink-0"
                  onClick={shareLocationNow}
                >
                  {t('Share location now')}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <Card padding="md">
          <SectionHeading title={t('Delivery progress')} />
          <div className="mt-4">
            <DeliveryTimeline delivery={activeDelivery} />
          </div>
        </Card>

        {activeDelivery.note ? (
          <Card padding="sm" className="border-warning/20 bg-warning-soft">
            <p className="text-[11.5px] font-semibold text-ink">
              {t('Customer note')}
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              {activeDelivery.note}
            </p>
          </Card>
        ) : null}

        {actionError || deliveryActionError ? (
          <Card
            padding="sm"
            className="border-danger/30 bg-danger-soft"
            role="alert"
          >
            <p className="text-[12px] font-medium text-danger">
              {t(actionError || deliveryActionError || '')}
            </p>
          </Card>
        ) : null}

        <div className="space-y-2">
          {isAwaitingDropCode ? (
            <Card padding="md">
              <SectionHeading
                title={t('Verify delivery OTP')}
                subtitle={t(
                  'Ask the customer for the 4-digit code to close this delivery.',
                )}
              />
              <div className="mt-3">
                <Input
                  label={t('Delivery OTP')}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  placeholder={t('4-digit code')}
                  value={otp}
                  error={otpError ? t(otpError) : undefined}
                  hint={
                    demoDeliveryOtpEnabled
                      ? t(
                          'Demo build: use {code} to complete the delivery.',
                          { code: demoDeliveryOtp },
                        )
                      : undefined
                  }
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, ''))
                    setOtpError('')
                  }}
                />
                <div className="mt-3 space-y-2.5">
                  <Input
                    label={t('Recipient name (optional)')}
                    value={recipientName}
                    maxLength={80}
                    placeholder={t('Who received the order?')}
                    onChange={(event) => setRecipientName(event.target.value)}
                  />
                  <Input
                    label={t('Handover note (optional)')}
                    value={handoverNote}
                    maxLength={280}
                    placeholder={t('Gate, floor or a short handover note')}
                    onChange={(event) => setHandoverNote(event.target.value)}
                  />
                </div>
              </div>
              {isLiveSession && !activeDelivery.dropOtp ? (
                <p
                  role="status"
                  className="mt-2 rounded-xl bg-warning-soft px-3 py-2 text-[11.5px] font-medium text-warning"
                >
                  {t(
                    demoDeliveryOtpEnabled
                      ? 'No delivery code was issued. Use the demo code shown above for testing, or contact operations.'
                      : 'No delivery code was issued for this delivery. Contact operations to verify the drop and complete it.',
                  )}
                </p>
              ) : null}
              <Button
                className="mt-3"
                fullWidth
                size="lg"
                isLoading={pendingAction === 'complete'}
                onClick={() => void handleComplete()}
              >
                {t('Complete delivery')}
              </Button>
            </Card>
          ) : (
            <Button
              fullWidth
              size="lg"
              isLoading={pendingAction === 'advance'}
              onClick={() => void handleAdvance()}
            >
              {actionLabel ? t(actionLabel) : t('Delivery completed')}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              disabled={!canContact}
              title={
                canContact
                  ? undefined
                  : t('Customer contact is not available for this delivery.')
              }
              onClick={() => {
                window.location.href = `tel:${contactNumber}`
              }}
              leftIcon={<Phone className="size-4" aria-hidden="true" />}
            >
              {t('Contact')}
            </Button>
            <Button
              variant="outline"
              disabled={pendingAction !== null}
              onClick={() => setShowIssues((value) => !value)}
              leftIcon={<AlertTriangle className="size-4" aria-hidden="true" />}
            >
              {t('Report issue')}
            </Button>
            {!canContact ? (
              <p className="col-span-2 rounded-xl bg-canvas px-3 py-2 text-center text-[10.5px] text-ink-muted">
                {t(
                  'Customer contact is not shared for this delivery. Use support if you need help.',
                )}
              </p>
            ) : null}
          </div>
        </div>

        {showIssues ? (
          <Card padding="md">
            <SectionHeading
              title={t('What went wrong?')}
              subtitle={t('This cancels the delivery and informs support.')}
            />
            <div className="mt-3 space-y-2">
              {issueReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  disabled={pendingAction !== null}
                  onClick={() => void handleCancel(reason)}
                  className="w-full rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-left text-[12.5px] font-medium text-ink transition-colors hover:border-danger/40 hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:opacity-60"
                >
                  {t(reason)}
                </button>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
