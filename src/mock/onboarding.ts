import type { OnboardingState } from '../types/onboarding'

/** Blank draft: every new verified number must complete the wizard. */
export const initialOnboarding: OnboardingState = {
  step: 0,
  status: 'draft',
  fullName: '',
  email: '',
  dateOfBirth: '',
  profilePhoto: '',
  city: '',
  addressLine: '',
  pincode: '',
  addressLocation: null,
  upiId: '',
  documentNumbers: {
    aadhaar: '',
    pan: '',
    licence: '',
  },
  documents: {
    aadhaar: '',
    pan: '',
    licence: '',
    registration: '',
    passbook: '',
  },
  vehicle: {
    type: 'bike',
    model: '',
    colour: '',
    registrationNumber: '',
  },
  training: [false, false, false, false, false],
  submittedAt: null,
  statusUpdatedAt: null,
  rejectionReason: null,
  // Demo sessions keep the existing local behaviour. A Firestore record
  // overrides this with the Administrator-controlled account state.
  accountStatus: 'active',
  suspensionReason: null,
  accountStatusUpdatedAt: null,
  adminPartnerId: null,
  reviewedBy: null,
  reviewedAt: null,
}

export interface TrainingTopic {
  id: string
  title: string
  duration: string
  summary: string
  points: string[]
  /** Optional module video served from `public/training/`. The `.bin` files
   * are XOR-scrambled so download managers cannot detect a media stream; the
   * player fetches and decodes them into a `video/mp4` blob. */
  video?: string
  /** Poster frame shown before the video starts. */
  poster?: string
}

export const trainingTopics: TrainingTopic[] = [
  {
    id: 'welcome',
    title: 'Welcome to PicDrop + HopNgo',
    duration: '2 min',
    summary: 'How the partner app fits into your working day.',
    points: [
      'Go online only when you are ready to take requests.',
      'Each request shows the pickup, drop, distance and your earnings.',
      'Your application, earnings and history stay in this app.',
    ],
    video: '/training/welcome-picdrop-hopngo.bin',
    poster: '/training/welcome-picdrop-hopngo-poster.png',
  },
  {
    id: 'accepting',
    title: 'How to Accept Delivery Orders',
    duration: '3 min',
    summary: 'What to check before you accept a request.',
    points: [
      'Check the pickup distance, drop location and offer time limit.',
      'Accept only when you can reach the pickup on time.',
      'Decline with a reason when the job does not suit you.',
    ],
    video: '/training/accept-orders.bin',
    poster: '/training/accept-orders-poster.png',
  },
  {
    id: 'process',
    title: 'Pickup & Delivery Process',
    duration: '4 min',
    summary: 'The six steps from pickup to handover.',
    points: [
      'Mark your arrival at the pickup and confirm the item count.',
      'Update every stage so the customer can follow the progress.',
      'Close the delivery with the customer code at the drop.',
    ],
    video: '/training/pickup-delivery.bin',
    poster: '/training/pickup-delivery-poster.png',
  },
  {
    id: 'customer',
    title: 'Customer Interaction Guidelines',
    duration: '2 min',
    summary: 'Simple habits that keep customers informed and calm.',
    points: [
      "Use the app's contact action instead of sharing your number.",
      'Keep the package sealed and handle it carefully.',
      'Stay polite, and contact support instead of arguing.',
    ],
    video: '/training/customer-guidelines.bin',
    poster: '/training/customer-guidelines-poster.png',
  },
  {
    id: 'safety',
    title: 'Delivery Safety & Best Practices',
    duration: '3 min',
    summary: 'Ride safe and protect the order in every weather.',
    points: [
      'Wear a helmet and follow traffic rules at all times.',
      'Keep cash collections separate from your own money.',
      'Report accidents or unsafe situations through Support.',
    ],
    video: '/training/safety-practices.bin',
    poster: '/training/safety-practices-poster.png',
  },
]

export const onboardingSteps = [
  { id: 'personal', label: 'Personal' },
  { id: 'kyc', label: 'KYC' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'training', label: 'Training' },
  { id: 'review', label: 'Review' },
]
