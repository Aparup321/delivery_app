import type { VehicleType } from './partner'

export type OnboardingStatus = 'draft' | 'submitted' | 'approved'

export type DocumentKey = 'aadhaar' | 'pan' | 'licence' | 'registration'

export interface OnboardingDocuments {
  aadhaar: string
  pan: string
  licence: string
  registration: string
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
  city: string
  addressLine: string
  pincode: string
  documents: OnboardingDocuments
  vehicle: OnboardingVehicle
  bank: OnboardingBank
  training: boolean[]
  submittedAt: string | null
}
