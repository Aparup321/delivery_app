import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import type { OnboardingStatus } from '../../types/onboarding'
import {
  applicationStageIndex,
  applicationStatusMeta,
} from '../../utils/applicationStatus'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'

const previewStatuses: OnboardingStatus[] = [
  'submitted',
  'under_review',
  'approved',
  'rejected',
]

export function ApplicationStatusPage() {
  const navigate = useNavigate()
  const { onboarding, setApplicationStatus } = useApp()
  const status = applicationStatusMeta[onboarding.status]
  const currentStage = applicationStageIndex[onboarding.status]
  const isRejected = onboarding.status === 'rejected'

  const stages = [
    {
      label: 'Pending',
      description: 'Application started',
    },
    {
      label: 'Submitted',
      description: 'Details and documents received',
    },
    {
      label: 'Under review',
      description: 'Verification team checks your documents',
    },
    {
      label:
        onboarding.status === 'approved'
          ? 'Approved'
          : onboarding.status === 'rejected'
            ? 'Rejected'
            : 'Decision',
      description:
        onboarding.status === 'approved'
          ? 'Account ready for deliveries'
          : onboarding.status === 'rejected'
            ? 'Application not approved'
            : 'Approval or rejection',
    },
  ]

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Application status"
        subtitle="Partner verification"
        showBack
        backTo="/profile"
      />

      <div className="space-y-4 px-4 pt-5">
        <Card padding="lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11.5px] font-medium text-ink-muted">
                Current status
              </p>
              <h2 className="mt-1 text-[20px] font-semibold text-ink">
                {status.label}
              </h2>
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>

          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
            {status.description}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
            <div>
              <dt className="text-[11px] text-ink-muted">Submitted</dt>
              <dd className="mt-0.5 text-[12.5px] font-medium text-ink">
                {onboarding.submittedAt
                  ? formatDate(onboarding.submittedAt)
                  : 'Not yet'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-muted">Last update</dt>
              <dd className="mt-0.5 text-[12.5px] font-medium text-ink">
                {onboarding.statusUpdatedAt
                  ? formatDate(onboarding.statusUpdatedAt)
                  : '—'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card padding="lg">
          <h2 className="text-[15px] font-semibold text-ink">Progress</h2>

          <ol className="mt-4">
            {stages.map((stage, index) => {
              const isComplete = index < currentStage
              const isCurrent = index === currentStage
              const isLast = index === stages.length - 1

              return (
                <li key={stage.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-full border',
                        isComplete && 'border-brand-deep bg-brand-deep text-white',
                        isCurrent &&
                          !isRejected &&
                          'border-brand-deep bg-surface text-brand-deep',
                        isCurrent &&
                          isRejected &&
                          'border-danger bg-surface text-danger',
                        !isComplete &&
                          !isCurrent &&
                          'border-line bg-surface text-ink-soft',
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-3" aria-hidden="true" />
                      ) : (
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            isCurrent ? 'bg-current' : 'bg-ink-soft',
                          )}
                        />
                      )}
                    </span>
                    {!isLast ? (
                      <span
                        className={cn(
                          'my-1 w-px flex-1',
                          isComplete ? 'bg-brand/40' : 'bg-line',
                        )}
                      />
                    ) : null}
                  </div>

                  <div className={cn('min-w-0', !isLast && 'pb-5')}>
                    <p
                      className={cn(
                        'text-[12.5px] font-medium',
                        isCurrent ? 'text-ink' : 'text-ink-muted',
                      )}
                    >
                      {stage.label}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                      {stage.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>

        {isRejected ? (
          <Card padding="md" className="border-danger/30 bg-danger-soft">
            <p className="text-[12.5px] font-semibold text-danger">
              Application not approved
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
              Contact support to understand what needs to change before you
              apply again.
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => navigate('/support')}
            >
              Contact support
            </Button>
          </Card>
        ) : null}

        <details className="rounded-card border border-line bg-surface px-4 py-3">
          <summary className="cursor-pointer list-none text-[12px] font-medium text-ink-muted">
            Preview another status (demo)
          </summary>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
            No verification service is connected in this prototype. Use these
            to preview each stage.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {previewStatuses.map((preview) => (
              <Button
                key={preview}
                size="sm"
                variant={onboarding.status === preview ? 'secondary' : 'outline'}
                onClick={() => setApplicationStatus(preview)}
              >
                {applicationStatusMeta[preview].label}
              </Button>
            ))}
          </div>
        </details>

        <p className="px-1 text-center text-[11px] leading-relaxed text-ink-soft">
          Status is demo data until the verification service is connected.
        </p>
      </div>
    </div>
  )
}
