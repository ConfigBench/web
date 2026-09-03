import { createContext } from 'react'

export interface ThemeOption {
  id: string
  name: string
  color: string
}

export const THEMES: ThemeOption[] = [
  { id: 'mint', name: 'Mint', color: '#6ee7a0' },
  { id: 'grass', name: 'Grass', color: '#55ff55' },
  { id: 'sky', name: 'Sky', color: '#8fd4ff' },
  { id: 'rose', name: 'Rose', color: '#ffb3c6' },
  { id: 'lavender', name: 'Lavender', color: '#c3b2ff' },
  { id: 'peach', name: 'Peach', color: '#ffc09b' },
]

export interface ThemeContextValue {
  accent: string
  setAccent: (id: string) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const THEME_STORAGE_KEY = 'configbench.accent'

export function readAccent(): string {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (saved && THEMES.some((t) => t.id === saved)) return saved
  } catch (e) {
    void e
  }
  return 'mint'
}
