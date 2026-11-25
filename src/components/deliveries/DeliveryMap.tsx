import { useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
import { Crosshair } from 'lucide-react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../../context/language'
import type { DeliveryLocation, DeliveryStop } from '../../types/delivery'
import { isValidCoordinate } from '../../utils/geo'

/**
 * OSM-compatible tiles. The public OpenStreetMap servers have no production
 * SLA; point VITE_MAP_TILE_URL at a dedicated tile service for real traffic.
 */
const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

/**
 * Route geometry provider. OSRM's public demo server is the default and can be
 * swapped through VITE_ROUTE_API_BASE without touching this component.
 */
const ROUTE_API_BASE =
  import.meta.env.VITE_ROUTE_API_BASE ?? 'https://router.project-osrm.org'

const routeCache = new Map<string, [number, number][] | null>()

interface MapPoint {
  latitude: number
  longitude: number
}

function pointKey(point: MapPoint): string {
  return `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`
}

function routeKey(from: MapPoint, to: MapPoint): string {
  return `${pointKey(from)}|${pointKey(to)}`
}

/** Fetched once per origin/destination pair; failures are cached briefly. */
async function fetchRoute(
  from: MapPoint,
  to: MapPoint,
  signal: AbortSignal,
): Promise<[number, number][] | null> {
  const key = routeKey(from, to)

  if (routeCache.has(key)) {
    return routeCache.get(key) ?? null
  }

  const url =
    `${ROUTE_API_BASE}/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson`

  try {
    const response = await fetch(url, { signal })

    if (!response.ok) {
      return null
    }

    const payload: unknown = await response.json()
    const coordinates =
      typeof payload === 'object' && payload !== null
        ? (payload as { routes?: Array<{ geometry?: { coordinates?: unknown } }> })
            .routes?.[0]?.geometry?.coordinates
        : undefined

    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return null
    }

    const line = coordinates.flatMap((item): [number, number][] => {
      if (!Array.isArray(item) || item.length < 2) {
        return []
      }

      const longitude = Number(item[0])
      const latitude = Number(item[1])

      return isValidCoordinate(latitude, longitude)
        ? [[latitude, longitude]]
        : []
    })

    const route = line.length >= 2 ? line : null
    routeCache.set(key, route)
    return route
  } catch {
    return null
  }
}

type RouteState = 'idle' | 'loading' | 'ready' | 'unavailable'

function useRoute(from: MapPoint | null, to: MapPoint | null) {
  const [fetched, setFetched] = useState<{
    key: string
    route: [number, number][] | null
  } | null>(null)

  useEffect(() => {
    if (!from || !to) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    void fetchRoute(from, to, controller.signal).then((route) => {
      if (!cancelled) {
        setFetched({ key: routeKey(from, to), route })
      }
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [from, to])

  // The cache is checked synchronously so a known pair renders its route
  // without waiting for the effect.
  if (!from || !to) {
    return { route: null, state: 'idle' as RouteState }
  }

  const key = routeKey(from, to)
  const cached = routeCache.get(key)

  if (cached !== undefined) {
    return {
      route: cached,
      state: (cached ? 'ready' : 'unavailable') as RouteState,
    }
  }

  if (fetched && fetched.key === key) {
    return {
      route: fetched.route,
      state: (fetched.route ? 'ready' : 'unavailable') as RouteState,
    }
  }

  return { route: null, state: 'loading' as RouteState }
}

function pickupIcon() {
  return L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html:
      '<span class="grid size-[26px] place-items-center rounded-full ' +
      'border-[3px] border-white bg-success shadow-md">' +
      '<span class="size-2 rounded-full bg-white"></span></span>',
  })
}

function dropIcon() {
  return L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html:
      '<span class="grid size-[26px] place-items-center rounded-full ' +
      'border-[3px] border-white bg-danger shadow-md">' +
      '<span class="size-2 rounded-full bg-white"></span></span>',
  })
}

function partnerIcon() {
  return L.divIcon({
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html:
      '<span class="relative grid place-items-center">' +
      '<span class="absolute size-[22px] animate-ping rounded-full bg-brand/40"></span>' +
      '<span class="size-[18px] rounded-full border-[3px] border-white ' +
      'bg-brand shadow-md"></span></span>',
  })
}

/**
 * Fits the map once per delivery/focus change. Partner GPS updates must not
 * refit the map every few seconds or the view jumps while the partner moves.
 */
function MapFocus({
  points,
  focusKey,
}: {
  points: [number, number][]
  focusKey: string
}) {
  const map = useMap()
  const pointsRef = useRef(points)

  useEffect(() => {
    pointsRef.current = points
  }, [points])

  useEffect(() => {
    const current = pointsRef.current

    if (current.length === 0) {
      return
    }

    if (current.length === 1) {
      map.setView(current[0], 15)
      return
    }

    map.fitBounds(L.latLngBounds(current).pad(0.3))
  }, [focusKey, map])

  return null
}

/** Pans to each new fix only while the partner has opted into follow mode. */
function FollowPartner({
  point,
  follow,
}: {
  point: [number, number] | null
  follow: boolean
}) {
  const map = useMap()
  const latitude = point?.[0]
  const longitude = point?.[1]

  useEffect(() => {
    if (follow && latitude !== undefined && longitude !== undefined) {
      map.panTo([latitude, longitude], { animate: true })
    }
  }, [follow, latitude, longitude, map])

  return null
}

export interface DeliveryMapProps {
  pickup: DeliveryStop
  destination: DeliveryStop
  /** The partner's live position, when GPS sharing is active. */
  partnerLocation?: DeliveryLocation | null
  /** Which leg to emphasise: partner→pickup before pickup, partner→drop after. */
  focus?: 'pickup' | 'destination'
  /** Accessible description of the map contents. */
  ariaLabel?: string
}

/**
 * Interactive OpenStreetMap for a delivery: pickup and drop markers, the
 * partner's live position, route geometry from the configured routing
 * provider, and a recentre control. Coordinates are validated first — a
 * delivery without usable coordinates shows a clear unavailable state instead
 * of a wrong map.
 */
export function DeliveryMap({
  pickup,
  destination,
  partnerLocation,
  focus = 'pickup',
  ariaLabel,
}: DeliveryMapProps) {
  const { t } = useLanguage()
  const mapRef = useRef<L.Map | null>(null)
  const [follow, setFollow] = useState(false)

  const pickupPoint = useMemo(
    () =>
      isValidCoordinate(pickup.latitude, pickup.longitude)
        ? { latitude: pickup.latitude, longitude: pickup.longitude }
        : null,
    [pickup.latitude, pickup.longitude],
  )
  const destinationPoint = useMemo(
    () =>
      isValidCoordinate(destination.latitude, destination.longitude)
        ? { latitude: destination.latitude, longitude: destination.longitude }
        : null,
    [destination.latitude, destination.longitude],
  )
  const partnerPoint = useMemo(
    () =>
      partnerLocation &&
      isValidCoordinate(partnerLocation.latitude, partnerLocation.longitude)
        ? {
          latitude: partnerLocation.latitude,
          longitude: partnerLocation.longitude,
        }
        : null,
    [partnerLocation],
  )

  // Before pickup the route leads to the shop; afterwards it leads to the
  // customer. Without a partner fix the planned pickup→drop route is shown.
  const routeTarget = focus === 'pickup' ? pickupPoint : destinationPoint
  const routeFrom = partnerPoint ?? pickupPoint
  const { route, state: routeState } = useRoute(
    routeFrom && routeTarget && pointKey(routeFrom) !== pointKey(routeTarget)
      ? routeFrom
      : null,
    routeTarget,
  )

  const visiblePoints = useMemo(() => {
    const points: [number, number][] = []
    if (partnerPoint) {
      points.push([partnerPoint.latitude, partnerPoint.longitude])
    }
    if (pickupPoint) {
      points.push([pickupPoint.latitude, pickupPoint.longitude])
    }
    if (destinationPoint) {
      points.push([destinationPoint.latitude, destinationPoint.longitude])
    }
    return points
  }, [partnerPoint, pickupPoint, destinationPoint])

  const focusKey = [
    pickup.name,
    destination.name,
    pickupPoint?.latitude ?? '',
    pickupPoint?.longitude ?? '',
    destinationPoint?.latitude ?? '',
    destinationPoint?.longitude ?? '',
    focus,
  ].join('|')

  if (!pickupPoint && !destinationPoint) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-line bg-brand-tint px-6 text-center">
        <p className="text-[12px] font-medium text-ink-muted">
          {t(
            'Location unavailable for this delivery. Check back after dispatch updates the addresses.',
          )}
        </p>
      </div>
    )
  }

  const partnerValid = partnerPoint !== null

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="relative h-56 w-full bg-[#e8eef2]">
        <MapContainer
          ref={mapRef}
          center={
            pickupPoint
              ? [pickupPoint.latitude, pickupPoint.longitude]
              : [22.5726, 88.3639]
          }
          zoom={14}
          className="size-full"
          scrollWheelZoom={false}
          attributionControl
          aria-label={
            ariaLabel ??
            t('Map showing {pickup} to {destination}', {
              pickup: pickup.name,
              destination: destination.name,
            })
          }
        >
          <TileLayer
            url={TILE_URL}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          />

          {pickupPoint ? (
            <Marker
              position={[pickupPoint.latitude, pickupPoint.longitude]}
              icon={pickupIcon()}
              alt={t('Pickup: {name}', { name: pickup.name })}
            />
          ) : null}

          {destinationPoint ? (
            <Marker
              position={[destinationPoint.latitude, destinationPoint.longitude]}
              icon={dropIcon()}
              alt={t('Drop: {name}', { name: destination.name })}
            />
          ) : null}

          {partnerPoint ? (
            <Marker
              position={[partnerPoint.latitude, partnerPoint.longitude]}
              icon={partnerIcon()}
              alt={t('Your current location')}
            />
          ) : null}

          {route ? (
            <Polyline
              positions={route}
              pathOptions={{
                color: '#713CE0',
                weight: 4,
                opacity: 0.85,
                lineJoin: 'round',
              }}
            />
          ) : null}

          <MapFocus points={visiblePoints} focusKey={focusKey} />
          <FollowPartner
            point={
              partnerPoint
                ? [partnerPoint.latitude, partnerPoint.longitude]
                : null
            }
            follow={follow}
          />
        </MapContainer>

        <button
          type="button"
          onClick={() => {
            const map = mapRef.current
            if (!map) {
              return
            }

            const next = !follow
            setFollow(next)

            if (partnerPoint) {
              map.setView([partnerPoint.latitude, partnerPoint.longitude], 15, {
                animate: true,
              })
            } else if (!next) {
              map.setZoom(map.getZoom() + 1)
            }
          }}
          aria-pressed={follow}
          className={
            follow
              ? 'absolute right-2 top-2 z-[500] grid size-9 place-items-center rounded-lg border border-brand/30 bg-brand text-white shadow-sm transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
              : 'absolute right-2 top-2 z-[500] grid size-9 place-items-center rounded-lg border border-line bg-white/95 text-[#6E6789] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
          }
          aria-label={t(
            follow ? 'Stop following my location' : 'Follow my location',
          )}
        >
          <Crosshair className="size-4" aria-hidden="true" />
        </button>

        <span className="pointer-events-none absolute bottom-1 right-2 z-[500] rounded bg-white/90 px-1.5 py-0.5 text-[10.5px] font-medium text-[#6E6789]">
          © OpenStreetMap contributors
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface px-3 py-2 text-[11px] text-ink-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-success" />
          <span className="truncate">{pickup.name}</span>
        </span>
        {partnerValid ? (
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand" />
            {t('You')}
          </span>
        ) : null}
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-danger" />
          <span className="truncate">{destination.name}</span>
        </span>
      </div>

      {routeState === 'unavailable' ? (
        <p className="border-t border-line bg-warning-soft px-3 py-1.5 text-[10.5px] font-medium text-warning">
          {t('Route line unavailable right now. Markers still show the locations.')}
        </p>
      ) : null}
    </div>
  )
}
