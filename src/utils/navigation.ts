import type { DeliveryStop } from '../types/delivery'

/**
 * External turn-by-turn navigation for a stop's coordinates. Google Maps
 * handles the actual routing; the in-app map stays on OpenStreetMap tiles.
 */
export function navigationUrl(stop: DeliveryStop): string {
  const latitude = Number(stop.latitude)
  const longitude = Number(stop.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return 'https://www.google.com/maps'
  }

  return (
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent(`${latitude},${longitude}`) +
    '&travelmode=driving&dir_action=navigate'
  )
}
