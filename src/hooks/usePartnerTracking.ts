import { useEffect, useRef, useState } from 'react'
import type { PartnerLocation } from '../services/deliverySync'
import { distanceMeters } from '../utils/geo'

/**
 * How the partner's live location sharing is doing. The active-delivery screen
 * shows this so the partner always knows whether dispatch can see them.
 */
export type TrackingStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'paused'
  | 'denied'
  | 'unavailable'
  | 'unsupported'
  | 'error'

export interface PartnerTrackingOptions {
  /** Start watching the partner's GPS position. */
  enabled: boolean
  /** Called with fixes worth publishing to Firestore (throttled). */
  onPublish?: (location: PartnerLocation) => void
}

/** Publish at most every 10 seconds, and always after ~25 m of movement. */
const MIN_PUBLISH_INTERVAL_MS = 10_000
const MIN_PUBLISH_DISTANCE_M = 25
/** Heartbeat so a waiting partner still refreshes at least once a minute. */
const MAX_PUBLISH_INTERVAL_MS = 60_000
/** Fixes worse than this are shown locally but not published. */
const MAX_PUBLISH_ACCURACY_M = 150

/**
 * Live GPS tracking for an active delivery. Wraps `watchPosition`, throttles
 * Firestore-worthy fixes by time and movement, reports a paused state while
 * the document is hidden (browsers stop GPS in background tabs anyway) and
 * always cleans the watcher up when the delivery changes or the component
 * goes away.
 */
export function usePartnerTracking({
  enabled,
  onPublish,
}: PartnerTrackingOptions) {
  const [status, setStatus] = useState<TrackingStatus>('idle')
  const [position, setPosition] = useState<PartnerLocation | null>(null)
  const [wasEnabled, setWasEnabled] = useState(enabled)
  const publishRef = useRef(onPublish)
  const lastPublishRef = useRef<{ location: PartnerLocation; at: number } | null>(
    null,
  )
  const hasFixRef = useRef(false)

  useEffect(() => {
    publishRef.current = onPublish
  }, [onPublish])

  // Reset the sharing state in the same pass the enabled flag changes, so the
  // effect below only ever starts or stops the GPS watcher itself.
  if (wasEnabled !== enabled) {
    setWasEnabled(enabled)
    setStatus(enabled ? 'requesting' : 'idle')

    if (!enabled) {
      setPosition(null)
    }
  }

  const isSupported =
    typeof navigator !== 'undefined' && Boolean(navigator.geolocation)

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (!isSupported) {
      return
    }

    // A new tracking session starts with a clean publish throttle.
    lastPublishRef.current = null
    hasFixRef.current = false

    const isHidden = () =>
      typeof document !== 'undefined' &&
      document.visibilityState === 'hidden'

    const watchId = navigator.geolocation.watchPosition(
      (fix) => {
        const location: PartnerLocation = {
          latitude: fix.coords.latitude,
          longitude: fix.coords.longitude,
          accuracy: Number.isFinite(fix.coords.accuracy)
            ? fix.coords.accuracy
            : null,
          updatedAt: new Date().toISOString(),
        }

        hasFixRef.current = true
        setPosition(location)
        setStatus(isHidden() ? 'paused' : 'active')

        const publish = publishRef.current
        if (!publish) {
          return
        }

        if (
          location.accuracy !== null &&
          location.accuracy > MAX_PUBLISH_ACCURACY_M
        ) {
          // Low-accuracy fixes update the partner's own map but not Firestore.
          return
        }

        const now = Date.now()
        const last = lastPublishRef.current
        const dueByTime = !last || now - last.at >= MAX_PUBLISH_INTERVAL_MS
        const dueByDistance =
          !last ||
          distanceMeters(last.location, location) >= MIN_PUBLISH_DISTANCE_M
        const cooledDown = !last || now - last.at >= MIN_PUBLISH_INTERVAL_MS

        if ((dueByDistance && cooledDown) || dueByTime) {
          lastPublishRef.current = { location, at: now }
          publish(location)
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('unavailable')
        } else {
          // TIMEOUT keeps the watcher alive; the next fix can still arrive.
          setStatus('error')
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 },
    )

    const handleVisibility = () => {
      setStatus((current) => {
        if (current === 'denied' || current === 'unavailable') {
          return current
        }

        if (!hasFixRef.current) {
          return current
        }

        return isHidden() ? 'paused' : 'active'
      })
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled, isSupported])

  // A device without the Geolocation API can never share a position, however
  // the watcher states otherwise.
  const effectiveStatus: TrackingStatus = !enabled
    ? 'idle'
    : !isSupported
      ? 'unsupported'
      : status

  return { status: effectiveStatus, position }
}
