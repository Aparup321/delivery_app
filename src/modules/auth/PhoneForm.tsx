import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useLanguage } from '../../context/language'

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

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

export interface PhoneFormProps {
  /** Route to return to after a successful sign-in. */
  from?: string
}

/**
 * Owns the phone value so typing re-renders only this form. Keeping the state
 * in LoginPage made every digit reconcile the whole hero-and-sheet shell.
 */
export function PhoneForm({ from }: PhoneFormProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const phoneRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const phone = normalizeIndianMobile(phoneRef.current?.value ?? '')

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
    navigate('/verify-otp', { state: { phone, from } })
  }

  return (
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
        inputRef={phoneRef}
        onChange={(event) => {
          // Keep the field uncontrolled: normalising in the DOM avoids a React
          // render on every digit, which is what made typing feel laggy.
          const normalized = normalizeIndianMobile(event.currentTarget.value)

          if (event.currentTarget.value !== normalized) {
            event.currentTarget.value = normalized
          }

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
  )
}
