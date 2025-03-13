import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useThemeContext } from '../contexts/ThemeContext'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from '@heroui/react'

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useThemeContext()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }
  
  return (
    <Navbar 
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-card border-b border-app transition-colors duration-300"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Icon icon="solar:chat-round-dots-bold" className="text-purple-500" width="24" height="24" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">Quorum</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden md:flex gap-4" justify="center">
        <NavbarItem isActive={isActive('/chat')}>
          <Link 
            to="/chat"
            className={`flex items-center gap-1.5 ${
              isActive('/chat')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Icon icon="solar:chat-line-linear" />
            Chat
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive('/templates')}>
          <Link 
            to="/templates"
            className={`flex items-center gap-1.5 ${
              isActive('/templates')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Icon icon="solar:bookmark-linear" />
            Templates
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive('/settings')}>
          <Link 
            to="/settings"
            className={`flex items-center gap-1.5 ${
              isActive('/settings')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Icon icon="solar:settings-linear" />
            Settings
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive('/help')}>
          <Link 
            to="/help"
            className={`flex items-center gap-1.5 ${
              isActive('/help')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Icon icon="solar:info-circle-linear" />
            Help
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {/* Theme toggle button */}
        <NavbarItem>
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
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
        </NavbarItem>
        
        {/* Mobile menu toggle */}
        <NavbarMenuToggle 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"} 
          className="md:hidden" 
        />
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu className="pt-6 bg-card">
        <NavbarMenuItem isActive={isActive('/chat')}>
          <Link
            to="/chat"
            className={`flex items-center gap-2 py-2 ${
              isActive('/chat')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Icon icon="solar:chat-line-linear" />
            Chat
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem isActive={isActive('/templates')}>
          <Link
            to="/templates"
            className={`flex items-center gap-2 py-2 ${
              isActive('/templates')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Icon icon="solar:bookmark-linear" />
            Templates
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem isActive={isActive('/settings')}>
          <Link
            to="/settings"
            className={`flex items-center gap-2 py-2 ${
              isActive('/settings')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Icon icon="solar:settings-linear" />
            Settings
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem isActive={isActive('/help')}>
          <Link
            to="/help"
            className={`flex items-center gap-2 py-2 ${
              isActive('/help')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Icon icon="solar:info-circle-linear" />
            Help
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}

export default TopBar