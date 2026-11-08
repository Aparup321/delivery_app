import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { OtpInput } from '../../components/common/OtpInput'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useAuth } from '../../context/auth'
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
  const state = (location.state ?? null) as VerifyLocationState | null
  const phone = state?.phone

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [issuedAt, setIssuedAt] = useState(() => Date.now())
  const { secondsLeft, restart } = useCountdown(RESEND_COOLDOWN_SECONDS)

  if (!phone) {
    return <Navigate to="/login" replace />
  }

  const maskedPhone = `+91 ${phone.slice(0, 2)}••••${phone.slice(-4)}`

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!phone) {
      return
    }

    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code to continue.`)
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
    signIn(phone)
    navigate(state?.from ?? '/', { replace: true })
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
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-[21px] font-semibold tracking-tight text-ink">
          Verify your number
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          We sent a {OTP_LENGTH}-digit code to{' '}
          <span className="font-semibold text-ink">{maskedPhone}</span>.
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
            {error ? (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-danger"
              >
                {error}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            Verify and continue
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px]">
          <Link
            to="/login"
            className="font-semibold text-brand-deep hover:underline"
          >
            Change number
          </Link>

          {secondsLeft > 0 ? (
            <span className="text-ink-muted">Resend in {secondsLeft}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-brand-deep hover:underline"
            >
              Resend code
            </button>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-tint p-3 text-[11.5px] leading-relaxed text-ink-muted">
          <Badge tone="brand" size="sm">
            Demo
          </Badge>
          <span>
            No SMS is sent in this prototype. Use the code{' '}
            <span className="font-semibold text-ink">{DEMO_OTP}</span>.
          </span>
        </div>
      </Card>
    </AuthLayout>
  )
}
