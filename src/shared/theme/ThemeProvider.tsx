import { useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { ThemeContext, THEMES, THEME_STORAGE_KEY, readAccent } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(readAccent)

  useLayoutEffect(() => {
    document.documentElement.dataset.accent = accent
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, accent)
    } catch (e) {
      void e
    }
  }, [accent])

  const setAccent = useCallback((id: string) => {
    if (THEMES.some((t) => t.id === id)) setAccentState(id)
  }, [])

  return <ThemeContext.Provider value={{ accent, setAccent }}>{children}</ThemeContext.Provider>
}
