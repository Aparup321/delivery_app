import type { BadgeTone } from '../components/common/Badge'
import type { OnboardingStatus } from '../types/onboarding'

export interface ApplicationStatusMeta {
  label: string
  tone: BadgeTone
  headline: string
  description: string
}

export const applicationStatusMeta: Record<
  OnboardingStatus,
  ApplicationStatusMeta
> = {
  draft: {
    label: 'Pending',
    tone: 'warning',
    headline: 'Application pending',
    description: 'Finish your partner setup and submit it for verification.',
  },
  submitted: {
    label: 'Submitted',
    tone: 'info',
    headline: 'Application submitted',
    description:
      'We received your details and documents. Verification starts next.',
  },
  under_review: {
    label: 'Under review',
    tone: 'warning',
    headline: 'Application under review',
    description:
      'The verification team is checking your documents. This usually takes one working day.',
  },
  approved: {
    label: 'Approved',
    tone: 'success',
    headline: 'Application approved',
    description:
      'Your partner account is approved. You can go online and receive delivery requests.',
  },
  rejected: {
    label: 'Rejected',
    tone: 'danger',
    headline: 'Application rejected',
    description:
      'Your application was not approved. Review the reason and contact support to continue.',
  },
}

/** Position in the four-step tracker: pending, submitted, review, decision. */
export const applicationStageIndex: Record<OnboardingStatus, number> = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  approved: 3,
  rejected: 3,
}
