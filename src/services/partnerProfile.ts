import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import type { OnboardingState } from '../types/onboarding'

export interface PartnerDetailUpdate {
  email: string
  addressLine: string
  city: string
  pincode: string
  vehicle: OnboardingState['vehicle']
}

/**
 * Saves the details a partner may change after onboarding. Email and address
 * live on `partners/{uid}`; vehicle details have their own document. Both
 * writes are in one batch so an address/vehicle mismatch cannot be committed.
 *
 * Verified identity fields (name, mobile number, KYC numbers, bank details)
 * are deliberately not part of this update.
 */
export async function updatePartnerDetails(
  uid: string,
  details: PartnerDetailUpdate,
): Promise<void> {
  if (!db || !uid || uid.startsWith('demo:')) {
    return
  }

  const now = new Date().toISOString()
  const batch = writeBatch(db)

  batch.update(doc(db, 'partners', uid), {
    // The rules require partnerId to stay equal to the authenticated UID.
    partnerId: uid,
    email: details.email,
    addressLine: details.addressLine,
    city: details.city,
    pincode: details.pincode,
    vehicleType: details.vehicle.type,
    updatedAt: now,
  })

  batch.update(doc(db, 'vehicles', uid), {
    partnerId: uid,
    type: details.vehicle.type,
    model: details.vehicle.model.trim(),
    colour: details.vehicle.colour.trim(),
    registrationNumber: details.vehicle.registrationNumber.trim(),
    updatedAt: now,
  })

  await batch.commit()
}
