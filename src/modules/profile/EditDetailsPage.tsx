import { useState } from 'react'
import type { FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { updatePartnerDetails } from '../../services/partnerProfile'
import type { OnboardingState } from '../../types/onboarding'
import { cn } from '../../utils/cn'
import {
  getFirebaseErrorCode,
  getFirebaseWriteErrorKey,
} from '../../utils/firebaseError'

type VehicleType = OnboardingState['vehicle']['type']

interface DetailsForm {
  email: string
  addressLine: string
  city: string
  pincode: string
  vehicle: OnboardingState['vehicle']
}

const LICENCE_PATTERN = /^[A-Z]{2}[- ]?\d{2}[- ]?\d{4}[- ]?\d{7}$/
const REGISTRATION_PATTERN =
  /^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,2}[- ]?\d{4}$/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PINCODE_PATTERN = /^\d{6}$/

/**
 * Editable details after onboarding. Identity/KYC fields stay read-only so a
 * partner cannot silently replace a verified name, number or document.
 */
export function EditDetailsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { onboarding, updateOnboarding } = useApp()
  const { t } = useLanguage()

  const [form, setForm] = useState<DetailsForm>(() => ({
    email: onboarding.email,
    addressLine: onboarding.addressLine,
    city: onboarding.city,
    pincode: onboarding.pincode,
    vehicle: { ...onboarding.vehicle },
  }))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const vehicleOptions: Array<{ value: VehicleType; label: string }> = [
    { value: 'bike', label: t('Bike') },
    { value: 'scooter', label: t('Scooter') },
    { value: 'bicycle', label: t('Bicycle') },
    { value: 'foot', label: t('On foot') },
  ]

  const isMotorised =
    form.vehicle.type === 'bike' || form.vehicle.type === 'scooter'

  function patchVehicle(patch: Partial<OnboardingState['vehicle']>) {
    setForm((current) => ({
      ...current,
      vehicle: { ...current.vehicle, ...patch },
    }))
  }

  function validate(): string {
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      return 'Enter a valid email address.'
    }
    if (form.city.trim().length === 0) {
      return 'Enter your city.'
    }
    if (form.addressLine.trim().length < 8) {
      return 'Enter your current address.'
    }
    if (!PINCODE_PATTERN.test(form.pincode)) {
      return 'Enter a 6-digit PIN code.'
    }

    // Validate only the fields this page edits. The wizard's step validator is
    // deliberately not reused: an editable profile must never be blocked by an
    // untouched identity field such as the date of birth.
    if (form.vehicle.type !== 'foot' && !form.vehicle.model.trim()) {
      return 'Enter your vehicle model.'
    }

    if (isMotorised && !LICENCE_PATTERN.test(onboarding.documentNumbers.licence)) {
      return 'Your driving licence is missing or invalid. Contact support before switching to a bike or scooter.'
    }

    if (
      isMotorised &&
      !REGISTRATION_PATTERN.test(form.vehicle.registrationNumber)
    ) {
      return 'Enter a valid registration number, for example WB02AB1234.'
    }

    return ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorCode(null)

    const message = validate()
    if (message) {
      setError(message)
      return
    }

    const details = {
      email: form.email.trim(),
      addressLine: form.addressLine.trim(),
      city: form.city.trim(),
      pincode: form.pincode,
      vehicle: {
        type: form.vehicle.type,
        model: form.vehicle.model.trim(),
        colour: form.vehicle.colour.trim(),
        registrationNumber: form.vehicle.registrationNumber.trim(),
      },
    }

    setIsSaving(true)
    setError('')

    try {
      if (session?.uid && !session.uid.startsWith('demo:')) {
        await updatePartnerDetails(session.uid, details)
      }

      updateOnboarding(details)
      navigate('/profile', {
        replace: true,
        state: { detailsSaved: true },
      })
    } catch (caught) {
      const code = getFirebaseErrorCode(caught)
      setErrorCode(code)
      setError(
        getFirebaseWriteErrorKey(code) ??
          'Could not save your details. Check your connection and try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="pb-8">
      <ScreenHeader
        title={t('Edit details')}
        subtitle={t('Update your email, address and vehicle')}
        showBack
        backTo="/profile"
      />

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pt-5">
        <Card padding="md" className="space-y-3">
          <div>
            <p className="text-[13px] font-semibold text-ink">
              {t('Contact details')}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              {t('Used for delivery updates and account notices.')}
            </p>
          </div>

          <Input
            label={t('Email')}
            type="email"
            autoComplete="email"
            maxLength={160}
            required
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />

          <Input
            label={t('Address')}
            autoComplete="street-address"
            maxLength={300}
            required
            value={form.addressLine}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                addressLine: event.target.value,
              }))
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('City')}
              autoComplete="address-level2"
              maxLength={80}
              required
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            />
            <Input
              label={t('PIN code')}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              required
              value={form.pincode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  pincode: event.target.value.replace(/\D/g, '').slice(0, 6),
                }))
              }
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-brand-tint px-3 py-2 text-[11px] leading-relaxed text-ink-muted">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-brand"
              aria-hidden="true"
            />
            {t(
              'Your verified mobile number and name cannot be changed here. Contact support to correct verified KYC details.',
            )}
          </p>
        </Card>

        <Card padding="md" className="space-y-3">
          <div>
            <p className="text-[13px] font-semibold text-ink">
              {t('Vehicle details')}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              {t('Keep this up to date so dispatch assigns suitable jobs.')}
            </p>
          </div>

          <Select
            label={t('Vehicle type')}
            value={form.vehicle.type}
            options={vehicleOptions}
            onChange={(event) =>
              patchVehicle({ type: event.target.value as VehicleType })
            }
          />

          {form.vehicle.type !== 'foot' ? (
            <>
              <Input
                label={t('Vehicle model')}
                maxLength={80}
                required
                value={form.vehicle.model}
                placeholder="Honda Activa 6G"
                onChange={(event) =>
                  patchVehicle({ model: event.target.value })
                }
              />
              <Input
                label={t('Vehicle colour')}
                maxLength={40}
                value={form.vehicle.colour}
                placeholder="Black"
                onChange={(event) =>
                  patchVehicle({ colour: event.target.value })
                }
              />
            </>
          ) : null}

          {isMotorised ? (
            <>
              <Input
                label={t('Registration number')}
                maxLength={13}
                required
                value={form.vehicle.registrationNumber}
                placeholder="WB02AB1234"
                onChange={(event) =>
                  patchVehicle({
                    registrationNumber: event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9- ]/g, '')
                      .slice(0, 13),
                  })
                }
              />

              <p
                className={cn(
                  'rounded-xl px-3 py-2 text-[11px] leading-relaxed',
                  onboarding.documentNumbers.licence
                    ? 'bg-canvas text-ink-muted'
                    : 'bg-danger-soft text-danger',
                )}
              >
                {onboarding.documentNumbers.licence
                  ? t('Driving licence (verified): {number}', {
                      number: onboarding.documentNumbers.licence,
                    })
                  : t(
                      'Your driving licence is missing. Contact support before switching to a bike or scooter.',
                    )}
              </p>
            </>
          ) : null}
        </Card>

        {error ? (
          <div
            role="alert"
            className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-[12px] font-medium text-danger"
          >
            <p>{t(error)}</p>
            {errorCode ? (
              <p className="mt-1 font-mono text-[10.5px] text-danger/80">
                {errorCode}
              </p>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" fullWidth isLoading={isSaving}>
          {t('Save changes')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => navigate('/profile')}
        >
          {t('Cancel')}
        </Button>
      </form>
    </div>
  )
}
