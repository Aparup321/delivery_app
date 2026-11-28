/**
 * Address search and reverse geocoding for the onboarding map.
 *
 * Defaults to Photon (photon.komoot.io), an OpenStreetMap geocoder designed for
 * type-ahead search; it needs no key and supports both `/api?q=` suggestions and
 * `/reverse?lat=&lon=`. Public instances are a demo service without an SLA, so
 * `VITE_GEOCODE_API_BASE` points production at a self-hosted or commercial
 * Photon-compatible provider. Search requests are debounced by the caller.
 */
const GEOCODE_API_BASE = (
  import.meta.env.VITE_GEOCODE_API_BASE ?? 'https://photon.komoot.io'
).replace(/\/$/, '')

export interface GeocodedAddress {
  addressLine: string
  city: string
  pincode: string
}

export interface AddressSuggestion extends GeocodedAddress {
  label: string
  latitude: number
  longitude: number
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function joinParts(parts: Array<string | undefined>, separator = ', '): string {
  return parts.filter((part): part is string => Boolean(part)).join(separator)
}

function toSuggestion(feature: unknown): AddressSuggestion | null {
  const record = asRecord(feature)
  const geometry = asRecord(record.geometry)
  const coordinates = Array.isArray(geometry.coordinates)
    ? geometry.coordinates
    : []
  const longitude = Number(coordinates[0])
  const latitude = Number(coordinates[1])
  const properties = asRecord(record.properties)

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null
  }

  const name = asText(properties.name)
  const street = asText(properties.street)
  const houseNumber = asText(properties.housenumber)
  const city =
    asText(properties.city) ||
    asText(properties.town) ||
    asText(properties.village) ||
    asText(properties.district)
  const state = asText(properties.state)
  const country = asText(properties.country)
  const postcode = asText(properties.postcode).replace(/\D/g, '').slice(0, 6)

  const streetLine = joinParts([street, houseNumber], ' ')
  const addressLine = joinParts(
    [name && name !== city ? name : '', streetLine],
    ', ',
  )
  const label = joinParts(
    [addressLine || name, city, state, country],
    ', ',
  )

  if (!label) {
    return null
  }

  return {
    label,
    addressLine: addressLine || label,
    city,
    pincode: postcode,
    latitude,
    longitude,
  }
}

/** Type-ahead address suggestions. The caller debounces the query. */
export async function searchAddresses(
  query: string,
  signal: AbortSignal,
  limit = 5,
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()

  if (trimmed.length < 3) {
    return []
  }

  const url =
    `${GEOCODE_API_BASE}/api?q=${encodeURIComponent(trimmed)}` +
    `&limit=${limit}&lang=en`

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return []
    }

    const payload = asRecord(await response.json())
    const features = Array.isArray(payload.features) ? payload.features : []

    return features
      .map(toSuggestion)
      .filter((item): item is AddressSuggestion => item !== null)
  } catch {
    return []
  }
}

/** Reverse geocodes a pinned point into the address fields. */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal: AbortSignal,
): Promise<GeocodedAddress | null> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null
  }

  const url =
    `${GEOCODE_API_BASE}/reverse?lat=${latitude}&lon=${longitude}` +
    '&limit=1&lang=en'

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return null
    }

    const payload = asRecord(await response.json())
    const features = Array.isArray(payload.features) ? payload.features : []
    const suggestion = toSuggestion(features[0])

    if (!suggestion) {
      return null
    }

    return {
      addressLine: suggestion.addressLine,
      city: suggestion.city,
      pincode: suggestion.pincode,
    }
  } catch {
    return null
  }
}
