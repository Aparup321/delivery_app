import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { SectionHeading } from '../common/SectionHeading'
import { ScreenHeader } from './ScreenHeader'

export interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  phase: string
  upcoming: string[]
}

/**
 * Temporary screen for modules scheduled in a later roadmap phase.
 * Replace it with the real module screen when that phase starts.
 */
export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  phase,
  upcoming,
}: ModulePlaceholderProps) {
  const navigate = useNavigate()

  return (
    <div className="pb-8">
      <ScreenHeader title={title} subtitle="Fafo Delivery Partner" />

      <div className="space-y-4 px-4 pt-5">
        <Card padding="lg" className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
            <Icon className="size-7" aria-hidden="true" />
          </span>
          <div className="mt-4 flex justify-center">
            <Badge tone="brand">{phase}</Badge>
          </div>
          <h2 className="mt-3 text-base font-bold text-ink">{title}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {description}
          </p>
        </Card>

        <Card padding="md">
          <SectionHeading title="Planned in this module" />
          <ul className="mt-3 space-y-2.5">
            {upcoming.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-muted"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
          Back to home
        </Button>
      </div>
    </div>
  )
}
