import { useLanguage } from '../../context/language'
import type { DeliveryStop } from '../../types/delivery'

const TILE_SIZE = 256

export interface MapPreviewProps {
  pickup: DeliveryStop
  destination: DeliveryStop
}

interface Point {
  x: number
  y: number
}

/** Web Mercator projection in world pixels at a fixed zoom. */
function project(latitude: number, longitude: number, zoom: number): Point {
  const scale = TILE_SIZE * 2 ** zoom

  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log(
          (1 + Math.sin((latitude * Math.PI) / 180)) /
            (1 - Math.sin((latitude * Math.PI) / 180)),
        ) /
          (4 * Math.PI)) *
      scale,
  }
}

function getZoom(pickup: DeliveryStop, destination: DeliveryStop): number {
  const span = Math.max(
    Math.abs(pickup.latitude - destination.latitude),
    Math.abs(pickup.longitude - destination.longitude),
  )

  if (span > 0.09) {
    return 11
  }

  if (span > 0.02) {
    return 12
  }

  return 13
}

/**
 * Small, non-interactive OpenStreetMap preview for the active delivery.
 * Routing, live traffic and ETA remain mock data; the tiles and markers are
 * positioned from the pickup and destination coordinates.
 */
export function MapPreview({ pickup, destination }: MapPreviewProps) {
  const { t } = useLanguage()
  const zoom = getZoom(pickup, destination)
  const centerLatitude = (pickup.latitude + destination.latitude) / 2
  const centerLongitude = (pickup.longitude + destination.longitude) / 2
  const center = project(centerLatitude, centerLongitude, zoom)
  const pickupPoint = project(pickup.latitude, pickup.longitude, zoom)
  const destinationPoint = project(destination.latitude, destination.longitude, zoom)
  const centerTileX = Math.floor(center.x / TILE_SIZE)
  const centerTileY = Math.floor(center.y / TILE_SIZE)

  const tiles = [-1, 0, 1].flatMap((offsetY) =>
    [-1, 0, 1].map((offsetX) => {
      const x = centerTileX + offsetX
      const y = centerTileY + offsetY

      return {
        key: `${zoom}-${x}-${y}`,
        src: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
        left: x * TILE_SIZE - center.x,
        top: y * TILE_SIZE - center.y,
      }
    }),
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#e8eef2]">
      <div
        className="relative h-36 w-full overflow-hidden"
        role="img"
        aria-label={t('Map showing {pickup} to {destination}', {
          pickup: pickup.name,
          destination: destination.name,
        })}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              left: `calc(50% + ${tile.left}px)`,
              top: `calc(50% + ${tile.top}px)`,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        ))}

        <span
          className="pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-success shadow-sm"
          style={{
            left: `calc(50% + ${pickupPoint.x - center.x}px)`,
            top: `calc(50% + ${pickupPoint.y - center.y}px)`,
          }}
        />
        <span
          className="pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-danger shadow-sm"
          style={{
            left: `calc(50% + ${destinationPoint.x - center.x}px)`,
            top: `calc(50% + ${destinationPoint.y - center.y}px)`,
          }}
        />

        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold text-ink-muted">
          {t('OpenStreetMap')}
        </span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-1 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-muted hover:underline"
        >
          © OpenStreetMap contributors
        </a>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface px-3 py-2 text-[11px] text-ink-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-success" />
          <span className="truncate">{pickup.name}</span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-danger" />
          <span className="truncate">{destination.name}</span>
        </span>
      </div>
    </div>
  )
}
