import { createContext } from 'react'
import type { Theme } from '../../types/preferences'

/**
 * Theme context type definition
 */
export interface ThemeContextType {
  theme: Theme
  effectiveTheme: Theme
  systemPreference: 'light' | 'dark'
  isDark: boolean
  isLight: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

/**
 * Theme context for managing application themes
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined) 