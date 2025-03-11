import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }
  
  return (
    <div className="navbar bg-base-100 border-b border-gray-800">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            <Icon icon="solar:chat-round-dots-bold" className="mr-2 text-primary" />
            Quorum
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex-none md:hidden">
          <button 
            className="btn btn-square btn-ghost"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon icon={isMenuOpen ? "solar:close-circle-bold" : "solar:hamburger-menu-linear"} width="24" height="24" />
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="flex-none hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
                <Icon icon="solar:chat-line-linear" className="mr-1" />
                Chat
              </Link>
            </li>
            <li>
              <Link to="/templates" className={isActive('/templates') ? 'active' : ''}>
                <Icon icon="solar:bookmark-linear" className="mr-1" />
                Templates
              </Link>
            </li>
            <li>
              <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
                <Icon icon="solar:settings-linear" className="mr-1" />
                Settings
              </Link>
            </li>
            <li>
              <Link to="/help" className={isActive('/help') ? 'active' : ''}>
                <Icon icon="solar:info-circle-linear" className="mr-1" />
                Help
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-base-100 border-b border-gray-800 z-50">
          <ul className="menu menu-vertical p-2">
            <li>
              <Link 
                to="/chat" 
                className={isActive('/chat') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:chat-line-linear" className="mr-1" />
                Chat
              </Link>
            </li>
            <li>
              <Link 
                to="/templates" 
                className={isActive('/templates') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:bookmark-linear" className="mr-1" />
                Templates
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={isActive('/settings') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:settings-linear" className="mr-1" />
                Settings
              </Link>
            </li>
            <li>
              <Link 
                to="/help" 
                className={isActive('/help') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon icon="solar:info-circle-linear" className="mr-1" />
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