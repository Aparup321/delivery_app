import { useLocation } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useLanguage } from '../../context/language'
import { PhoneForm } from './PhoneForm'

interface LoginLocationState {
  from?: string
  phone?: string
}

export function LoginPage() {
  const location = useLocation()
  const { t } = useLanguage()
  const state = (location.state ?? null) as LoginLocationState | null

  return (
    <AuthLayout>
      <h1 className="text-[20px] font-bold tracking-tight text-ink">
        {t('Sign in')}
      </h1>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        {t('Use the mobile number linked to your partner account.')}
      </p>

      <PhoneForm from={state?.from} initialPhone={state?.phone} />

      <p className="mt-3 px-1 text-center text-[10.5px] leading-relaxed text-ink-soft">
        {t(
          'Prototype build: verification codes are simulated and no SMS is sent.',
        )}
      </p>
    </AuthLayout>
  )
}
