import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { IconTile } from '../../components/common/IconTile'
import { OtpInput } from '../../components/common/OtpInput'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useAuth } from '../../context/auth'
import { useLanguage } from '../../context/language'
import { useCountdown } from '../../hooks/useCountdown'
import {
  DEMO_OTP,
  OTP_LENGTH,
  OTP_VALIDITY_MS,
  RESEND_COOLDOWN_SECONDS,
} from '../../mock/auth'

interface VerifyLocationState {
  phone?: string
  from?: string
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const state = (location.state ?? null) as VerifyLocationState | null
  const phone = state?.phone

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [issuedAt, setIssuedAt] = useState(() => Date.now())
  const [isVerifying, setIsVerifying] = useState(false)
  const { secondsLeft, restart } = useCountdown(RESEND_COOLDOWN_SECONDS)

  if (!phone) {
    return <Navigate to="/login" replace />
  }

  const maskedPhone = `+91 ${phone.slice(0, 2)}••••${phone.slice(-4)}`
  const errorMessage = error
    ? t(error, { length: OTP_LENGTH })
    : undefined

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!phone) {
      return
    }

    if (otp.length !== OTP_LENGTH) {
      setError('Enter the {length}-digit code to continue.')
      return
    }

    if (Date.now() - issuedAt > OTP_VALIDITY_MS) {
      setError('This code has expired. Resend a new code to continue.')
      return
    }

    if (otp !== DEMO_OTP) {
      setError('That code is not correct. Check the digits and try again.')
      return
    }

    setError('')
    setIsVerifying(true)

    // The demo OTP is the default verification path while the project's own
    // OTP API is pending. AuthProvider bridges the accepted code to an
    // anonymous Firebase session when it can and records the error code for
    // the connection banner when it cannot.
    try {
      await signIn(phone)
      navigate(state?.from ?? '/', { replace: true })
    } catch {
      setError('Could not verify the code. Try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  function handleResend() {
    setIssuedAt(Date.now())
    setOtp('')
    setError('')
    restart()
  }

  return (
    <AuthLayout>
      <Card padding="lg">
        <IconTile size="lg">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </IconTile>

        <h1 className="mt-4 text-[21px] font-semibold tracking-tight text-ink">
          {t('Verify your number')}
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          {t('We sent a {length}-digit code to {phone}.', {
            length: OTP_LENGTH,
            phone: maskedPhone,
          })}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleVerify} noValidate>
          <div>
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value)
                if (error) {
                  setError('')
                }
              }}
              length={OTP_LENGTH}
              hasError={Boolean(error)}
              autoFocus
            />
            {errorMessage ? (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-danger"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isVerifying}
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            {t('Verify and continue')}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px]">
          <Link
            to="/login"
            className="font-semibold text-brand-deep hover:underline"
          >
            {t('Change number')}
          </Link>

          {secondsLeft > 0 ? (
            <span className="text-ink-muted">
              {t('Resend in {seconds}s', { seconds: secondsLeft })}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-brand-deep hover:underline"
            >
              {t('Resend code')}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-tint p-3 text-[11.5px] leading-relaxed text-ink-muted">
          <Badge tone="brand" size="sm">
            {t('Demo')}
          </Badge>
          <span>
            {t('No SMS is sent in this prototype. Use the code {code}.', {
              code: DEMO_OTP,
            })}
          </span>
        </div>
      </Card>
    </AuthLayout>
  )
}
