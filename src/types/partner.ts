/** Account state of a delivery partner. */
export type PartnerStatus = 'pending' | 'active' | 'paused'

/** Vehicle a partner uses for deliveries. */
export type VehicleType = 'foot' | 'bicycle' | 'scooter' | 'bike'

/**
 * Delivery partner profile.
 *
 * Mirrors the planned `partners` collection so the mock data can later be
 * replaced by a Firestore document without changing the UI.
 */
export interface Partner {
  id: string
  fullName: string
  phone: string
  email: string
  city: string
  avatarUrl: string | null
  vehicleType: VehicleType
  rating: number
  status: PartnerStatus
  joinedOn: string
}
