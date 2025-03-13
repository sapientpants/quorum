import { useThemeContext } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { Button } from '@heroui/react'
import ErrorBoundary from './ErrorBoundary'
import { ThemeSelector } from './ThemeSelector'

// A simple fallback component for when the ThemeSelector fails
function ThemeSelectorFallback() {
  const { toggleTheme, isDark } = useThemeContext()
  const { t } = useTranslation()
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="flex items-center gap-1 px-2"
      aria-label={t('theme.toggle')}
      onClick={toggleTheme}
    >
      <Icon 
        icon={isDark ? "solar:moon-linear" : "solar:sun-linear"} 
        width="18" 
        height="18" 
        className={isDark ? "text-yellow-400" : "text-purple-500"}
      />
    </Button>
  )
}

export function ThemeSelectorWithErrorBoundary() {
  return (
    <ErrorBoundary
      fallback={<ThemeSelectorFallback />}
      onError={(error) => {
        console.error('ThemeSelector error:', error)
      }}
    >
      <ThemeSelector />
    </ErrorBoundary>
  )
}

export default ThemeSelectorWithErrorBoundary 