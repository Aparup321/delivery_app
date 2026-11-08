import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useLanguage } from '../../context/language'

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

export function LoginPage() {
  const navigate = useNavigate()
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
    navigate('/verify-otp', { state: { phone } })
  }

  return (
    <AuthLayout>
      <Card padding="lg">
        <h1 className="text-[21px] font-semibold tracking-tight text-ink">
          {t('Sign in')}
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          {t('Use the mobile number linked to your partner account.')}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label={t('Mobile number')}
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="99999 55555"
            hint={t('We will send a 6-digit verification code.')}
            error={error ? t(error) : undefined}
            value={phone}
            maxLength={10}
            leftIcon={<Phone className="size-4" aria-hidden="true" />}
            onChange={(event) => {
              setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
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
      </Card>

      <p className="mt-4 px-1 text-center text-[11.5px] leading-relaxed text-ink-soft">
        {t(
          'Prototype build: verification codes are simulated, no SMS is sent, and no account is created.',
        )}
      </p>
    </AuthLayout>
  )
}
