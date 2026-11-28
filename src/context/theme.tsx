import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const THEME_KEY = 'fafo.partner.theme'

function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark'
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    // Keep the browser chrome in step with the app instead of pinning the
    // light brand purple in dark mode.
    const themeColor = document.querySelector('meta[name="theme-color"]')
    themeColor?.setAttribute(
      'content',
      theme === 'dark' ? '#0f0d17' : '#5123a5',
    )

    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // The preference remains in memory when storage is blocked.
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
