import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Icon } from '@iconify/react'
import { useTheme } from '../hooks/useTheme'

export function TopBar() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  
  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }
  
  return (
    <nav className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Quorum Logo" className="h-10 w-10" />
        <span className="text-2xl font-semibold">Quorum</span>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={toggleTheme}>
          <Icon
            icon={
              theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                ? 'solar:sun-linear'
                : 'solar:moon-linear'
            }
            className="h-5 w-5"
          />
        </Button>
        
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <Icon icon="solar:settings-linear" className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" onClick={() => navigate('/help')}>
          <Icon icon="solar:help-linear" className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" onClick={() => navigate('/menu')}>
          <Icon icon="solar:menu-linear" className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  )
} 