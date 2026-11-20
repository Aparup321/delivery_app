/** Great-circle distance between two coordinates in metres. */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const earthRadiusM = 6_371_000
  const deltaLatitude =
    ((b.latitude - a.latitude) * Math.PI) / 180
  const deltaLongitude =
    ((b.longitude - a.longitude) * Math.PI) / 180
  const latitudeA = (a.latitude * Math.PI) / 180
  const latitudeB = (b.latitude * Math.PI) / 180

  const h =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(deltaLongitude / 2) ** 2

  return 2 * earthRadiusM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * True only for real-looking coordinates. A missing or zeroed point (the
 * placeholder some dispatch systems write) must show the map's
 * location-unavailable state instead of a wrong map.
 */
export function isValidCoordinate(
  latitude: unknown,
  longitude: unknown,
): boolean {
  const lat = typeof latitude === 'number' ? latitude : Number(latitude)
  const lng = typeof longitude === 'number' ? longitude : Number(longitude)

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  )
}
