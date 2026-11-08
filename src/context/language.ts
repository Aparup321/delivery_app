import { createContext, useContext } from 'react'
import type { Language, TranslationVars } from '../i18n/translations'

export interface LanguageContextValue {
  language: Language
  /** BCP 47 locale used for dates, times and numbers. */
  locale: string
  setLanguage: (language: Language) => void
  t: (key: string, vars?: TranslationVars) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  }

  return context
}
