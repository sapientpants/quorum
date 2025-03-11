import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useThemeContext } from '../contexts/ThemeContext'

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useThemeContext()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }
  
  return (
    <div className="navbar bg-card border-b border-app transition-colors duration-300">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Icon icon="solar:chat-round-dots-bold" className="text-purple-500" width="24" height="24" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">Quorum</span>
          </Link>
        </div>
        
        {/* Theme toggle button */}
        <div className="flex-none mr-2">
          <button
            className="p-2 rounded-full bg-card hover:bg-white/10 transition-colors"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Icon
              icon={theme === 'dark' ? "solar:sun-linear" : "solar:moon-linear"}
              width="20"
              height="20"
              className={theme === 'dark' ? "text-yellow-400" : "text-purple-500"}
            />
          </button>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex-none md:hidden">
          <button
            className="p-2 rounded-full bg-card hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon
              icon={isMenuOpen ? "solar:close-circle-bold" : "solar:hamburger-menu-linear"}
              width="24"
              height="24"
            />
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="flex-none hidden md:flex">
          <ul className="flex items-center gap-1">
            <li>
              <Link
                to="/chat"
                className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/chat')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
              >
                <Icon icon="solar:chat-line-linear" className="mr-1.5" />
                Chat
              </Link>
            </li>
            <li>
              <Link
                to="/templates"
                className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/templates')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
              >
                <Icon icon="solar:bookmark-linear" className="mr-1.5" />
                Templates
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/settings')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
              >
                <Icon icon="solar:settings-linear" className="mr-1.5" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/help"
                className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/help')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
              >
                <Icon icon="solar:info-circle-linear" className="mr-1.5" />
                Help
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b border-app z-50 shadow-lg">
          <ul className="p-2 space-y-1">
            <li>
              <Link
                to="/chat"
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/chat')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:chat-line-linear" className="mr-2" />
                Chat
              </Link>
            </li>
            <li>
              <Link
                to="/templates"
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/templates')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:bookmark-linear" className="mr-2" />
                Templates
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/settings')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:settings-linear" className="mr-2" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/help"
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  isActive('/help')
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:info-circle-linear" className="mr-2" />
                Help
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default TopBar