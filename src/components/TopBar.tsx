import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from './LanguageToggle'
import { ThemeSelectorWithErrorBoundary } from './ThemeSelectorWithErrorBoundary'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle
} from '@heroui/react'

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()
  
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
    </Navbar>
  )
}

export default TopBar
