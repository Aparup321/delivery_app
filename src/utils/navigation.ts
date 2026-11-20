import type { DeliveryStop } from '../types/delivery'

/**
 * External turn-by-turn navigation for a stop's coordinates. Google Maps
 * handles the actual routing; the in-app map stays on OpenStreetMap tiles.
 */
export function navigationUrl(stop: DeliveryStop): string {
  return (
    'https://www.google.com/maps/dir/?api=1&destination=' +
    `${stop.latitude},${stop.longitude}`
  )
}
