import type { VehicleType } from './partner'

export type OnboardingStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

/** Account state written by delivery_admin and stored on partners/{uid}. */
export type PartnerAccountStatus = 'pending' | 'active' | 'paused'

export type DocumentKey =
  | 'aadhaar'
  | 'pan'
  | 'licence'
  | 'registration'
  | 'passbook'

export interface OnboardingDocuments {
  aadhaar: string
  pan: string
  licence: string
  registration: string
  passbook: string
}

/** Aadhaar and PAN numbers. The licence number is captured in vehicle details. */
export interface OnboardingDocumentNumbers {
  aadhaar: string
  pan: string
  licence: string
}

export interface OnboardingVehicle {
  type: VehicleType
  model: string
  colour: string
  registrationNumber: string
}

export interface OnboardingBank {
  accountHolder: string
  accountNumber: string
  ifsc: string
}

export interface OnboardingFiles {
  profilePhoto?: File
  documents: Partial<Record<DocumentKey, File>>
}

export interface SubmitOnboardingOptions {
  /** Write the application without attempting any file uploads. */
  skipUploads?: boolean
}

export interface OnboardingState {
  step: number
  status: OnboardingStatus
  fullName: string
  email: string
  /** ISO date (yyyy-mm-dd) entered on the personal step. */
  dateOfBirth: string
  /** Downscaled data URL for the required profile photo, or empty. */
  profilePhoto: string
  city: string
  addressLine: string
  pincode: string
  /** Numbers printed on the Aadhaar and PAN, plus the licence entered with the vehicle. */
  documentNumbers: OnboardingDocumentNumbers
  documents: OnboardingDocuments
  vehicle: OnboardingVehicle
  bank: OnboardingBank
  training: boolean[]
  submittedAt: string | null
  /** When the current status last changed. */
  statusUpdatedAt: string | null
  /** Administrator's rejection note, shown on the application status screen. */
  rejectionReason: string | null
  /** Live account state written by delivery_admin. */
  accountStatus: PartnerAccountStatus
  /** Suspension note written by delivery_admin. */
  suspensionReason: string | null
  accountStatusUpdatedAt: string | null
  /** Admin partner directory ID, when delivery_admin linked this account. */
  adminPartnerId: string | null
}
