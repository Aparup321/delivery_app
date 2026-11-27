import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useLanguage } from '../../context/language'

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

interface LoginLocationState {
  from?: string
}

/**
 * Accepts pasted numbers with a +91/91 or trunk-0 prefix and spacing, and
 * keeps only the 10-digit local number. Without this, a pasted "+91 98765
 * 43210" would be truncated to the wrong 10 digits by the field length.
 */
function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2, 12)
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1)
  }

  return digits.slice(0, 10)
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    if (!INDIAN_MOBILE_PATTERN.test(phone)) {
      setError('Indian mobile numbers start with 6, 7, 8 or 9.')
      return
    }

    setError('')

    // The demo OTP is the default verification path while the project's own
    // OTP API is pending. The intended screen survives the detour.
    navigate('/verify-otp', {
      state: {
        phone,
        from: (location.state as LoginLocationState | null)?.from,
      },
    })
  }

  return (
    <AuthLayout>
      <h1 className="text-[20px] font-bold tracking-tight text-ink">
        {t('Sign in')}
      </h1>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        {t('Use the mobile number linked to your partner account.')}
      </p>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
        <Input
          label={t('Mobile number')}
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={t('Enter mobile number')}
          prefix="+91"
          hint={t('We will send a 6-digit verification code.')}
          error={error ? t(error) : undefined}
          value={phone}
          onChange={(event) => {
            setPhone(normalizeIndianMobile(event.target.value))
            if (error) {
              setError('')
            }
          }}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
        >
          {t('Send OTP')}
        </Button>
      </form>

      <p className="mt-3 px-1 text-center text-[10.5px] leading-relaxed text-ink-soft">
        {t(
          'Prototype build: verification codes are simulated and no SMS is sent.',
        )}
      </p>
    </AuthLayout>
  )
}
