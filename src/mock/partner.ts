import type { Partner } from '../types/partner'

/**
 * Signed-in partner used until authentication and Firestore are connected.
 * Replace this with the authenticated partner document in Phase 2.
 */
export const currentPartner: Partner = {
  id: 'FDP-10248',
  fullName: 'Aparup Das',
  phone: '+91 98329 79005',
  email: 'aparup.das@example.com',
  city: 'Kolkata',
  avatarUrl: null,
  vehicleType: 'scooter',
  rating: 4.8,
  status: 'pending',
  joinedOn: '2026-10-12',
}
