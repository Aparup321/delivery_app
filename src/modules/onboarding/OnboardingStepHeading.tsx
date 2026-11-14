import type { LucideIcon } from 'lucide-react'
import { IconTile } from '../../components/common/IconTile'

export interface OnboardingStepHeadingProps {
  icon: LucideIcon
  title: string
  subtitle: string
}

export function OnboardingStepHeading({
  icon: Icon,
  title,
  subtitle,
}: OnboardingStepHeadingProps) {
  return (
    <div className="flex items-start gap-3">
      <IconTile>
        <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </IconTile>
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
