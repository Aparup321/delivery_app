import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import { LocateFixed, MapPin, Search } from 'lucide-react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useLanguage } from '../../context/language'
import {
  reverseGeocode,
  searchAddresses,
} from '../../services/geocoding'
import type { AddressSuggestion } from '../../services/geocoding'
import type { OnboardingLocation } from '../../types/onboarding'

const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ??
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

/** Neutral starting view; the pin/search result determines the location. */
const DEFAULT_CENTER: [number, number] = [22.9734, 78.6569]
const SEARCH_DEBOUNCE_MS = 350

function pinIcon() {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html:
      '<span class="grid size-7 place-items-center rounded-full ' +
      'border-[3px] border-white bg-brand shadow-md">' +
      '<span class="size-2 rounded-full bg-white"></span></span>',
  })
}

function MapClickHandler({
  onPick,
}: {
  onPick: (latitude: number, longitude: number) => void
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

/** Moves the view only for search selection or the explicit location action. */
function Recenter({ point }: { point: OnboardingLocation | null }) {
  const map = useMap()

  useEffect(() => {
    if (point) {
      map.flyTo([point.latitude, point.longitude], 16, { duration: 0.6 })
    }
  }, [map, point])

  return null
}

type LookupState = 'idle' | 'loading' | 'done' | 'failed'

export interface AddressMapPickerProps {
  value: OnboardingLocation | null
  onChange: (value: OnboardingLocation) => void
  onAddressResolved: (parts: {
    addressLine?: string
    city?: string
    pincode?: string
  }) => void
  error?: string
}

/**
 * Address search + map for onboarding. Typing a place or landmark shows
 * Photon suggestions; choosing one (or tapping/dragging the pin) fills the
 * address fields and stores the coordinates. Geolocation is optional.
 */
export function AddressMapPicker({
  value,
  onChange,
  onAddressResolved,
  error,
}: AddressMapPickerProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [lookup, setLookup] = useState<LookupState>('idle')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [focusPoint, setFocusPoint] = useState<OnboardingLocation | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Suppresses the debounce search right after a suggestion is chosen.
  const skipSearchRef = useRef(false)

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false
      return
    }

    const trimmed = query.trim()

    if (trimmed.length < 3) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setIsSearching(true)

      void searchAddresses(trimmed, controller.signal).then((results) => {
        if (controller.signal.aborted) {
          return
        }

        setSuggestions(results)
        setIsSearching(false)
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    [],
  )

  function resolveAddress(
    latitude: number,
    longitude: number,
    known?: AddressSuggestion,
  ) {
    onChange({ latitude, longitude })
    setFocusPoint({ latitude, longitude })

    if (known) {
      onAddressResolved({
        addressLine: known.addressLine || undefined,
        city: known.city || undefined,
        pincode: known.pincode || undefined,
      })
      setLookup('done')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLookup('loading')

    void reverseGeocode(latitude, longitude, controller.signal).then(
      (address) => {
        if (controller.signal.aborted) {
          return
        }

        if (!address) {
          setLookup('failed')
          return
        }

        onAddressResolved({
          addressLine: address.addressLine || undefined,
          city: address.city || undefined,
          pincode: address.pincode || undefined,
        })
        setLookup('done')
      },
    )
  }

  function selectSuggestion(suggestion: AddressSuggestion) {
    skipSearchRef.current = true
    setQuery(suggestion.label)
    setSuggestions([])
    setIsSearching(false)
    resolveAddress(suggestion.latitude, suggestion.longitude, suggestion)
  }

  function useCurrentLocation() {
    setLocationError('')

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('This device cannot share its location')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolveAddress(
          position.coords.latitude,
          position.coords.longitude,
        )
        setLocating(false)
      },
      () => {
        setLocationError(
          'Location permission was not granted. Tap the map to pin your address instead.',
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : DEFAULT_CENTER

  return (
    <div>
      <div className="relative z-[1100]">
        <Input
          label={t('Search your address')}
          placeholder={t('Area, street or landmark')}
          value={query}
          leftIcon={<Search className="size-4" aria-hidden="true" />}
          autoComplete="off"
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)

            if (next.trim().length < 3) {
              setSuggestions([])
              setIsSearching(false)
            }
          }}
        />

        {query.trim().length >= 3 &&
        (isSearching || suggestions.length > 0) ? (
          <div className="absolute inset-x-0 top-full z-[600] mt-1 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            {isSearching && suggestions.length === 0 ? (
              <p className="px-3 py-2.5 text-[11.5px] text-ink-muted">
                {t('Searching…')}
              </p>
            ) : (
              <ul role="listbox" aria-label={t('Address suggestions')}>
                {suggestions.map((suggestion) => (
                  <li key={`${suggestion.latitude},${suggestion.longitude}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => selectSuggestion(suggestion)}
                      className="flex w-full items-start gap-2 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-brand-tint focus-visible:bg-brand-tint focus-visible:outline-none"
                    >
                      <MapPin
                        className="mt-0.5 size-3.5 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 text-[11.5px] leading-relaxed text-ink">
                        {suggestion.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="mb-2 mt-3 flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink">
          {t('Pin your address on the map')}
        </p>
        <Button
          size="sm"
          variant="outline"
          isLoading={locating}
          leftIcon={<LocateFixed className="size-3.5" aria-hidden="true" />}
          onClick={useCurrentLocation}
        >
          {t('Use my location')}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="h-44 w-full bg-canvas">
          <MapContainer
            center={center}
            zoom={value ? 16 : 4}
            className="size-full"
            scrollWheelZoom={false}
            aria-label={t('Map to pin your delivery address')}
          >
            <TileLayer
              url={TILE_URL}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            />
            <MapClickHandler onPick={(lat, lng) => resolveAddress(lat, lng)} />
            <Recenter point={focusPoint} />
            {value ? (
              <Marker
                draggable
                position={[value.latitude, value.longitude]}
                icon={pinIcon()}
                alt={t('Your pinned address')}
                eventHandlers={{
                  dragend(event) {
                    const point = (event.target as L.Marker).getLatLng()
                    resolveAddress(point.lat, point.lng)
                  },
                }}
              />
            ) : null}
          </MapContainer>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
        {lookup === 'loading'
          ? t('Looking up the address…')
          : lookup === 'done'
            ? t('Address filled from the map. You can edit it above.')
            : lookup === 'failed'
              ? t('Could not look up the address. Fill it in above.')
              : t(
                  'Search an address, tap the map or drag the pin to mark your address.',
                )}
      </p>

      {locationError ? (
        <p role="alert" className="mt-1 text-[11px] font-medium text-danger">
          {t(locationError)}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-1 text-[11px] font-medium text-danger">
          {t(error)}
        </p>
      ) : null}
    </div>
  )
}
