import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, BadgeCheck, Wallet, X } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { IconButton } from '../../components/common/IconButton'
import { IconTile } from '../../components/common/IconTile'
import { Input } from '../../components/common/Input'
import { OtpInput } from '../../components/common/OtpInput'
import { useLanguage } from '../../context/language'
import { useModalFocus } from '../../hooks/useModalFocus'
import { OTP_LENGTH } from '../../mock/auth'
import { DEMO_WITHDRAWAL_OTP } from '../../mock/withdrawals'
import type { WithdrawalRequest } from '../../types/withdrawal'
import { formatCurrency } from '../../utils/format'

const UPI_PATTERN = /^[A-Za-z0-9._-]{2,64}@[A-Za-z]{2,32}$/

interface DialogError {
  key: string
  vars?: Record<string, string | number>
}

type Step = 'form' | 'otp' | 'done'

export interface WithdrawDialogProps {
  available: number
  lastUpiId: string
  isSubmitting: boolean
  submitError: string
  onClose: () => void
  onSubmit: (
    amount: number,
    upiId: string,
  ) => Promise<WithdrawalRequest | null>
}

/**
 * Two-step withdrawal: amount + UPI id, then the demo phone OTP. The UPI id is
 * prefilled from the last request but fully editable, so it can change every
 * time. Success shows the 24-hour credit message and hands back to the earnings
 * screen's status list.
 */
export function WithdrawDialog({
  available,
  lastUpiId,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: WithdrawDialogProps) {
  const { t, locale } = useLanguage()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('form')
  const [amount, setAmount] = useState('')
  const [upiId, setUpiId] = useState(lastUpiId)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<DialogError | null>(null)
  const [requestId, setRequestId] = useState('')

  const close = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  useModalFocus(dialogRef, close)

  const amountValue = Number(amount)
  const canContinue =
    Number.isFinite(amountValue) &&
    amountValue >= 1 &&
    amountValue <= available &&
    UPI_PATTERN.test(upiId.trim())

  function handleContinue() {
    setError(null)

    if (!Number.isFinite(amountValue) || amountValue < 1) {
      setError({ key: 'Enter a valid withdraw amount.' })
      return
    }

    if (amountValue > available) {
      setError({
        key: 'Enter an amount between {min} and {max}.',
        vars: {
          min: formatCurrency(1, locale),
          max: formatCurrency(available, locale),
        },
      })
      return
    }

    if (!UPI_PATTERN.test(upiId.trim())) {
      setError({ key: 'Enter a valid UPI ID, for example name@bank.' })
      return
    }

    setStep('otp')
  }

  async function handleVerify() {
    setError(null)

    if (otp.length !== OTP_LENGTH) {
      setError({
        key: 'Enter the {length}-digit code to continue.',
        vars: { length: OTP_LENGTH },
      })
      return
    }

    if (otp !== DEMO_WITHDRAWAL_OTP) {
      setError({
        key: 'That code is not correct. Check the digits and try again.',
      })
      return
    }

    const request = await onSubmit(amountValue, upiId.trim())

    if (request) {
      setRequestId(request.id)
      setStep('done')
    }
  }

  return createPortal(
    <div
      className="overlay-enter fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3"
      role="presentation"
      onClick={close}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-title"
        className="dialog-enter max-h-[92dvh] w-full max-w-[430px] overflow-y-auto overscroll-contain rounded-2xl bg-surface pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <IconTile size="sm">
              <Wallet className="size-4" aria-hidden="true" />
            </IconTile>
            <div className="min-w-0">
              <h2
                id="withdraw-title"
                className="text-[15px] font-bold tracking-tight text-ink"
              >
                {step === 'form'
                  ? t('Withdraw earnings')
                  : step === 'otp'
                    ? t('Verify withdrawal')
                    : t('Withdrawal requested')}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {t('Available to withdraw')}:{' '}
                {formatCurrency(available, locale)}
              </p>
            </div>
          </div>
          <IconButton
            label={t('Close')}
            variant="ghost"
            onClick={close}
            disabled={isSubmitting}
          >
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </div>

        <div className="space-y-3 px-4 pt-3">
          {step === 'form' ? (
            <>
              <Input
                label={t('Amount')}
                prefix="₹"
                inputMode="numeric"
                autoComplete="off"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value.replace(/\D/g, ''))
                  setError(null)
                }}
                hint={t('You can withdraw up to {amount}.', {
                  amount: formatCurrency(available, locale),
                })}
              />

              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(available)))}
                className="text-[11.5px] font-semibold text-brand hover:underline"
              >
                {t('Withdraw all')}
              </button>

              <Input
                label={t('UPI ID')}
                inputMode="email"
                autoComplete="off"
                placeholder={t('name@bank')}
                value={upiId}
                onChange={(event) => {
                  setUpiId(event.target.value)
                  setError(null)
                }}
                hint={t(
                  'This is where the money will be sent. You can change it each time.',
                )}
              />

              <p className="rounded-xl bg-brand-tint px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-muted">
                {t('The amount will take 24 hours to credit in your account.')}
              </p>

              {error ? (
                <p role="alert" className="text-xs font-medium text-danger">
                  {t(error.key, error.vars)}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={close}>
                  {t('Cancel')}
                </Button>
                <Button
                  disabled={!canContinue}
                  rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
                  onClick={handleContinue}
                >
                  {t('Continue')}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'otp' ? (
            <>
              <p className="text-[12px] leading-relaxed text-ink-muted">
                {t(
                  'We will send a {length}-digit code to your registered mobile number.',
                  { length: OTP_LENGTH },
                )}
              </p>

              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value)
                  setError(null)
                }}
                length={OTP_LENGTH}
                autoFocus
                hasError={Boolean(error)}
                label={t('Withdrawal code')}
              />

              <div className="rounded-xl bg-brand-tint px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-muted">
                {t('No SMS is sent in this prototype. Use the code {code}.', {
                  code: DEMO_WITHDRAWAL_OTP,
                })}
              </div>

              {error ? (
                <p role="alert" className="text-xs font-medium text-danger">
                  {t(error.key, error.vars)}
                </p>
              ) : null}

              {submitError ? (
                <p role="alert" className="text-xs font-medium text-danger">
                  {t(submitError)}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  disabled={isSubmitting}
                >
                  {t('Back')}
                </Button>
                <Button
                  isLoading={isSubmitting}
                  onClick={() => void handleVerify()}
                >
                  {t('Confirm withdrawal')}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'done' ? (
            <div className="pb-2 pt-4 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
                <BadgeCheck className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-[15px] font-bold text-ink">
                {t('Withdrawal requested')}
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {t('The amount will take 24 hours to credit in your account.')}
              </p>
              {requestId ? (
                <p className="mt-2 text-[11px] text-ink-soft">{requestId}</p>
              ) : null}
              <Button fullWidth className="mt-4" onClick={onClose}>
                {t('Done')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
