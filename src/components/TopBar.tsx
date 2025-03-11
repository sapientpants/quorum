import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Icon } from '@iconify/react'

export function TopBar() {
  const navigate = useNavigate()
  
  return (
    <nav className="flex items-center justify-between h-20 px-6 bg-card border-b border-app shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Quorum Logo" className="h-10 w-10" />
        <span className="text-2xl font-semibold text-app">Quorum</span>
      </div>
      
      <div className="flex items-center gap-4">
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