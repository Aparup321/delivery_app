import type { VehicleType } from './partner'

export type OnboardingStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

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

/** Numbers printed on the KYC documents. The RC number lives on the vehicle. */
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
  /** Numbers printed on the Aadhaar, PAN and driving licence. */
  documentNumbers: OnboardingDocumentNumbers
  documents: OnboardingDocuments
  vehicle: OnboardingVehicle
  bank: OnboardingBank
  training: boolean[]
  submittedAt: string | null
  /** When the current status last changed. */
  statusUpdatedAt: string | null
}
