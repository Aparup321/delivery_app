export interface MapPreviewProps {
  pickup: string
  destination: string
}

/**
 * Illustrative route view. Replace with the chosen map provider in Phase 9;
 * no map tiles or API keys are used yet.
 */
export function MapPreview({ pickup, destination }: MapPreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#f1eef8]">
      <div className="relative">
        <svg
          viewBox="0 0 320 150"
          className="h-36 w-full"
          role="img"
          aria-label={`Demo route preview from ${pickup} to ${destination}`}
        >
          <rect width="320" height="150" fill="#f1eef8" />
          <g stroke="#e2dbf1" strokeWidth="10" strokeLinecap="round">
            <path d="M-10 38H330" />
            <path d="M-10 108H330" />
            <path d="M62 -10V160" />
            <path d="M198 -10V160" />
            <path d="M268 -10V160" />
          </g>
          <g stroke="#ffffff" strokeWidth="2.5" strokeDasharray="7 9">
            <path d="M-10 38H330" />
            <path d="M-10 108H330" />
          </g>
          <path
            d="M40 118 L80 118 L80 78 L150 78 L150 52 L252 52"
            fill="none"
            stroke="#713ce0"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="118" r="8" fill="#12a150" stroke="#ffffff" strokeWidth="3" />
          <circle cx="252" cy="52" r="8" fill="#e0413e" stroke="#ffffff" strokeWidth="3" />
        </svg>
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold text-ink-muted">
          Demo route
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface px-3 py-2 text-[11px] text-ink-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-success" />
          <span className="truncate">{pickup}</span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-danger" />
          <span className="truncate">{destination}</span>
        </span>
      </div>
    </div>
  )
}
