import { useThemeContext } from '../hooks/useThemeContext'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { Button } from '@heroui/react'

export function ThemeSelector() {
  const { effectiveTheme, toggleTheme } = useThemeContext()
  const { t } = useTranslation()
  
  const isDarkTheme = effectiveTheme === 'dark'
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="flex items-center gap-1 px-2"
      aria-label={t('theme.toggle')}
      onClick={toggleTheme}
    >
      <Icon 
        icon={isDarkTheme ? "solar:moon-linear" : "solar:sun-linear"} 
        width="18" 
        height="18" 
        className={isDarkTheme ? "text-yellow-400" : "text-purple-500"}
      />
    </Button>
  )
} 