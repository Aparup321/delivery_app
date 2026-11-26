import { Globe2 } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { useLanguage } from '../../context/language'
import { languageOptions } from '../../i18n/translations'
import { cn } from '../../utils/cn'

/**
 * First decision of onboarding: the language the wizard and app are shown in.
 * The choice applies immediately and is stored by the language provider, so it
 * carries into Home, Orders and Profile.
 */
export function OnboardingLanguagePicker() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <Card padding="md" className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-deep">
          <Globe2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-ink">
            {t('Choose your language')}
          </p>
          <p className="text-[11px] text-ink-muted">
            {t('You can change this later in Profile.')}
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="sr-only">{t('Preferred language')}</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {languageOptions.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="onboarding-language"
                value={option.value}
                checked={language === option.value}
                onChange={() => setLanguage(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex min-h-10 items-center justify-center rounded-lg border px-1.5 py-2 text-center text-[11.5px] font-semibold leading-tight transition-colors',
                  'border-line bg-surface text-ink-muted',
                  'peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand-deep',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40',
                )}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </Card>
  )
}
