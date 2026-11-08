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
import { currentPartner } from '../../mock/partner'
import { applicationStatusMeta } from '../../utils/applicationStatus'

export function ProfilePage() {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const { onboarding } = useApp()
  const [language, setLanguage] = useState('en')
  const [jobAlerts, setJobAlerts] = useState(true)

  const partner = currentPartner
  const displayName = onboarding.fullName.trim() || partner.fullName
  const documents = [
    { label: 'Aadhaar card', fileName: onboarding.documents.aadhaar },
    { label: 'PAN card', fileName: onboarding.documents.pan },
    { label: 'Driving licence', fileName: onboarding.documents.licence },
    { label: 'Vehicle RC', fileName: onboarding.documents.registration },
  ]

  const applicationStatus = applicationStatusMeta[onboarding.status]

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Profile"
        subtitle="Partner account and settings"
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
                Partner ID · {partner.id}
              </p>
            </div>
            <Badge tone={applicationStatus.tone} size="sm">
              {applicationStatus.label}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-[11.5px] text-ink-muted">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 text-warning" aria-hidden="true" />
              {partner.rating.toFixed(1)} rating
            </span>
            <span className="flex items-center gap-1">
              <Truck className="size-3.5" aria-hidden="true" />
              {onboarding.vehicle.type === 'foot'
                ? 'On foot'
                : onboarding.vehicle.type}
            </span>
          </div>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-semibold text-ink">Contact</p>

          <ul className="mt-2 space-y-2.5 text-[12px]">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="text-ink">
                {session ? `+91 ${session.phone}` : 'Not available'}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="truncate text-ink">
                {onboarding.email || 'Not added'}
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
                  : `${onboarding.city} · address not added`}
              </span>
            </li>
          </ul>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-ink">Vehicle</p>
            <Badge tone="brand" size="sm">
              {onboarding.vehicle.type === 'foot'
                ? 'On foot'
                : onboarding.vehicle.type}
            </Badge>
          </div>
          <p className="mt-2 text-[12px] text-ink">
            {onboarding.vehicle.type === 'foot'
              ? 'Walking delivery'
              : `${onboarding.vehicle.model || 'Model not added'}${onboarding.vehicle.colour ? ` · ${onboarding.vehicle.colour}` : ''}`}
          </p>
          <p className="text-[11.5px] text-ink-muted">
            {onboarding.vehicle.type === 'foot'
              ? 'No vehicle or registration needed'
              : onboarding.vehicle.type === 'bicycle'
                ? 'No registration needed'
                : onboarding.vehicle.registrationNumber ||
                  'Registration number not added'}
          </p>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-semibold text-ink">Documents</p>

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
                  {document.label}
                </span>
                <Badge
                  tone={document.fileName ? 'success' : 'neutral'}
                  size="sm"
                >
                  {document.fileName ? 'Uploaded' : 'Missing'}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-semibold text-ink">Application</p>
          <button
            type="button"
            onClick={() => navigate('/application-status')}
            className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3 py-3 text-left transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium text-ink">
                Application status
              </span>
              <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                Track verification progress
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Badge tone={applicationStatus.tone} size="sm">
                {applicationStatus.label}
              </Badge>
              <ChevronRight
                className="size-4 text-ink-soft"
                aria-hidden="true"
              />
            </span>
          </button>
        </Card>

        <Card padding="md" className="space-y-3">
          <p className="text-[13px] font-semibold text-ink">Preferences</p>

          <Select
            label="App language"
            value={language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी (Hindi)' },
              { value: 'bn', label: 'বাংলা (Bengali)' },
            ]}
            onChange={(event) => setLanguage(event.target.value)}
          />

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-tint px-3.5 py-3">
            <div>
              <p className="text-[12.5px] font-semibold text-ink">
                Request alerts
              </p>
              <p className="text-[11px] text-ink-muted">
                Notify me about new delivery requests
              </p>
            </div>
            <Toggle
              checked={jobAlerts}
              onChange={setJobAlerts}
              label="Request alerts"
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
            {onboarding.status === 'draft'
              ? 'Continue partner setup'
              : 'View partner details'}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/support')}
          >
            Help & support
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleSignOut}
            leftIcon={<LogOut className="size-4" aria-hidden="true" />}
          >
            Sign out
          </Button>
        </Card>

        <p className="px-1 text-center text-[11px] text-ink-soft">
          Fafo Delivery Partner App · Prototype build
        </p>
      </div>
    </div>
  )
}
