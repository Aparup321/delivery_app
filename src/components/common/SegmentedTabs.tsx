import { cn } from '../../utils/cn'

export interface SegmentedTab {
  id: string
  label: string
  count?: number
}

export interface SegmentedTabsProps {
  items: SegmentedTab[]
  value: string
  onChange: (id: string) => void
  label: string
}

export function SegmentedTabs({
  items,
  value,
  onChange,
  label,
}: SegmentedTabsProps) {
  const count = Math.max(1, items.length)
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value),
  )
  const pillWidth = `calc((100% - 8px - ${(count - 1) * 4}px) / ${count})`
  const pillOffset = `calc(${activeIndex} * (100% + 4px))`

  return (
    <div
      role="tablist"
      aria-label={label}
      className="relative flex gap-1 rounded-xl border border-line bg-canvas p-1"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-lg bg-surface shadow-card transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ width: pillWidth, transform: `translateX(${pillOffset})` }}
      />

      {items.map((item) => {
        const isActive = item.id === value

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative z-10 flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-[12px] font-medium transition-colors',
              isActive
                ? 'text-ink'
                : 'text-ink-muted hover:text-brand-deep',
            )}
          >
            {item.label}
            {item.count !== undefined ? ` (${item.count})` : ''}
          </button>
        )
      })}
    </div>
  )
}
