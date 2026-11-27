import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Bike,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Footprints,
  Loader2,
  Play,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { IconButton } from '../../components/common/IconButton'
import { Input } from '../../components/common/Input'
import { ProgressBar } from '../../components/common/ProgressBar'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { onboardingSteps, trainingTopics } from '../../mock/onboarding'
import type { TrainingTopic } from '../../mock/onboarding'
import type {
  DocumentKey,
  OnboardingFiles,
  OnboardingState,
} from '../../types/onboarding'
import { applicationStatusMeta } from '../../utils/applicationStatus'
import { cn } from '../../utils/cn'
import { decodeTrainingClip } from '../../utils/videoClip'
import { OnboardingStepHeading } from './OnboardingStepHeading'
import { OnboardingLanguagePicker } from './OnboardingLanguagePicker'
import {
  getFirebaseErrorCode,
  getFirebaseWriteErrorKey,
} from '../../utils/firebaseError'
import { formatDate } from '../../utils/format'
import { validateStep } from '../../utils/onboardingValidation'
import { DocumentUploadTile } from './DocumentUploadTile'
import { KycDocumentCard } from './KycDocumentCard'
import { mediaUploadsEnabled } from '../../config/media'

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

const MAX_PHOTO_BYTES = 2 * 1024 * 1024
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

export function OnboardingPage() {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const {
    onboarding,
    updateOnboarding,
    submitOnboarding,
    isLoading,
  } = useApp()
  const { t, locale } = useLanguage()
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmitWithoutDocuments, setCanSubmitWithoutDocuments] =
    useState(false)
  const [documentErrors, setDocumentErrors] = useState<
    Partial<Record<DocumentKey, string>>
  >({})
  const [openTopic, setOpenTopic] = useState<string | null>(null)
  const [videoTopic, setVideoTopic] = useState<TrainingTopic | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const uploadFiles = useRef<OnboardingFiles>({ documents: {} })

  // Load the clip into a blob before giving it to the player. Playing the file
  // URL directly lets a server that answers with Content-Disposition or a
  // generic MIME type make Chrome download it instead of playing it.
  useEffect(() => {
    if (!videoTopic?.video) {
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    fetch(videoTopic.video)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Video request failed: ${response.status}`)
        }
        return response.arrayBuffer()
      })
      .then((buffer) => {
        if (cancelled) {
          return
        }
        objectUrl = URL.createObjectURL(decodeTrainingClip(buffer))
        setVideoSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setVideoFailed(true)
        }
      })

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [videoTopic])

  const step = Math.min(onboarding.step, onboardingSteps.length - 1)
  const isSubmitted = onboarding.status !== 'draft'
  const applicationStatus = applicationStatusMeta[onboarding.status]
  const vehicleLabel =
    vehicleOptions.find((option) => option.value === onboarding.vehicle.type)
      ?.label ?? ''
  const isMotorised =
    onboarding.vehicle.type === 'bike' ||
    onboarding.vehicle.type === 'scooter'

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
      setPhotoError('Choose an image smaller than 2 MB.')
      return
    }

    try {
      const preview = await createPhotoPreview(file)
      uploadFiles.current.profilePhoto = file
      updateOnboarding({ profilePhoto: preview })
      setPhotoError('')
    } catch {
      setPhotoError('Could not read that image. Try another file.')
    }
  }

  function handleDocumentChange(key: DocumentKey, file: File) {
    if (file.size > MAX_DOCUMENT_BYTES) {
      setDocumentErrors((current) => ({
        ...current,
        [key]: 'File is larger than 2 MB. Choose a smaller file.',
      }))
      return
    }

    setDocumentErrors((current) => ({ ...current, [key]: '' }))
    uploadFiles.current.documents[key] = file
    updateOnboarding({
      documents: { ...onboarding.documents, [key]: file.name },
    })
  }

  function handleBack() {
    setError('')
    setErrorCode(null)
    if (step > 0) {
      updateOnboarding({ step: step - 1 })
      return
    }
    navigate('/')
  }

  function handleSignOut() {
    // Leave the protected route before the session clears so the guard cannot
    // save /onboarding as the destination for the next sign-in.
    navigate('/login', { replace: true })
    void signOut()
  }

  /**
   * Marks one training module complete (never incomplete) and opens the next
   * unfinished module, the same result as the manual action. Called when a
   * lesson video ends, so finishing a module no longer leaves the partner stuck
   * in the player needing to close it and tap "Mark as complete" themselves.
   */
  function completeTrainingTopic(topicId: string) {
    const index = trainingTopics.findIndex((topic) => topic.id === topicId)

    if (index < 0 || onboarding.training[index]) {
      return
    }

    const next = [...onboarding.training]
    next[index] = true
    updateOnboarding({ training: next })

    const nextIncomplete = next.findIndex(
      (done, position) => position > index && !done,
    )
    setOpenTopic(
      nextIncomplete >= 0 ? trainingTopics[nextIncomplete]?.id ?? null : null,
    )
  }

  async function handleContinue() {
    const message = validateStep(step, onboarding)
    if (message) {
      setError(message)
      return
    }

    setError('')
    setErrorCode(null)
    setCanSubmitWithoutDocuments(false)

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

    setIsSubmitting(true)

    try {
      await submitOnboarding(uploadFiles.current)
    } catch (caught) {
      const code = getFirebaseErrorCode(caught)
      setErrorCode(code)
      setError(
        getFirebaseWriteErrorKey(code) ??
          'Could not submit your application. Check your connection and try again.',
      )
      setCanSubmitWithoutDocuments(Boolean(code?.startsWith('storage/')))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitWithoutDocuments() {
    setError('')
    setErrorCode(null)
    setCanSubmitWithoutDocuments(false)
    setIsSubmitting(true)

    try {
      await submitOnboarding(uploadFiles.current, { skipUploads: true })
    } catch (caught) {
      const code = getFirebaseErrorCode(caught)
      setErrorCode(code)
      setError(
        getFirebaseWriteErrorKey(code) ??
          'Could not submit your application. Check your connection and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div
        className="grid min-h-[60svh] place-items-center"
        role="status"
        aria-label={t('Loading')}
      >
        <span className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="pb-8">
        <ScreenHeader
          title={t('Partner setup')}
          subtitle={t('Application status')}
          showBack
          backTo="/"
        />

        <div className="px-4 pt-6">
          <Card padding="lg" className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
              <BadgeCheck className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {t(applicationStatus.headline)}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              {t(applicationStatus.description)}
              {onboarding.submittedAt
                ? ` ${t('Submitted on {date}.', {
                    date: formatDate(onboarding.submittedAt, locale),
                  })}`
                : ''}
            </p>
            <div className="mt-4 flex justify-center">
              <Badge tone={applicationStatus.tone}>
                {t(applicationStatus.label)}
              </Badge>
            </div>

            <Button
              className="mt-5"
              fullWidth
              onClick={() => navigate('/application-status')}
            >
              {t('Track application status')}
            </Button>
            <Button
              className="mt-2"
              variant="outline"
              fullWidth
              onClick={() => navigate('/')}
            >
              {t('Back to home')}
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <header className="relative overflow-hidden rounded-b-2xl bg-brand-deep px-4 pb-5 pt-6 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('Go back')}
            onClick={handleBack}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">
            {t('Partner Onboarding')}
          </h1>
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-auto rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {t('Sign out')}
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
                    {t(item.label)}
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
            <OnboardingLanguagePicker />

            <OnboardingStepHeading
              icon={UserRound}
              title={t('Personal Details')}
              subtitle={t('Tell us about yourself')}
            />

            {mediaUploadsEnabled ? (
              <div className="flex flex-col items-center gap-1.5">
                <label className="relative cursor-pointer">
                <span className="sr-only">{t('Profile photo')}</span>
                {onboarding.profilePhoto ? (
                  <img
                    src={onboarding.profilePhoto}
                    alt={t('Profile photo preview')}
                    className="size-24 rounded-full object-cover ring-4 ring-brand-soft"
                  />
                ) : (
                  <span className="grid size-24 place-items-center rounded-full bg-brand-soft text-brand-deep">
                    <Camera className="size-8" aria-hidden="true" />
                  </span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 grid size-8 place-items-center rounded-full bg-brand text-white">
                  <Camera className="size-4" aria-hidden="true" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  aria-label={t('Upload profile photo')}
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>

              <p className="text-[12.5px] font-semibold text-ink">
                {t('Profile photo')}{' '}
                <span className="font-normal text-ink-soft">
                  {t('(optional)')}
                </span>
              </p>
              <p className="text-center text-[11px] text-ink-muted">
                {t(
                  onboarding.profilePhoto
                    ? 'Tap the photo to change it · max 2 MB'
                    : 'Clear front-facing photo, JPG or PNG · max 2 MB',
                )}
              </p>
              {photoError ? (
                <p role="alert" className="text-xs font-medium text-danger">
                  {t(photoError)}
                </p>
              ) : null}
              </div>
            ) : null}

            <Card padding="md" className="space-y-3">
              <Input
                label={t('Full name')}
                required
                value={onboarding.fullName}
                placeholder={t('Name as on documents')}
                onChange={(event) =>
                  updateOnboarding({ fullName: event.target.value })
                }
              />
              <Input
                label={t('Mobile number')}
                required
                value={session ? `+91 ${session.phone}` : ''}
                hint={t('Your verified number cannot be changed here.')}
                readOnly
                disabled
              />
              <Input
                label={t('Email')}
                type="email"
                required
                value={onboarding.email}
                placeholder="you@example.com"
                onChange={(event) =>
                  updateOnboarding({ email: event.target.value })
                }
              />
              <Input
                label={t('Date of birth')}
                type="date"
                required
                value={onboarding.dateOfBirth}
                onChange={(event) =>
                  updateOnboarding({ dateOfBirth: event.target.value })
                }
              />
              <Input
                label={t('City')}
                required
                value={onboarding.city}
                placeholder={t('Your city')}
                onChange={(event) =>
                  updateOnboarding({ city: event.target.value })
                }
              />
              <Input
                label={t('Address')}
                required
                value={onboarding.addressLine}
                placeholder={t('House, street, area')}
                onChange={(event) =>
                  updateOnboarding({ addressLine: event.target.value })
                }
              />
              <Input
                label={t('PIN code')}
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
            <OnboardingStepHeading
              icon={ShieldCheck}
              title={t('KYC Verification')}
              subtitle={t(
                mediaUploadsEnabled
                  ? 'Each file must be JPG or PDF and within 2 MB'
                  : 'Enter document numbers for manual verification',
              )}
            />

            <div className="space-y-2.5">
              <KycDocumentCard
                title={t('Aadhaar card')}
                numberLabel={t('Aadhaar number')}
                numberValue={onboarding.documentNumbers.aadhaar}
                numberPlaceholder="1234 5678 9012"
                numberHint={t('12-digit number on your Aadhaar card')}
                inputMode="numeric"
                maxLength={12}
                required
                fileName={onboarding.documents.aadhaar}
                fileHint={t('Optional · front and back, JPG or PDF · max 2 MB')}
                fileError={
                  documentErrors.aadhaar
                    ? t(documentErrors.aadhaar)
                    : undefined
                }
                onNumberChange={(value) =>
                  updateOnboarding({
                    documentNumbers: {
                      ...onboarding.documentNumbers,
                      aadhaar: value.replace(/\D/g, '').slice(0, 12),
                    },
                  })
                }
                onFileChange={(file) => handleDocumentChange('aadhaar', file)}
              />

              <KycDocumentCard
                title={t('PAN card')}
                numberLabel={t('PAN number')}
                numberValue={onboarding.documentNumbers.pan}
                numberPlaceholder="ABCDE1234F"
                numberHint={t('10-character PAN, e.g. ABCDE1234F')}
                maxLength={10}
                autoCapitalize="characters"
                required
                fileName={onboarding.documents.pan}
                fileHint={t('Optional · clear photo of the card · max 2 MB')}
                fileError={
                  documentErrors.pan ? t(documentErrors.pan) : undefined
                }
                onNumberChange={(value) =>
                  updateOnboarding({
                    documentNumbers: {
                      ...onboarding.documentNumbers,
                      pan: value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 10),
                    },
                  })
                }
                onFileChange={(file) => handleDocumentChange('pan', file)}
              />

              <KycDocumentCard
                title={t('Driving licence')}
                numberLabel={t('Licence number')}
                numberValue={onboarding.documentNumbers.licence}
                numberPlaceholder="WB-0120210012345"
                numberHint={t(
                  'Required for bike or scooter · can also be entered on the vehicle step.',
                )}
                maxLength={18}
                autoCapitalize="characters"
                fileName={onboarding.documents.licence}
                fileHint={t('Optional · needed for motorised vehicles · max 2 MB')}
                fileError={
                  documentErrors.licence
                    ? t(documentErrors.licence)
                    : undefined
                }
                onNumberChange={(value) =>
                  updateOnboarding({
                    documentNumbers: {
                      ...onboarding.documentNumbers,
                      licence: value
                        .toUpperCase()
                        .replace(/[^A-Z0-9- ]/g, '')
                        .slice(0, 18),
                    },
                  })
                }
                onFileChange={(file) => handleDocumentChange('licence', file)}
              />

              <KycDocumentCard
                title={t('Vehicle RC')}
                numberLabel={t('Registration number')}
                numberValue={onboarding.vehicle.registrationNumber}
                numberPlaceholder="WB02AB1234"
                numberHint={t(
                  'Required for bike or scooter · can also be entered on the vehicle step.',
                )}
                maxLength={13}
                autoCapitalize="characters"
                fileName={onboarding.documents.registration}
                fileHint={t('Optional · registration certificate · max 2 MB')}
                fileError={
                  documentErrors.registration
                    ? t(documentErrors.registration)
                    : undefined
                }
                onNumberChange={(value) =>
                  updateOnboarding({
                    vehicle: {
                      ...onboarding.vehicle,
                      registrationNumber: value.toUpperCase().slice(0, 13),
                    },
                  })
                }
                onFileChange={(file) =>
                  handleDocumentChange('registration', file)
                }
              />
            </div>

            <Card padding="sm" className="border-warning/25 bg-warning-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
                  <Clock3 className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-ink">
                    {t('Verification status')}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                    {t(
                      'Documents are checked after you submit, usually within one working day.',
                    )}
                  </p>
                </div>
                <Badge tone="warning" size="sm">
                  {t('Pending')}
                </Badge>
              </div>
            </Card>

            <Card padding="md" className="space-y-3">
              <p className="text-[13px] font-semibold text-ink">
                {t('Bank account details')}
              </p>
              <Input
                label={t('Account holder name')}
                required
                value={onboarding.bank.accountHolder}
                placeholder={t('Name as on the bank account')}
                onChange={(event) =>
                  updateOnboarding({
                    bank: {
                      ...onboarding.bank,
                      accountHolder: event.target.value,
                    },
                  })
                }
              />
              <div>
                <div className="flex items-start gap-3">
                  <Input
                    containerClassName="min-w-0 flex-1"
                    label={t('Account number')}
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

                  {mediaUploadsEnabled ? (
                    <DocumentUploadTile
                      className="mt-[26px]"
                      documentName={t('Bank passbook')}
                      fileName={onboarding.documents.passbook}
                      onFileChange={(file) =>
                        handleDocumentChange('passbook', file)
                      }
                    />
                  ) : (
                    <span className="mt-[26px] grid w-[104px] shrink-0 place-items-center rounded-2xl border border-dashed border-line bg-canvas px-2 py-2.5 text-center text-[10.5px] font-medium text-ink-muted">
                      {t('Manual review')}
                    </span>
                  )}
                </div>

                <p className="mt-2 break-words text-[11px] leading-relaxed text-ink-muted">
                  {mediaUploadsEnabled
                    ? onboarding.documents.passbook ||
                      t('Passbook or cancelled cheque · JPG or PDF · max 2 MB')
                    : t('Document number only · manual verification')}
                </p>

                {documentErrors.passbook ? (
                  <p
                    role="alert"
                    className="mt-2 text-[11px] font-medium text-danger"
                  >
                    {t(documentErrors.passbook)}
                  </p>
                ) : null}
              </div>
              <Input
                label={t('IFSC code')}
                required
                value={onboarding.bank.ifsc}
                placeholder="HDFC0001234"
                hint={t('Find this on your cheque book or bank app.')}
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
            <OnboardingStepHeading
              icon={Bike}
              title={t('Vehicle Details')}
              subtitle={t('Provide your vehicle and licence information')}
            />

            <Card padding="md" className="space-y-4">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink">
                  {t('Vehicle type')} <span className="text-danger">*</span>
                </p>
                <div
                  role="radiogroup"
                  aria-label={t('Vehicle type')}
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
                        {t(label)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {isMotorised ? (
                <>
                  <Input
                    label={t('Licence number')}
                    required
                    value={onboarding.documentNumbers.licence}
                    placeholder="WB-0120210012345"
                    hint={t('Licence number as printed on the card')}
                    maxLength={18}
                    autoCapitalize="characters"
                    onChange={(event) =>
                      updateOnboarding({
                        documentNumbers: {
                          ...onboarding.documentNumbers,
                          licence: event.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9- ]/g, '')
                            .slice(0, 18),
                        },
                      })
                    }
                  />
                  <Input
                    label={t('Registration number')}
                    required
                    value={onboarding.vehicle.registrationNumber}
                    placeholder="WB02AB1234"
                    maxLength={13}
                    autoCapitalize="characters"
                    hint={t('Enter the number printed on the number plate.')}
                    onChange={(event) =>
                      updateOnboarding({
                        vehicle: {
                          ...onboarding.vehicle,
                          registrationNumber: event.target.value
                            .toUpperCase()
                            .slice(0, 13),
                        },
                      })
                    }
                  />
                </>
              ) : (
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  {t(
                    onboarding.vehicle.type === 'foot'
                      ? 'Walking deliveries do not need a licence or registration.'
                      : 'Bicycles do not need a licence or registration number.',
                  )}
                </p>
              )}
              {onboarding.vehicle.type !== 'foot' ? (
                <>
                  <Input
                    label={t('Vehicle model')}
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
                    label={t('Vehicle colour')}
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
            <OnboardingStepHeading
              icon={Play}
              title={t('Training & Onboarding')}
              subtitle={t(
                'Complete every module before your account is approved',
              )}
            />

            <ProgressBar
              value={onboarding.training.filter(Boolean).length}
              max={trainingTopics.length}
              label={t('Training progress')}
              hint={t('{completed} of {total} completed', {
                completed: onboarding.training.filter(Boolean).length,
                total: trainingTopics.length,
              })}
            />

            <p className="text-[12px] leading-relaxed text-ink-muted">
              {t(
                'Watch each short module; it marks complete when the video ends.',
              )}
            </p>

            <div className="space-y-2.5">
              {trainingTopics.map((topic, index) => {
                const isComplete = Boolean(onboarding.training[index])
                const isOpen = openTopic === topic.id

                return (
                  <div
                    key={topic.id}
                    className={cn(
                      'overflow-hidden rounded-xl border bg-surface transition-colors',
                      isComplete ? 'border-success/35' : 'border-line',
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setOpenTopic(isOpen ? null : topic.id)
                      }}
                      className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <span
                        className={cn(
                          'grid size-9 shrink-0 place-items-center rounded-full',
                          isComplete
                            ? 'bg-brand-soft text-brand-deep'
                            : 'bg-brand-tint text-brand',
                        )}
                      >
                        {isComplete ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <Play className="size-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-ink">
                          {t(topic.title)}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          {t(topic.duration)} ·{' '}
                          {isComplete
                            ? t('Completed')
                            : t('Tap to watch')}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 text-ink-soft transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen ? (
                      <div className="reveal-up border-t border-line px-3.5 pb-3.5 pt-3">
                        {topic.video ? (
                          <button
                            type="button"
                            onClick={() => {
                              setVideoSrc(null)
                              setVideoFailed(false)
                              setVideoTopic(topic)
                            }}
                            aria-label={t('Play module video')}
                            className="group relative mb-3 block w-full overflow-hidden rounded-xl border border-line bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                          >
                            <img
                              src={topic.poster}
                              alt=""
                              loading="lazy"
                              className="block aspect-[4/3] w-full object-cover object-[50%_41%]"
                            />
                            <span className="absolute inset-0 grid place-items-center bg-ink/25 transition-colors group-hover:bg-ink/35">
                              <span className="grid size-16 place-items-center rounded-full bg-brand text-white shadow-float">
                                <Play
                                  className="size-7 translate-x-0.5"
                                  fill="currentColor"
                                  aria-hidden="true"
                                />
                              </span>
                            </span>
                          </button>
                        ) : null}

                        <p className="text-[12px] leading-relaxed text-ink-muted">
                          {t(topic.summary)}
                        </p>

                        <p className="mt-3 text-[11.5px] font-semibold text-ink">
                          {t('Key points')}
                        </p>
                        <ul className="mt-1.5 space-y-1.5">
                          {topic.points.map((point) => (
                            <li
                              key={point}
                              className="flex gap-2 text-[12px] leading-relaxed text-ink-muted"
                            >
                              <Check
                                className="mt-0.5 size-3.5 shrink-0 text-success"
                                aria-hidden="true"
                              />
                              <span>{t(point)}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          size="sm"
                          fullWidth
                          variant={isComplete ? 'outline' : 'primary'}
                          className="mt-3"
                          onClick={() => {
                            if (isComplete) {
                              const next = [...onboarding.training]
                              next[index] = false
                              updateOnboarding({ training: next })
                              return
                            }

                            completeTrainingTopic(topic.id)
                          }}
                        >
                          {t(
                            isComplete
                              ? 'Mark as not complete'
                              : 'Mark as complete',
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <OnboardingStepHeading
              icon={ClipboardCheck}
              title={t('Review & Submit')}
              subtitle={t(
                'Check your details before sending them for verification',
              )}
            />

            <Card padding="md" className="space-y-4">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11.5px] font-medium text-ink-muted">
                    {t('Personal')}
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 0 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    {t('Edit')}
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
                  {t(
                    onboarding.profilePhoto
                      ? 'Profile photo added'
                      : 'Profile photo not added (optional)',
                  )}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.email}
                  {onboarding.dateOfBirth
                    ? ` · ${formatDate(onboarding.dateOfBirth, locale)}`
                    : ''}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.addressLine}, {onboarding.city}{' '}
                  {onboarding.pincode}
                </p>
              </section>

              <section className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11.5px] font-medium text-ink-muted">
                    {t('KYC & bank')}
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 1 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    {t('Edit')}
                  </button>
                </div>
                {mediaUploadsEnabled ? (
                  <>
                    <p className="mt-1.5 text-[11.5px] text-ink-muted">
                      {t('Aadhaar card')}{' '}
                      {t(onboarding.documents.aadhaar ? 'uploaded' : 'missing')} ·{' '}
                      {t('PAN card')}{' '}
                      {t(onboarding.documents.pan ? 'uploaded' : 'missing')}
                    </p>
                    <p className="text-[11.5px] text-ink-muted">
                      {t('Driving licence')}{' '}
                      {t(onboarding.documents.licence ? 'uploaded' : 'missing')} ·{' '}
                      {t('Vehicle RC')}{' '}
                      {t(onboarding.documents.registration ? 'uploaded' : 'missing')}{' '}
                      · {t('Bank passbook')}{' '}
                      {t(onboarding.documents.passbook ? 'uploaded' : 'missing')}
                    </p>
                  </>
                ) : (
                  <p className="mt-1.5 text-[11.5px] text-ink-muted">
                    {t('Document numbers are reviewed manually in this build.')}
                  </p>
                )}
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.bank.accountHolder} ····{' '}
                  {onboarding.bank.accountNumber.slice(-4)}
                </p>
              </section>

              <section className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11.5px] font-medium text-ink-muted">
                    {t('Vehicle')}
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 2 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    {t('Edit')}
                  </button>
                </div>
                <p className="mt-1.5 text-[12px] text-ink">
                  {onboarding.vehicle.type === 'foot'
                    ? t('Walking delivery partner')
                    : `${onboarding.vehicle.model} · ${onboarding.vehicle.colour}`}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {onboarding.vehicle.type === 'foot'
                    ? t(
                        'On foot · no vehicle, licence or registration needed',
                      )
                    : onboarding.vehicle.type === 'bicycle'
                      ? `${t('Bicycle')} · ${onboarding.vehicle.colour}`
                      : `${onboarding.vehicle.registrationNumber} · ${t(vehicleLabel)}`}
                </p>
                {isMotorised ? (
                  <p className="text-[11.5px] text-ink-muted">
                    {t('Licence number')}: {onboarding.documentNumbers.licence}
                  </p>
                ) : null}
              </section>

              <section className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11.5px] font-medium text-ink-muted">
                    {t('Training')}
                  </p>
                  <button
                    type="button"
                    onClick={() => updateOnboarding({ step: 3 })}
                    className="text-[11.5px] font-semibold text-brand"
                  >
                    {t('Edit')}
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] text-ink-muted">
                  {t('{completed} of {total} modules complete', {
                    completed: onboarding.training.filter(Boolean).length,
                    total: trainingTopics.length,
                  })}
                </p>
              </section>

              <p className="border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
                {t(
                  'By submitting, you confirm these details are correct. The review team may contact you for clearer documents.',
                )}
              </p>
            </Card>
          </>
        ) : null}

        {error ? (
          <div role="alert" className="space-y-2">
            <p className="text-xs font-medium text-danger">{t(error)}</p>
            {errorCode ? (
              <p className="font-mono text-[10.5px] text-ink-soft">
                {t('Error: {code}', { code: errorCode })}
              </p>
            ) : null}

            {canSubmitWithoutDocuments ? (
              <div className="rounded-xl border border-warning/25 bg-warning-soft p-3">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  {t(
                    'You can submit with document numbers only; selected files will not be uploaded.',
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="mt-2"
                  isLoading={isSubmitting}
                  onClick={handleSubmitWithoutDocuments}
                >
                  {t('Submit without documents')}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            {t('Back')}
          </Button>
          <Button onClick={handleContinue} isLoading={isSubmitting}>
            {step === onboardingSteps.length - 1
              ? t(isSubmitting ? 'Submitting…' : 'Submit application')
              : t('Continue')}
          </Button>
        </div>
      </div>

      {videoTopic
        ? createPortal(
            <div
              className="overlay-enter fixed inset-0 z-50 flex flex-col bg-black"
              role="presentation"
              onClick={() => setVideoTopic(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label={t(videoTopic.title)}
                className="flex h-full min-h-0 flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+16px)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[13px] font-semibold text-white">
                    {t(videoTopic.title)}
                  </p>
                  <IconButton
                    label={t('Close')}
                    variant="onBrand"
                    size="sm"
                    onClick={() => setVideoTopic(null)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center py-3">
                  {videoSrc ? (
                    <video
                      key={videoSrc}
                      className="max-h-full max-w-full rounded-xl bg-black"
                      controls
                      controlsList="nodownload"
                      autoPlay
                      playsInline
                      poster={videoTopic.poster}
                      aria-label={t(videoTopic.title)}
                      src={videoSrc}
                      onEnded={() => {
                        // Watching to the end completes the module and returns
                        // the partner to the list, opening the next unfinished
                        // lesson.
                        completeTrainingTopic(videoTopic.id)
                        setVideoTopic(null)
                      }}
                    />
                  ) : videoFailed ? (
                    <div className="w-full max-w-[360px] rounded-2xl bg-white/10 p-5 text-center">
                      <p className="text-[13px] font-semibold text-white">
                        {t('Video could not be loaded')}
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-white/70">
                        {t('Close the player and try again.')}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={videoTopic.poster}
                        alt=""
                        className="max-h-[60vh] max-w-full rounded-xl opacity-60"
                      />
                      <span className="flex items-center gap-2 text-[12px] font-medium text-white/80">
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        {t('Loading video…')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
