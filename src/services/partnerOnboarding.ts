import { doc, getDoc, writeBatch } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'
import { initialOnboarding } from '../mock/onboarding'
import type {
  DocumentKey,
  OnboardingFiles,
  OnboardingState,
  OnboardingStatus,
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
}: {
  uid: string
  phone: string
  state: OnboardingState
  files: OnboardingFiles
}): Promise<SubmittedOnboarding> {
  const firestore = requireDb()
  const submittedAt = new Date().toISOString()
  const statusUpdatedAt = submittedAt

  const [profilePhoto, documents] = await Promise.all([
    uploadProfilePhoto(uid, state, files),
    buildDocumentRecords(uid, state, files),
  ])

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
      profilePhotoUrl: profilePhoto?.downloadUrl ?? null,
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
  const applicationStatus =
    asOnboardingStatus(partner.applicationStatus) ??
    (partner.status === 'active' ? 'approved' : 'submitted')

  return {
    ...initialOnboarding,
    step: 0,
    status: applicationStatus,
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
    submittedAt: asStringOrNull(partner.submittedAt),
    statusUpdatedAt: asStringOrNull(partner.statusUpdatedAt),
  }
}
