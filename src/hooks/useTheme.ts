import { useEffect, useState, useCallback } from 'react'
import type { Theme } from '../types/preferences'
import { usePreferencesStore } from '../store/preferencesStore'

// Theme categories for organization
const themeCategories = {
  light: ['light', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'retro', 'garden', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'winter'],
  dark: ['dark', 'synthwave', 'cyberpunk', 'valentine', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'night', 'coffee']
}

// Helper function to check if a theme is dark
export const isThemeDark = (theme: Theme): boolean => {
  return themeCategories.dark.includes(theme as string)
}

// Helper function for debugging theme issues
function debugTheme(message: string, theme: string) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Theme Debug] ${message}:`, theme)
  }
}

export function useTheme() {
  const { preferences, setTheme: setStoreTheme } = usePreferencesStore()
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  
  // Get the effective theme (resolving 'system' to actual theme)
  const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
    if (preferences.theme === 'system') {
      return systemPreference
    }
    return preferences.theme === 'dark' ? 'dark' : 'light'
  }, [preferences.theme, systemPreference])
  
  const effectiveTheme = getEffectiveTheme()
  const isDark = effectiveTheme === 'dark'

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply theme when it changes
  useEffect(() => {
    try {
      debugTheme('Applying theme', effectiveTheme)
      
      // For HeroUI, we need to add/remove the 'dark' class
      const rootElement = document.documentElement
      
      // First, remove both light and dark classes to start fresh
      rootElement.classList.remove('light', 'dark')
      
      // Then add the appropriate class based on the theme
      rootElement.classList.add(effectiveTheme)
      
      // Save theme preference to localStorage for initial load script
      localStorage.setItem('theme', effectiveTheme)
    } catch (error) {
      console.error('Error applying theme:', error)
      // Fallback to light theme if there's an error
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [effectiveTheme])

  // Toggle between light and dark themes
  function toggleTheme() {
    try {
      debugTheme('Current theme before toggle', preferences.theme)
      
      if (preferences.theme === 'system') {
        // If using system preference, toggle to the opposite
        setStoreTheme(systemPreference === 'dark' ? 'light' : 'dark')
      } else {
        // Just toggle between light and dark
        setStoreTheme(preferences.theme === 'dark' ? 'light' : 'dark')
      }
    } catch (error) {
      console.error('Error toggling theme:', error)
      setStoreTheme('light')
    }
  }

  // Set a specific theme
  function setThemeMode(newTheme: Theme) {
    try {
      debugTheme('Setting theme to', newTheme)
      
      // Only allow 'light', 'dark', or 'system'
      if (newTheme === 'system' || newTheme === 'light' || newTheme === 'dark') {
        setStoreTheme(newTheme)
      } else {
        // For any other theme, map to light or dark based on category
        console.warn(`Mapping theme ${newTheme} to light/dark`)
        setStoreTheme('light')
      }
    } catch (error) {
      console.error('Error setting theme:', error)
      setStoreTheme('light')
    }
  }

  return {
    theme: preferences.theme,
    effectiveTheme,
    systemPreference,
    isDark,
    isLight: !isDark,
    toggleTheme,
    setTheme: setThemeMode
  }
}