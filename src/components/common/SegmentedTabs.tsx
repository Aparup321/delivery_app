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
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 rounded-xl border border-line bg-canvas p-1"
    >
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
              'flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-[12px] font-medium transition-colors',
              isActive
                ? 'bg-surface text-ink'
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
