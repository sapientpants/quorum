import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from './LanguageToggle'
import { ThemeSelectorWithErrorBoundary } from './ThemeSelectorWithErrorBoundary'
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
  const { t } = useTranslation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }
  
  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-card h-16 z-50 transition-colors duration-300"
    >
      <NavbarContent>
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Icon icon="solar:chat-round-dots-bold" className="text-purple-500" width="24" height="24" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">{t('app.name')}</span>
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
            {t('navigation.chat')}
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive('/participants')}>
          <Link 
            to="/participants"
            className={`flex items-center gap-1.5 ${
              isActive('/participants')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Icon icon="solar:users-group-rounded-linear" />
            {t('navigation.participants', 'Participants')}
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
            {t('navigation.templates')}
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
            {t('navigation.settings')}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {/* Language toggle button */}
        <NavbarItem>
          <LanguageToggle />
        </NavbarItem>
        
        {/* Theme toggle button with error boundary */}
        <NavbarItem>
          <ThemeSelectorWithErrorBoundary />
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
            {t('navigation.chat')}
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem isActive={isActive('/participants')}>
          <Link
            to="/participants"
            className={`flex items-center gap-2 py-2 ${
              isActive('/participants')
                ? 'text-primary'
                : 'text-foreground/70 hover:text-foreground'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Icon icon="solar:users-group-rounded-linear" />
            {t('navigation.participants', 'Participants')}
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
            {t('navigation.templates')}
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
            {t('navigation.settings')}
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}

export default TopBar
