import {
  doc,
  getDoc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from '../firebase'
import { initialOnboarding } from '../mock/onboarding'
import type {
  DocumentKey,
  OnboardingFiles,
  OnboardingState,
  OnboardingStatus,
  PartnerAccountStatus,
} from '../types/onboarding'
import type { VehicleType } from '../types/partner'

const documentKeys: DocumentKey[] = [
  'aadhaar',
  'pan',
  'licence',
  'registration',
  'passbook',
]

const statuses: OnboardingStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
]

const vehicleTypes: VehicleType[] = ['foot', 'bicycle', 'scooter', 'bike']

export interface SubmittedOnboarding {
  submittedAt: string
  statusUpdatedAt: string
}

/** The subset of partners/{uid} that delivery_admin can change live. */
export interface PartnerAccountSnapshot {
  applicationStatus: OnboardingStatus
  accountStatus: PartnerAccountStatus
  rejectionReason: string | null
  suspensionReason: string | null
  statusUpdatedAt: string | null
  accountStatusUpdatedAt: string | null
  submittedAt: string | null
  adminPartnerId: string | null
}

interface UploadedFile {
  fileName: string
  storagePath: string
  downloadUrl: string
  uploadedAt: string
}

interface StoredFile {
  fileName: string
  storagePath: string | null
  downloadUrl: string | null
  uploadedAt: string | null
}

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  return db
}

function requireStorage() {
  if (!storage) {
    throw new Error('Firebase Storage is not configured.')
  }

  return storage
}

/**
 * Fails before the upload retry window when the configured Storage bucket does
 * not exist. `uploadBytes` treats a missing bucket as a retryable network error
 * and ends with `storage/retry-limit-exceeded`, which hides the real setup
 * problem. A 404 from the bucket endpoint is the reliable signal; other
 * responses are left to the Storage SDK so its normal rules/error handling
 * still applies.
 */
async function isStorageBucketAvailable(): Promise<boolean> {
  const storageInstance = requireStorage()
  const bucket = storageInstance.app.options.storageBucket?.replace(
    /^gs:\/\//,
    '',
  )
  const currentUser = auth?.currentUser

  if (!bucket || !currentUser) {
    return true
  }

  let token: string
  try {
    token = await currentUser.getIdToken()
  } catch {
    return true
  }

  let response: Response
  try {
    response = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?maxResults=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
  } catch {
    // CORS or a transient network failure: let the SDK produce its own error.
    return true
  }

  return response.status !== 404
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function asOnboardingStatus(value: unknown): OnboardingStatus | null {
  return typeof value === 'string' &&
    statuses.includes(value as OnboardingStatus)
    ? (value as OnboardingStatus)
    : null
}

function asPartnerAccountStatus(value: unknown): PartnerAccountStatus {
  return value === 'active' || value === 'paused' || value === 'pending'
    ? value
    : 'pending'
}

/**
 * Reads the delivery_admin-controlled fields from partners/{uid}. The admin
 * writes applicationStatus, status, adminReview, and adminSuspension over REST.
 */
function accountSnapshotFromPartner(
  partner: Record<string, unknown>,
): PartnerAccountSnapshot {
  const review = asRecord(partner.adminReview)
  const suspension = asRecord(partner.adminSuspension)
  // A partner document created at sign-in carries only phone/session fields.
  // Defaulting it to "submitted" would skip the mandatory onboarding wizard.
  const hasApplication =
    typeof partner.fullName === 'string' ||
    typeof partner.submittedAt === 'string'
  const applicationStatus =
    asOnboardingStatus(partner.applicationStatus) ??
    (hasApplication
      ? partner.status === 'active'
        ? 'approved'
        : 'submitted'
      : 'draft')
  const reviewDecision = asString(review.decision).toLowerCase()
  const rejectionReason =
    applicationStatus === 'rejected' || reviewDecision === 'rejected'
      ? (asStringOrNull(review.reason) ??
        asStringOrNull(partner.rejectionReason))
      : null
  const suspensionReason =
    suspension.active === true
      ? (asStringOrNull(suspension.reason) ??
        asStringOrNull(partner.suspensionReason))
      : null

  return {
    applicationStatus,
    accountStatus:
      partner.status === undefined
        ? applicationStatus === 'approved'
          ? 'active'
          : 'pending'
        : asPartnerAccountStatus(partner.status),
    rejectionReason,
    suspensionReason,
    statusUpdatedAt: asStringOrNull(partner.statusUpdatedAt),
    accountStatusUpdatedAt: asStringOrNull(partner.statusUpdatedAt),
    submittedAt: asStringOrNull(partner.submittedAt),
    adminPartnerId: asStringOrNull(partner.adminPartnerId),
  }
}

function asVehicleType(value: unknown): VehicleType | null {
  return typeof value === 'string' && vehicleTypes.includes(value as VehicleType)
    ? (value as VehicleType)
    : null
}

function storedFileName(value: unknown): string {
  return asString(asRecord(value).fileName)
}

function safeFileName(file: File): string {
  return file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload'
}

async function uploadFile(
  uid: string,
  folder: string,
  file: File,
): Promise<UploadedFile> {
  const storageInstance = requireStorage()
  const fileName = safeFileName(file)
  const storagePath = `partners/${uid}/${folder}/${Date.now()}-${fileName}`
  const fileRef = ref(storageInstance, storagePath)

  await uploadBytes(fileRef, file, {
    contentType: file.type || 'application/octet-stream',
  })

  return {
    fileName: file.name,
    storagePath,
    downloadUrl: await getDownloadURL(fileRef),
    uploadedAt: new Date().toISOString(),
  }
}

async function uploadProfilePhoto(
  uid: string,
  state: OnboardingState,
  files: OnboardingFiles,
): Promise<UploadedFile | null> {
  if (files.profilePhoto) {
    return uploadFile(uid, 'profile', files.profilePhoto)
  }

  // A page reload keeps the downscaled preview but not the original File.
  if (state.profilePhoto.startsWith('data:')) {
    const response = await fetch(state.profilePhoto)
    const blob = await response.blob()
    const file = new File([blob], 'profile-photo.jpg', {
      type: blob.type || 'image/jpeg',
    })
    return uploadFile(uid, 'profile', file)
  }

  return null
}

function buildDocumentRecordsWithoutUploads(
  state: OnboardingState,
): Record<DocumentKey, StoredFile | null> {
  const entries = documentKeys.map((key) => {
    const fileName = state.documents[key]

    return [
      key,
      fileName
        ? {
            fileName,
            storagePath: null,
            downloadUrl: null,
            uploadedAt: null,
          }
        : null,
    ] as const
  })

  return Object.fromEntries(entries) as Record<DocumentKey, StoredFile | null>
}

async function buildDocumentRecords(
  uid: string,
  state: OnboardingState,
  files: OnboardingFiles,
): Promise<Record<DocumentKey, StoredFile | null>> {
  const entries = await Promise.all(
    documentKeys.map(async (key) => {
      const fileName = state.documents[key]

      if (!fileName) {
        return [key, null] as const
      }

      const file = files.documents[key]

      if (!file) {
        // The name may have survived a reload while the File object did not.
        return [
          key,
          {
            fileName,
            storagePath: null,
            downloadUrl: null,
            uploadedAt: null,
          },
        ] as const
      }

      const uploaded = await uploadFile(uid, `documents/${key}`, file)
      return [key, uploaded] as const
    }),
  )

  return Object.fromEntries(entries) as Record<DocumentKey, StoredFile | null>
}

/**
 * Uploads selected files and writes the submitted application to the roadmap
 * collections. Only download URLs and storage paths are stored in Firestore.
 */
export async function savePartnerOnboarding({
  uid,
  phone,
  state,
  files,
  skipUploads = false,
}: {
  uid: string
  phone: string
  state: OnboardingState
  files: OnboardingFiles
  skipUploads?: boolean
}): Promise<SubmittedOnboarding> {
  const firestore = requireDb()
  const storageAvailable = skipUploads
    ? false
    : await isStorageBucketAvailable()
  const submittedAt = new Date().toISOString()
  const statusUpdatedAt = submittedAt
  let profilePhoto: UploadedFile | null = null
  let profilePhotoUrl = state.profilePhoto || null
  let documents: Record<DocumentKey, StoredFile | null>

  if (storageAvailable) {
    const [uploadedPhoto, uploadedDocuments] = await Promise.all([
      uploadProfilePhoto(uid, state, files),
      buildDocumentRecords(uid, state, files),
    ])
    profilePhoto = uploadedPhoto
    profilePhotoUrl = uploadedPhoto?.downloadUrl ?? profilePhotoUrl
    documents = uploadedDocuments
  } else {
    // KYC files are optional. Without Storage, keep the document metadata and
    // the small profile preview (a 256px data URL) in Firestore instead.
    documents = buildDocumentRecordsWithoutUploads(state)
  }

  const batch = writeBatch(firestore)

  batch.set(
    doc(firestore, 'partners', uid),
    {
      partnerId: uid,
      fullName: state.fullName.trim(),
      phone: `+91${phone}`,
      email: state.email.trim(),
      dateOfBirth: state.dateOfBirth,
      city: state.city.trim(),
      addressLine: state.addressLine.trim(),
      pincode: state.pincode,
      profilePhotoUrl,
      profilePhotoPath: profilePhoto?.storagePath ?? null,
      vehicleType: state.vehicle.type,
      status: 'pending',
      applicationStatus: 'submitted',
      rating: 0,
      joinedOn: state.submittedAt?.slice(0, 10) ?? submittedAt.slice(0, 10),
      submittedAt,
      statusUpdatedAt,
      updatedAt: submittedAt,
      bank: {
        accountHolder: state.bank.accountHolder.trim(),
        accountNumber: state.bank.accountNumber,
        ifsc: state.bank.ifsc.trim().toUpperCase(),
      },
    },
    { merge: true },
  )

  batch.set(
    doc(firestore, 'partner_documents', uid),
    {
      partnerId: uid,
      documentNumbers: {
        aadhaar: state.documentNumbers.aadhaar,
        pan: state.documentNumbers.pan,
        licence: state.documentNumbers.licence,
      },
      documents,
      updatedAt: submittedAt,
    },
    { merge: true },
  )

  batch.set(
    doc(firestore, 'vehicles', uid),
    {
      partnerId: uid,
      type: state.vehicle.type,
      model: state.vehicle.model.trim(),
      colour: state.vehicle.colour.trim(),
      registrationNumber: state.vehicle.registrationNumber.trim(),
      licenceNumber: state.documentNumbers.licence,
      updatedAt: submittedAt,
    },
    { merge: true },
  )

  batch.set(
    doc(firestore, 'training_progress', uid),
    {
      partnerId: uid,
      completed: state.training,
      completedCount: state.training.filter(Boolean).length,
      updatedAt: submittedAt,
    },
    { merge: true },
  )

  await batch.commit()

  return { submittedAt, statusUpdatedAt }
}

/**
 * Rebuilds the onboarding state from Firestore. Returns null when the partner
 * has no remote record so a local draft can still be used.
 */
export async function loadPartnerOnboarding(
  uid: string,
): Promise<OnboardingState | null> {
  const firestore = requireDb()

  const [partnerSnap, documentsSnap, vehicleSnap, trainingSnap] =
    await Promise.all([
      getDoc(doc(firestore, 'partners', uid)),
      getDoc(doc(firestore, 'partner_documents', uid)),
      getDoc(doc(firestore, 'vehicles', uid)),
      getDoc(doc(firestore, 'training_progress', uid)),
    ])

  if (!partnerSnap.exists()) {
    return null
  }

  const partner = asRecord(partnerSnap.data())

  // A partner document created at sign-in only carries phone/session fields.
  // It must not be treated as a submitted application, otherwise a first-time
  // partner would skip the onboarding wizard.
  const hasApplication =
    typeof partner.applicationStatus === 'string' ||
    typeof partner.fullName === 'string' ||
    typeof partner.submittedAt === 'string'

  if (!hasApplication) {
    return null
  }

  const documents = documentsSnap.exists()
    ? asRecord(documentsSnap.data())
    : {}
  const vehicle = vehicleSnap.exists() ? asRecord(vehicleSnap.data()) : {}
  const training = trainingSnap.exists()
    ? asRecord(trainingSnap.data())
    : {}

  const documentNumbers = asRecord(documents.documentNumbers)
  const documentFiles = asRecord(documents.documents)
  const bank = asRecord(partner.bank)
  const rawTraining = training.completed
  const account = accountSnapshotFromPartner(partner)

  return {
    ...initialOnboarding,
    step: 0,
    status: account.applicationStatus,
    rejectionReason: account.rejectionReason,
    accountStatus: account.accountStatus,
    suspensionReason: account.suspensionReason,
    accountStatusUpdatedAt: account.accountStatusUpdatedAt,
    adminPartnerId: account.adminPartnerId,
    fullName: asString(partner.fullName),
    email: asString(partner.email),
    dateOfBirth: asString(partner.dateOfBirth),
    profilePhoto: asString(partner.profilePhotoUrl),
    city: asString(partner.city),
    addressLine: asString(partner.addressLine),
    pincode: asString(partner.pincode),
    documentNumbers: {
      aadhaar: asString(documentNumbers.aadhaar),
      pan: asString(documentNumbers.pan),
      licence:
        asString(documentNumbers.licence) ||
        asString(vehicle.licenceNumber),
    },
    documents: {
      aadhaar: storedFileName(documentFiles.aadhaar),
      pan: storedFileName(documentFiles.pan),
      licence: storedFileName(documentFiles.licence),
      registration: storedFileName(documentFiles.registration),
      passbook: storedFileName(documentFiles.passbook),
    },
    vehicle: {
      type:
        asVehicleType(vehicle.type) ??
        asVehicleType(partner.vehicleType) ??
        initialOnboarding.vehicle.type,
      model: asString(vehicle.model),
      colour: asString(vehicle.colour),
      registrationNumber: asString(vehicle.registrationNumber),
    },
    bank: {
      accountHolder: asString(bank.accountHolder),
      accountNumber: asString(bank.accountNumber),
      ifsc: asString(bank.ifsc),
    },
    training: Array.isArray(rawTraining)
      ? initialOnboarding.training.map(
          (_, index) => rawTraining[index] === true,
        )
      : initialOnboarding.training,
    submittedAt: account.submittedAt ?? asStringOrNull(partner.submittedAt),
    statusUpdatedAt: account.statusUpdatedAt ?? asStringOrNull(partner.statusUpdatedAt),
  }
}

/**
 * Subscribes to the partner document so an Administrator's approval,
 * rejection, suspension, or reinstatement reaches the signed-in partner app
 * without a reload.
 */
export function watchPartnerAccount(
  uid: string,
  onChange: (snapshot: PartnerAccountSnapshot) => void,
): Unsubscribe {
  const firestore = requireDb()

  return onSnapshot(
    doc(firestore, 'partners', uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        return
      }

      onChange(accountSnapshotFromPartner(asRecord(snapshot.data())))
    },
    () => {
      // Rules, auth, or network failures leave the last loaded state in place.
    },
  )
}
