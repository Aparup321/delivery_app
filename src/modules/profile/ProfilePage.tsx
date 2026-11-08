import { useState } from 'react'
import {
  ChevronRight,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Star,
  Truck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/common/Avatar'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Select } from '../../components/common/Select'
import { Toggle } from '../../components/common/Toggle'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { languageOptions } from '../../i18n/translations'
import type { Language } from '../../i18n/translations'
import { currentPartner } from '../../mock/partner'
import { applicationStatusMeta } from '../../utils/applicationStatus'

export function ProfilePage() {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const { onboarding } = useApp()
  const { language, setLanguage, t } = useLanguage()
  const [jobAlerts, setJobAlerts] = useState(true)

  const partner = currentPartner
  const displayName = onboarding.fullName.trim() || partner.fullName
  const documents = [
    { label: 'Aadhaar card', fileName: onboarding.documents.aadhaar },
    { label: 'PAN card', fileName: onboarding.documents.pan },
    { label: 'Driving licence', fileName: onboarding.documents.licence },
    { label: 'Vehicle RC', fileName: onboarding.documents.registration },
    { label: 'Bank passbook', fileName: onboarding.documents.passbook },
  ]

  const applicationStatus = applicationStatusMeta[onboarding.status]
  const vehicleLabel =
    onboarding.vehicle.type === 'foot'
      ? t('On foot')
      : t(
          `${onboarding.vehicle.type.charAt(0).toUpperCase()}${onboarding.vehicle.type.slice(1)}`,
        )

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title={t('Profile')}
        subtitle={t('Partner account and settings')}
        showBack
        backTo="/"
        right={
          <Avatar
            name={displayName}
            src={onboarding.profilePhoto || partner.avatarUrl}
          />
        }
      />

      <div className="space-y-4 px-4 pt-5">
        <Card padding="lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[16px] font-semibold text-ink">{displayName}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {t('Partner ID · {id}', { id: partner.id })}
              </p>
            </div>
            <Badge tone={applicationStatus.tone} size="sm">
              {t(applicationStatus.label)}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-[11.5px] text-ink-muted">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 text-warning" aria-hidden="true" />
              {t('{rating} rating', { rating: partner.rating.toFixed(1) })}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="size-3.5" aria-hidden="true" />
              {vehicleLabel}
            </span>
          </div>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-semibold text-ink">
            {t('Contact')}
          </p>

          <ul className="mt-2 space-y-2.5 text-[12px]">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="text-ink">
                {session ? `+91 ${session.phone}` : t('Not available')}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="truncate text-ink">
                {onboarding.email || t('Not added')}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-brand"
                aria-hidden="true"
              />
              <span className="text-ink">
                {onboarding.addressLine
                  ? `${onboarding.addressLine}, ${onboarding.city} ${onboarding.pincode}`
                  : `${onboarding.city} · ${t('address not added')}`}
              </span>
            </li>
          </ul>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-ink">
              {t('Vehicle')}
            </p>
            <Badge tone="brand" size="sm">
              {vehicleLabel}
            </Badge>
          </div>
          <p className="mt-2 text-[12px] text-ink">
            {onboarding.vehicle.type === 'foot'
              ? t('Walking delivery')
              : `${onboarding.vehicle.model || t('Model not added')}${onboarding.vehicle.colour ? ` · ${onboarding.vehicle.colour}` : ''}`}
          </p>
          <p className="text-[11.5px] text-ink-muted">
            {onboarding.vehicle.type === 'foot'
              ? t('No vehicle or registration needed')
              : onboarding.vehicle.type === 'bicycle'
                ? t('No registration needed')
                : onboarding.vehicle.registrationNumber ||
                  t('Registration number not added')}
          </p>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-semibold text-ink">
            {t('Documents')}
          </p>

          <ul className="mt-2 divide-y divide-line">
            {documents.map((document) => (
              <li
                key={document.label}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="flex items-center gap-2 text-[12px] text-ink">
                  <FileText
                    className="size-4 shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                  {t(document.label)}
                </span>
                <Badge
                  tone={document.fileName ? 'success' : 'neutral'}
                  size="sm"
                >
                  {t(document.fileName ? 'Uploaded' : 'Missing')}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-semibold text-ink">
            {t('Application')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/application-status')}
            className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3 py-3 text-left transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium text-ink">
                {t('Application status')}
              </span>
              <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                {t('Track verification progress')}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Badge tone={applicationStatus.tone} size="sm">
                {t(applicationStatus.label)}
              </Badge>
              <ChevronRight
                className="size-4 text-ink-soft"
                aria-hidden="true"
              />
            </span>
          </button>
        </Card>

        <Card padding="md" className="space-y-3">
          <p className="text-[13px] font-semibold text-ink">
            {t('Preferences')}
          </p>

          <Select
            label={t('App language')}
            value={language}
            options={languageOptions}
            onChange={(event) =>
              setLanguage(event.target.value as Language)
            }
          />

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-tint px-3.5 py-3">
            <div>
              <p className="text-[12.5px] font-semibold text-ink">
                {t('Request alerts')}
              </p>
              <p className="text-[11px] text-ink-muted">
                {t('Notify me about new delivery requests')}
              </p>
            </div>
            <Toggle
              checked={jobAlerts}
              onChange={setJobAlerts}
              label={t('Request alerts')}
            />
          </div>
        </Card>

        <Card padding="md" className="space-y-2">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/onboarding')}
            rightIcon={<ChevronRight className="size-4" aria-hidden="true" />}
          >
            {t(
              onboarding.status === 'draft'
                ? 'Continue partner setup'
                : 'View partner details',
            )}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/support')}
          >
            {t('Help & support')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleSignOut}
            leftIcon={<LogOut className="size-4" aria-hidden="true" />}
          >
            {t('Sign out')}
          </Button>
        </Card>

        <p className="px-1 text-center text-[11px] text-ink-soft">
          {t('Fafo Delivery Partner App · Prototype build')}
        </p>
      </div>
    </div>
  )
}
