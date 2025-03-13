import { createContext, useContext, ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../types/preferences'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: Theme
  systemPreference: 'light' | 'dark'
  isDark: boolean
  isLight: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useThemeContext() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme()
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}