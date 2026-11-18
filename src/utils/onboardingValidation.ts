import type { OnboardingState } from '../types/onboarding'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PINCODE_PATTERN = /^\d{6}$/
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/
const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/
const LICENCE_PATTERN = /^[A-Z]{2}[- ]?\d{2}[- ]?\d{4}[- ]?\d{7}$/
const REGISTRATION_PATTERN =
  /^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,2}[- ]?\d{4}$/i

/**
 * Validates one wizard step. Shared by the onboarding screen and by the local
 * application recovery path, so both apply exactly the same requirements.
 */
export function validateStep(step: number, state: OnboardingState): string {
  switch (step) {
    case 0:
      if (state.fullName.trim().length < 3) {
        return 'Enter your full name as it appears on your documents.'
      }
      if (!EMAIL_PATTERN.test(state.email)) {
        return 'Enter a valid email address.'
      }
      if (!state.dateOfBirth) {
        return 'Enter your date of birth.'
      }

      const dateOfBirth = new Date(`${state.dateOfBirth}T00:00:00`)
      if (Number.isNaN(dateOfBirth.getTime())) {
        return 'Enter a valid date of birth.'
      }

      const today = new Date()
      if (dateOfBirth > today) {
        return 'Date of birth cannot be in the future.'
      }

      let age = today.getFullYear() - dateOfBirth.getFullYear()
      const monthDelta = today.getMonth() - dateOfBirth.getMonth()
      if (
        monthDelta < 0 ||
        (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())
      ) {
        age -= 1
      }

      if (age < 18) {
        return 'You must be at least 18 years old to deliver with Fafo.'
      }
      if (!state.city.trim()) {
        return 'Enter your city.'
      }
      if (state.addressLine.trim().length < 8) {
        return 'Enter your current address.'
      }
      if (!PINCODE_PATTERN.test(state.pincode)) {
        return 'Enter a 6-digit PIN code.'
      }
      return ''
    case 1: {
      if (!/^\d{12}$/.test(state.documentNumbers.aadhaar)) {
        return 'Enter a valid 12-digit Aadhaar number.'
      }
      if (!PAN_PATTERN.test(state.documentNumbers.pan)) {
        return 'Enter a valid 10-character PAN number.'
      }

      if (state.bank.accountHolder.trim().length < 3) {
        return "Enter the account holder's name."
      }
      if (!/^\d{9,18}$/.test(state.bank.accountNumber)) {
        return 'Enter a valid bank account number.'
      }
      if (!IFSC_PATTERN.test(state.bank.ifsc)) {
        return 'Enter a valid IFSC code, for example HDFC0001234.'
      }
      return ''
    }
    case 2: {
      const needsRegistration =
        state.vehicle.type === 'bike' || state.vehicle.type === 'scooter'

      if (state.vehicle.type !== 'foot' && !state.vehicle.model.trim()) {
        return 'Enter your vehicle model.'
      }
      if (
        needsRegistration &&
        !LICENCE_PATTERN.test(state.documentNumbers.licence)
      ) {
        return 'Enter a valid driving licence number.'
      }
      if (
        needsRegistration &&
        !REGISTRATION_PATTERN.test(state.vehicle.registrationNumber)
      ) {
        return 'Enter a valid registration number, for example WB02AB1234.'
      }
      return ''
    }
    case 3:
      if (state.training.some((completed) => !completed)) {
        return 'Complete every training topic to continue.'
      }
      return ''
    default:
      return ''
  }
}

/** True when every mandatory field on all four data steps is valid. */
export function isCompleteApplication(state: OnboardingState): boolean {
  return [0, 1, 2, 3].every((step) => validateStep(step, state) === '')
}
