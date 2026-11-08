import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Language, TranslationVars } from '../i18n/translations'
import { translate } from '../i18n/translations'
import { LanguageContext } from './language'

const STORAGE_KEY = 'fafo.partner.language'
const SUPPORTED_LANGUAGES: Language[] = ['en', 'hi', 'bn']

export interface LanguageProviderProps {
  children: ReactNode
}

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language
    }
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }

  return 'en'
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = language

    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Keep the in-memory language when persistence is unavailable.
    }
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
  }, [])

  const t = useCallback(
    (key: string, vars?: TranslationVars) => translate(language, key, vars),
    [language],
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
