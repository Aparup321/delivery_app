import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  hint?: string
}

export function StatCard({ icon: Icon, value, label, hint }: StatCardProps) {
  return (
    <div className="rounded-card border border-line/80 bg-surface p-3.5 shadow-card">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-deep">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-2 text-[17px] font-bold leading-tight text-ink">
        {value}
      </p>
      <p className="text-[11.5px] leading-snug text-ink-muted">{label}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
}
