import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    
    // Check if user has a system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Return saved theme or system preference or default to dark
    return savedTheme || (prefersDark ? 'dark' : 'light')
  })

  useEffect(() => {
    // Update data-theme attribute on document root
    document.documentElement.setAttribute('data-theme', theme)
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Toggle between light and dark themes
  function toggleTheme() {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  // Set a specific theme
  function setThemeMode(newTheme: Theme) {
    setTheme(newTheme)
  }

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme: setThemeMode
  }
}

export default useTheme