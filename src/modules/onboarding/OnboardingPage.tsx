import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Bike,
  Camera,
  Check,
  Clock3,
  FileText,
  Footprints,
  Play,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useAuth } from '../../context/auth'
import { onboardingSteps, trainingTopics } from '../../mock/onboarding'
import type { DocumentKey, OnboardingState } from '../../types/onboarding'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PINCODE_PATTERN = /^\d{6}$/
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/
const REGISTRATION_PATTERN =
  /^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,2}[- ]?\d{4}$/i

const documentFields: Array<{
  key: DocumentKey
  title: string
  hint: string
  required: boolean
}> = [
  {
    key: 'aadhaar',
    title: 'Aadhaar card',
    hint: 'Front and back, JPG or PDF',
    required: true,
  },
  {
    key: 'pan',
    title: 'PAN card',
    hint: 'Clear photo of the card',
    required: true,
  },
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

const vehicleOptions: Array<{
  value: OnboardingState['vehicle']['type']
  label: string
  icon: LucideIcon
}> = [
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'scooter', label: 'Scooter', icon: Bike },
  { value: 'bicycle', label: 'Bicycle', icon: Bike },
  { value: 'foot', label: 'On foot', icon: Footprints },
]

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024
const PHOTO_EDGE = 256

/** Downscales an image file to a small square-safe data URL. */
function createPhotoPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, PHOTO_EDGE / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')

      URL.revokeObjectURL(objectUrl)

      if (!context) {
        reject(new Error('Canvas is unavailable'))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image could not be read'))
    }

    image.src = objectUrl
  })
}

function validateStep(step: number, state: OnboardingState): string {
  switch (step) {
    case 0:
      if (!state.profilePhoto) {
        return 'Upload a profile photo to continue.'
      }
      if (state.fullName.trim().length < 3) {
        return 'Enter your full name as it appears on your documents.'
      }
      if (!EMAIL_PATTERN.test(state.email)) {
        return 'Enter a valid email address.'
      }
      if (!state.dateOfBirth) {
        return 'Enter your date of birth.'
      }

      const dateOfBirth = new Date(`${state.dateOfBirth}T00:00:00`)
      if (Number.isNaN(dateOfBirth.getTime())) {
        return 'Enter a valid date of birth.'
      }

      const today = new Date()
      if (dateOfBirth > today) {
        return 'Date of birth cannot be in the future.'
      }

      let age = today.getFullYear() - dateOfBirth.getFullYear()
      const monthDelta = today.getMonth() - dateOfBirth.getMonth()
      if (
        monthDelta < 0 ||
        (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())
      ) {
        age -= 1
      }

      if (age < 18) {
        return 'You must be at least 18 years old to deliver with Fafo.'
      }
      if (!state.city.trim()) {
        return 'Enter your city.'
      }
      if (state.addressLine.trim().length < 8) {
        return 'Enter your current address.'
      }
      if (!PINCODE_PATTERN.test(state.pincode)) {
        return 'Enter a 6-digit PIN code.'
      }
      return ''
    case 1:
      if (!state.documents.aadhaar) {
        return 'Upload your Aadhaar card to continue.'
      }
      if (!state.documents.pan) {
        return 'Upload your PAN card to continue.'
      }
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
    case 2: {
      const needsRegistration =
        state.vehicle.type === 'bike' || state.vehicle.type === 'scooter'

      if (state.vehicle.type !== 'foot' && !state.vehicle.model.trim()) {
        return 'Enter your vehicle model.'
      }
      if (
        needsRegistration &&
        !REGISTRATION_PATTERN.test(state.vehicle.registrationNumber)
      ) {
        return 'Enter a valid registration number, for example WB02AB1234.'
      }
      return ''
    }
    case 3:
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
  const { session, signOut } = useAuth()
  const { onboarding, updateOnboarding, submitOnboarding } = useApp()
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [documentErrors, setDocumentErrors] = useState<
    Partial<Record<DocumentKey, string>>
  >({})

  const step = Math.min(onboarding.step, onboardingSteps.length - 1)
  const isSubmitted = onboarding.status !== 'draft'

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose a JPG or PNG image.')
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Choose an image smaller than 5 MB.')
      return
    }

    try {
      const preview = await createPhotoPreview(file)
      updateOnboarding({ profilePhoto: preview })
      setPhotoError('')
    } catch {
      setPhotoError('Could not read that image. Try another file.')
    }
  }

  function handleBack() {
    setError('')
    if (step > 0) {
      updateOnboarding({ step: step - 1 })
      return
    }
    navigate('/')
  }

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
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
  }

  if (isSubmitted) {
    return (
      <div className="pb-8">
        <ScreenHeader
          title="Partner setup"
          subtitle="Application submitted"
          showBack
          backTo="/"
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
      <header className="relative overflow-hidden rounded-b-[1.75rem] bg-brand-gradient px-4 pb-5 pt-6 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">
            Partner Onboarding
          </h1>
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-auto rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Sign out
          </button>
        </div>

        <div className="relative mt-5">
          <span
            aria-hidden="true"
            className="absolute left-5 right-5 top-3.5 h-px bg-white/25"
          />
          <ol className="relative flex justify-between">
            {onboardingSteps.map((item, index) => {
              const isDone = index < step
              const isActive = index === step

              return (
                <li
                  key={item.id}
                  className="flex w-full flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full border text-[11px] font-bold',
                      isDone
                        ? 'border-white bg-white text-brand-deep'
                        : isActive
                          ? 'border-white bg-white text-brand-deep ring-4 ring-white/20'
                          : 'border-white/35 bg-white/10 text-white/80',
                    )}
                  >
                    {isDone ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-[10.5px] font-semibold',
                      isDone || isActive ? 'text-white' : 'text-white/70',
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-5">
        {step === 0 ? (
          <>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-ink">
                Personal Details
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Tell us about yourself
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <label className="relative cursor-pointer">
                <span className="sr-only">Profile photo</span>
                {onboarding.profilePhoto ? (
                  <img
                    src={onboarding.profilePhoto}
                    alt="Profile photo preview"
                    className="size-24 rounded-full object-cover ring-4 ring-brand-soft"
                  />
                ) : (
                  <span className="grid size-24 place-items-center rounded-full bg-brand-soft text-brand-deep">
                    <Camera className="size-8" aria-hidden="true" />
                  </span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 grid size-8 place-items-center rounded-full bg-brand text-white shadow-card">
                  <Camera className="size-4" aria-hidden="true" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload profile photo"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>

              <p className="text-[12.5px] font-semibold text-ink">
                Profile photo <span className="text-danger">*</span>
              </p>
              <p className="text-center text-[11px] text-ink-muted">
                {onboarding.profilePhoto
                  ? 'Tap the photo to change it'
                  : 'Clear front-facing photo, JPG or PNG'}
              </p>
              {photoError ? (
                <p role="alert" className="text-xs font-medium text-danger">
                  {photoError}
                </p>
              ) : null}
            </div>

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
                label="Mobile number"
                value={session ? `+91 ${session.phone}` : ''}
                hint="Your verified number cannot be changed here."
                readOnly
                disabled
              />
              <Input
                label="Email"
                type="email"
                required
                value={onboarding.email}
                placeholder="you@example.com"
                onChange={(event) =>
                  updateOnboarding({ email: event.target.value })
                }
              />
              <Input
                label="Date of birth"
                type="date"
                required
                value={onboarding.dateOfBirth}
                onChange={(event) =>
                  updateOnboarding({ dateOfBirth: event.target.value })
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
                label="Address"
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
            </Card>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-ink">
                KYC Verification
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Upload clear JPG or PDF documents, up to 2 MB each
              </p>
            </div>

            <div className="space-y-2.5">
              {documentFields.map((field) => {
                const fileName = onboarding.documents[field.key]

                return (
                  <label key={field.key} className="block cursor-pointer">
                    <Card padding="sm">
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
                          <span className="grid size-6 place-items-center rounded-full bg-success text-white">
                            <Check className="size-3.5" aria-hidden="true" />
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-brand">
                            Upload
                          </span>
                        )}
                      </div>

                      {documentErrors[field.key] ? (
                        <p
                          role="alert"
                          className="mt-2 text-[11px] font-medium text-danger"
                        >
                          {documentErrors[field.key]}
                        </p>
                      ) : null}

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        aria-label={`Upload ${field.title}`}
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          event.target.value = ''

                          if (!file) {
                            return
                          }

                          if (file.size > MAX_DOCUMENT_BYTES) {
                            setDocumentErrors((current) => ({
                              ...current,
                              [field.key]: 'File is larger than 2 MB. Choose a smaller file.',
                            }))
                            return
                          }

                          setDocumentErrors((current) => ({
                            ...current,
                            [field.key]: '',
                          }))
                          updateOnboarding({
                            documents: {
                              ...onboarding.documents,
                              [field.key]: file.name,
                            },
                          })
                        }}
                      />
                    </Card>
                  </label>
                )
              })}
            </div>

            <Card padding="sm" className="border-warning/25 bg-warning-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
                  <Clock3 className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-ink">
                    Verification status
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                    Documents are checked after you submit, usually within one
                    working day.
                  </p>
                </div>
                <Badge tone="warning" size="sm">
                  Pending
                </Badge>
              </div>
            </Card>

            <Card padding="md" className="space-y-3">
              <p className="text-[13px] font-bold text-ink">
                Bank account details
              </p>
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
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-ink">
                Vehicle Details
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Provide your vehicle and licence information
              </p>
            </div>

            <Card padding="md" className="space-y-4">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink">
                  Vehicle type <span className="text-danger">*</span>
                </p>
                <div
                  role="radiogroup"
                  aria-label="Vehicle type"
                  className="grid grid-cols-2 gap-2"
                >
                  {vehicleOptions.map(({ value, label, icon: Icon }) => {
                    const selected = onboarding.vehicle.type === value

                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          updateOnboarding({
                            vehicle: { ...onboarding.vehicle, type: value },
                          })
                        }
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                          selected
                            ? 'border-brand bg-brand-tint text-brand-deep'
                            : 'border-line bg-surface text-ink hover:border-brand/30',
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {onboarding.vehicle.type === 'bike' ||
              onboarding.vehicle.type === 'scooter' ? (
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
              ) : (
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  {onboarding.vehicle.type === 'foot'
                    ? 'Walking deliveries do not need a vehicle registration.'
                    : 'Bicycles do not need a registration number.'}
                </p>
              )}
              {onboarding.vehicle.type !== 'foot' ? (
                <>
                  <Input
                    label="Vehicle model"
                    required
                    value={onboarding.vehicle.model}
                    placeholder="Honda Activa 6G"
                    onChange={(event) =>
                      updateOnboarding({
                        vehicle: {
                          ...onboarding.vehicle,
                          model: event.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    label="Vehicle colour"
                    value={onboarding.vehicle.colour}
                    placeholder="Black"
                    onChange={(event) =>
                      updateOnboarding({
                        vehicle: {
                          ...onboarding.vehicle,
                          colour: event.target.value,
                        },
                      })
                    }
                  />
                </>
              ) : null}
            </Card>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-ink">
                Training &amp; Onboarding
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Complete every module before your account is approved
              </p>
            </div>

            <div className="space-y-2.5">
              {trainingTopics.map((topic, index) => {
                const isComplete = Boolean(onboarding.training[index])

                return (
                  <button
                    key={topic.title}
                    type="button"
                    role="checkbox"
                    aria-checked={isComplete}
                    onClick={() => {
                      const next = [...onboarding.training]
                      next[index] = !next[index]
                      updateOnboarding({ training: next })
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left shadow-card transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full',
                        isComplete
                          ? 'bg-brand-soft text-brand-deep'
                          : 'bg-brand-tint text-brand',
                      )}
                    >
                      <Play className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink">
                        {topic.title}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        {topic.duration}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full',
                        isComplete
                          ? 'bg-success text-white'
                          : 'border-2 border-line text-transparent',
                      )}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-ink">
                Review &amp; Submit
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Check your details before sending them for verification
              </p>
            </div>

            <Card padding="md" className="space-y-4">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Personal
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 0 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  {onboarding.profilePhoto ? (
                    <img
                      src={onboarding.profilePhoto}
                      alt=""
                      className="size-9 rounded-full object-cover"
                    />
                  ) : null}
                  <p className="text-[12.5px] font-semibold text-ink">
                    {onboarding.fullName}
                  </p>
                </div>
                <p className="text-[11.5px] text-ink-muted">
                  Profile photo{' '}
                  {onboarding.profilePhoto ? 'added' : 'missing'}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.email}
                  {onboarding.dateOfBirth
                    ? ` · ${formatDate(onboarding.dateOfBirth)}`
                    : ''}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.addressLine}, {onboarding.city}{' '}
                  {onboarding.pincode}
                </p>
              </section>

              <section className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    KYC &amp; bank
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 1 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] text-ink-muted">
                  Aadhaar {onboarding.documents.aadhaar ? 'uploaded' : 'missing'}{' '}
                  · PAN {onboarding.documents.pan ? 'uploaded' : 'missing'}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.bank.accountHolder} ····{' '}
                  {onboarding.bank.accountNumber.slice(-4)}
                </p>
              </section>

              <section className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Vehicle
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 2 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-1.5 text-[12px] text-ink">
                  {onboarding.vehicle.type === 'foot'
                    ? 'Walking delivery partner'
                    : `${onboarding.vehicle.model} · ${onboarding.vehicle.colour}`}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.vehicle.type === 'foot'
                    ? 'On foot · no vehicle or registration needed'
                    : onboarding.vehicle.type === 'bicycle'
                      ? `Bicycle · ${onboarding.vehicle.colour}`
                      : `${onboarding.vehicle.registrationNumber} · ${onboarding.vehicle.type}`}
                </p>
              </section>

              <section className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Training
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 3 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] text-ink-muted">
                  {onboarding.training.filter(Boolean).length} of{' '}
                  {trainingTopics.length} modules complete
                </p>
              </section>

              <p className="border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
                By submitting, you confirm these details are correct. The review
                team may contact you for clearer documents.
              </p>
            </Card>
          </>
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
