import type { OnboardingState } from '../types/onboarding'

/** Pre-filled draft so the onboarding wizard can be reviewed immediately. */
export const initialOnboarding: OnboardingState = {
  step: 0,
  status: 'draft',
  fullName: 'Rahul Das',
  email: 'meow.das@example.com',
  dateOfBirth: '',
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
  training: [false, false, false, false, false],
  submittedAt: null,
}

export const trainingTopics = [
  { title: 'Welcome to PicDrop + HopNgo', duration: '2 min' },
  { title: 'How to Accept Delivery Orders', duration: '3 min' },
  { title: 'Pickup & Delivery Process', duration: '4 min' },
  { title: 'Customer Interaction Guidelines', duration: '2 min' },
  { title: 'Delivery Safety & Best Practices', duration: '3 min' },
]

export const onboardingSteps = [
  { id: 'personal', label: 'Personal' },
  { id: 'kyc', label: 'KYC' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'training', label: 'Training' },
  { id: 'review', label: 'Review' },
]
