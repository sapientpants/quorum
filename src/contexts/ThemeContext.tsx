import { createContext, useContext, ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'

interface ThemeContextType {
  theme: 'dark' | 'light'
  isDark: boolean
  isLight: boolean
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

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

export function useThemeContext() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  
  return context
}