import type { OnboardingState } from '../types/onboarding'

/** Pre-filled draft so the onboarding wizard can be reviewed immediately. */
export const initialOnboarding: OnboardingState = {
  step: 0,
  status: 'draft',
  fullName: 'Aparup Das',
  email: 'aparup.das@example.com',
  city: 'Kolkata',
  addressLine: '',
  pincode: '',
  documents: {
    aadhaar: '',
    pan: '',
    licence: '',
    registration: '',
  },
  vehicle: {
    type: 'scooter',
    model: 'Honda Activa 6G',
    colour: 'Grey',
    registrationNumber: '',
  },
  bank: {
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
  },
  training: [false, false, false],
  submittedAt: null,
}

export const trainingTopics = [
  'Delivery and food safety basics',
  'Customer communication and etiquette',
  'Emergency and issue reporting',
]

export const onboardingSteps = [
  { id: 'personal', label: 'Personal' },
  { id: 'address', label: 'Address' },
  { id: 'kyc', label: 'KYC' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'bank', label: 'Bank' },
  { id: 'training', label: 'Training' },
  { id: 'review', label: 'Review' },
]
