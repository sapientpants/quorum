import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '../components/ui/Dropdown'
import { Icon } from '@iconify/react'

export function TopBar() {
  const location = useLocation()
  const [theme, setTheme] = React.useState<string>(localStorage.getItem('theme') || 'dark')
  const [isOpen, setIsOpen] = React.useState(false)
  
  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark')
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75"></div>
              <img src="/logo.svg" alt="Quorum Logo" className="relative h-6 w-6" />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">Quorum</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10">
              <Link 
                to="/chat"
                className={location.pathname === '/chat' ? 'text-white' : 'text-white/80'}
              >
                Chat
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10">
              <Link 
                to="/templates"
                className={location.pathname === '/templates' ? 'text-white' : 'text-white/80'}
              >
                Templates
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10">
              <Link 
                to="/help"
                className={location.pathname === '/help' ? 'text-white' : 'text-white/80'}
              >
                Help
              </Link>
            </Button>
          </nav>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {theme === 'light' ? (
                <Icon icon="solar:moon-linear" className="w-5 h-5" />
              ) : (
                <Icon icon="solar:sun-linear" className="w-5 h-5" />
              )}
            </Button>

            <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
              <DropdownTrigger>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Icon icon="solar:settings-linear" className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem>
                  <Link to="/settings" className="block w-full">Settings</Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  )
} 