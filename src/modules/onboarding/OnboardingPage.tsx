import { useState } from 'react'
import { BadgeCheck, Check, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { ProgressBar } from '../../components/common/ProgressBar'
import { Select } from '../../components/common/Select'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useAuth } from '../../context/auth'
import { onboardingSteps, trainingTopics } from '../../mock/onboarding'
import type { DocumentKey, OnboardingState } from '../../types/onboarding'
import { formatDate } from '../../utils/format'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PINCODE_PATTERN = /^\d{6}$/
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/
const REGISTRATION_PATTERN = /^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,2}[- ]?\d{4}$/i

const documentFields: Array<{
  key: DocumentKey
  title: string
  hint: string
  required: boolean
}> = [
  {
    key: 'aadhaar',
    title: 'Aadhaar card',
    hint: 'Front side, JPG or PDF',
    required: true,
  },
  { key: 'pan', title: 'PAN card', hint: 'Clear photo of the card', required: true },
  {
    key: 'licence',
    title: 'Driving licence',
    hint: 'Needed for motorised vehicles',
    required: false,
  },
  {
    key: 'registration',
    title: 'Vehicle RC',
    hint: 'Registration certificate',
    required: false,
  },
]

function validateStep(step: number, state: OnboardingState): string {
  switch (step) {
    case 0:
      if (state.fullName.trim().length < 3) {
        return 'Enter your full name as it appears on your documents.'
      }
      if (!EMAIL_PATTERN.test(state.email)) {
        return 'Enter a valid email address.'
      }
      if (!state.city.trim()) {
        return 'Enter your city.'
      }
      return ''
    case 1:
      if (state.addressLine.trim().length < 8) {
        return 'Enter your current address.'
      }
      if (!PINCODE_PATTERN.test(state.pincode)) {
        return 'Enter a 6-digit PIN code.'
      }
      return ''
    case 2:
      if (!state.documents.aadhaar) {
        return 'Upload your Aadhaar card to continue.'
      }
      if (!state.documents.pan) {
        return 'Upload your PAN card to continue.'
      }
      return ''
    case 3:
      if (!state.vehicle.model.trim()) {
        return 'Enter your vehicle model.'
      }
      if (!REGISTRATION_PATTERN.test(state.vehicle.registrationNumber)) {
        return 'Enter a valid registration number, for example WB02AB1234.'
      }
      return ''
    case 4:
      if (state.bank.accountHolder.trim().length < 3) {
        return "Enter the account holder's name."
      }
      if (!/^\d{9,18}$/.test(state.bank.accountNumber)) {
        return 'Enter a valid bank account number.'
      }
      if (!IFSC_PATTERN.test(state.bank.ifsc)) {
        return 'Enter a valid IFSC code, for example HDFC0001234.'
      }
      return ''
    case 5:
      if (state.training.some((completed) => !completed)) {
        return 'Complete every training topic to continue.'
      }
      return ''
    default:
      return ''
  }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { onboarding, updateOnboarding, submitOnboarding } = useApp()
  const [error, setError] = useState('')

  const step = Math.min(onboarding.step, onboardingSteps.length - 1)
  const isSubmitted = onboarding.status !== 'draft'

  function handleBack() {
    setError('')
    if (step > 0) {
      updateOnboarding({ step: step - 1 })
      return
    }
    navigate('/')
  }

  function handleContinue() {
    const message = validateStep(step, onboarding)
    if (message) {
      setError(message)
      return
    }

    setError('')

    if (step < onboardingSteps.length - 1) {
      updateOnboarding({ step: step + 1 })
      return
    }

    for (let index = 0; index < onboardingSteps.length - 1; index += 1) {
      const stepError = validateStep(index, onboarding)
      if (stepError) {
        setError(stepError)
        updateOnboarding({ step: index })
        return
      }
    }

    submitOnboarding()
    navigate('/')
  }

  if (isSubmitted) {
    return (
      <div className="pb-8">
        <ScreenHeader
          title="Partner setup"
          subtitle="Application submitted"
          showBack
        />

        <div className="px-4 pt-6">
          <Card padding="lg" className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
              <BadgeCheck className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-ink">
              Application submitted
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              We received your details
              {onboarding.submittedAt
                ? ` on ${formatDate(onboarding.submittedAt)}`
                : ''}
              . The verification team usually completes the review within one
              working day.
            </p>
            <div className="mt-4 flex justify-center">
              <Badge tone="warning">Under review</Badge>
            </div>

            <Button className="mt-5" fullWidth onClick={() => navigate('/')}>
              Back to home
            </Button>
            <Button
              className="mt-2"
              variant="outline"
              fullWidth
              onClick={() => navigate('/profile')}
            >
              View profile
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Partner setup"
        subtitle={`Step ${step + 1} of ${onboardingSteps.length} · ${onboardingSteps[step].label}`}
        showBack
      />

      <div className="space-y-4 px-4 pt-5">
        <ProgressBar
          value={step + 1}
          max={onboardingSteps.length}
          hint={`${step + 1} of ${onboardingSteps.length} steps`}
        />

        {step === 0 ? (
          <Card padding="md" className="space-y-3">
            <Input
              label="Full name"
              required
              value={onboarding.fullName}
              placeholder="Name as on documents"
              onChange={(event) =>
                updateOnboarding({ fullName: event.target.value })
              }
            />
            <Input
              label="Email address"
              type="email"
              required
              value={onboarding.email}
              placeholder="you@example.com"
              onChange={(event) =>
                updateOnboarding({ email: event.target.value })
              }
            />
            <Input
              label="City"
              required
              value={onboarding.city}
              placeholder="Kolkata"
              onChange={(event) =>
                updateOnboarding({ city: event.target.value })
              }
            />
            <Input
              label="Mobile number"
              value={session ? `+91 ${session.phone}` : ''}
              hint="Your verified number cannot be changed here."
              readOnly
              disabled
            />
          </Card>
        ) : null}

        {step === 1 ? (
          <Card padding="md" className="space-y-3">
            <Input
              label="Current address"
              required
              value={onboarding.addressLine}
              placeholder="House, street, area"
              onChange={(event) =>
                updateOnboarding({ addressLine: event.target.value })
              }
            />
            <Input
              label="PIN code"
              required
              inputMode="numeric"
              maxLength={6}
              value={onboarding.pincode}
              placeholder="700091"
              onChange={(event) =>
                updateOnboarding({
                  pincode: event.target.value.replace(/\D/g, '').slice(0, 6),
                })
              }
            />
            <Input
              label="City"
              value={onboarding.city}
              readOnly
              disabled
              hint="Change your city from the Personal step."
            />
          </Card>
        ) : null}

        {step === 2 ? (
          <div className="space-y-2.5">
            <p className="text-[12px] leading-relaxed text-ink-muted">
              Upload clear photos or PDFs. Documents are only used to verify
              your identity.
            </p>

            {documentFields.map((field) => {
              const fileName = onboarding.documents[field.key]

              return (
                <Card key={field.key} padding="sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-deep">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-ink">
                        {field.title}
                        {field.required ? (
                          <span className="text-danger"> *</span>
                        ) : null}
                      </p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {fileName || field.hint}
                      </p>
                    </div>

                    {fileName ? (
                      <Badge tone="success" size="sm">
                        Uploaded
                      </Badge>
                    ) : null}

                    <label className="cursor-pointer rounded-xl bg-brand-soft px-2.5 py-1.5 text-[11px] font-semibold text-brand-deep transition-colors hover:bg-[#e3d8ff]">
                      {fileName ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (!file) {
                            return
                          }
                          updateOnboarding({
                            documents: {
                              ...onboarding.documents,
                              [field.key]: file.name,
                            },
                          })
                        }}
                      />
                    </label>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : null}

        {step === 3 ? (
          <Card padding="md" className="space-y-3">
            <Select
              label="Vehicle type"
              required
              value={onboarding.vehicle.type}
              options={[
                { value: 'scooter', label: 'Scooter' },
                { value: 'bike', label: 'Motorcycle' },
                { value: 'bicycle', label: 'Bicycle' },
              ]}
              onChange={(event) =>
                updateOnboarding({
                  vehicle: {
                    ...onboarding.vehicle,
                    type: event.target.value as OnboardingState['vehicle']['type'],
                  },
                })
              }
            />
            <Input
              label="Vehicle model"
              required
              value={onboarding.vehicle.model}
              placeholder="Honda Activa 6G"
              onChange={(event) =>
                updateOnboarding({
                  vehicle: { ...onboarding.vehicle, model: event.target.value },
                })
              }
            />
            <Input
              label="Colour"
              value={onboarding.vehicle.colour}
              placeholder="Grey"
              onChange={(event) =>
                updateOnboarding({
                  vehicle: { ...onboarding.vehicle, colour: event.target.value },
                })
              }
            />
            <Input
              label="Registration number"
              required
              value={onboarding.vehicle.registrationNumber}
              placeholder="WB02AB1234"
              hint="Enter the number printed on the number plate."
              onChange={(event) =>
                updateOnboarding({
                  vehicle: {
                    ...onboarding.vehicle,
                    registrationNumber: event.target.value.toUpperCase(),
                  },
                })
              }
            />
          </Card>
        ) : null}

        {step === 4 ? (
          <Card padding="md" className="space-y-3">
            <Input
              label="Account holder name"
              required
              value={onboarding.bank.accountHolder}
              placeholder="Name as on the bank account"
              onChange={(event) =>
                updateOnboarding({
                  bank: {
                    ...onboarding.bank,
                    accountHolder: event.target.value,
                  },
                })
              }
            />
            <Input
              label="Account number"
              required
              inputMode="numeric"
              value={onboarding.bank.accountNumber}
              placeholder="50100 1234 5678"
              onChange={(event) =>
                updateOnboarding({
                  bank: {
                    ...onboarding.bank,
                    accountNumber: event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 18),
                  },
                })
              }
            />
            <Input
              label="IFSC code"
              required
              value={onboarding.bank.ifsc}
              placeholder="HDFC0001234"
              hint="Find this on your cheque book or bank app."
              onChange={(event) =>
                updateOnboarding({
                  bank: {
                    ...onboarding.bank,
                    ifsc: event.target.value.toUpperCase().slice(0, 11),
                  },
                })
              }
            />
          </Card>
        ) : null}

        {step === 5 ? (
          <div className="space-y-2.5">
            <p className="text-[12px] leading-relaxed text-ink-muted">
              Read each topic and mark it complete. Training must be finished
              before your account can be approved.
            </p>

            {trainingTopics.map((topic, index) => {
              const isComplete = onboarding.training[index]

              return (
                <button
                  key={topic}
                  type="button"
                  role="checkbox"
                  aria-checked={isComplete}
                  onClick={() => {
                    const next = [...onboarding.training]
                    next[index] = !next[index]
                    updateOnboarding({ training: next })
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <span
                    className={
                      isComplete
                        ? 'grid size-6 shrink-0 place-items-center rounded-full bg-success text-white'
                        : 'grid size-6 shrink-0 place-items-center rounded-full border-2 border-line text-transparent'
                    }
                  >
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-[12.5px] font-medium text-ink">
                    {topic}
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}

        {step === 6 ? (
          <Card padding="md" className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                Personal
              </p>
              <div className="mt-1.5 space-y-1 text-[12px]">
                <div className="flex justify-between gap-3">
                  <span className="text-ink-muted">Full name</span>
                  <span className="font-medium text-ink">
                    {onboarding.fullName}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-ink-muted">Email</span>
                  <span className="truncate font-medium text-ink">
                    {onboarding.email}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-ink-muted">City</span>
                  <span className="font-medium text-ink">
                    {onboarding.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                Address
              </p>
              <p className="mt-1.5 text-[12px] font-medium text-ink">
                {onboarding.addressLine}
              </p>
              <p className="text-[12px] text-ink-muted">{onboarding.pincode}</p>
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                Documents
              </p>
              <p className="mt-1.5 text-[12px] text-ink">
                Aadhaar: {onboarding.documents.aadhaar || 'Not uploaded'}
              </p>
              <p className="text-[12px] text-ink">
                PAN: {onboarding.documents.pan || 'Not uploaded'}
              </p>
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                Vehicle
              </p>
              <p className="mt-1.5 text-[12px] text-ink">
                {onboarding.vehicle.model} · {onboarding.vehicle.colour}
              </p>
              <p className="text-[12px] text-ink-muted">
                {onboarding.vehicle.registrationNumber}
              </p>
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                Bank
              </p>
              <p className="mt-1.5 text-[12px] text-ink">
                {onboarding.bank.accountHolder}
              </p>
              <p className="text-[12px] text-ink-muted">
                {onboarding.bank.accountNumber} · {onboarding.bank.ifsc}
              </p>
            </div>

            <p className="border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
              By submitting, you confirm these details are correct. The review
              team may contact you for clearer documents.
            </p>
          </Card>
        ) : null}

        {error ? (
          <p role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleContinue}>
            {step === onboardingSteps.length - 1
              ? 'Submit application'
              : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
