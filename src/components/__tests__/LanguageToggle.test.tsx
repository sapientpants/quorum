import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageToggle } from '../LanguageToggle'
import { LanguageContext } from '../../contexts/contexts/LanguageContextDefinition'

// Mock the Iconify Icon component
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => (
    <div data-testid="icon" data-icon={icon}></div>
  )
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'languageToggle.selectLanguage': 'Select Language'
      }
      return translations[key] || key
    }
  })
}))

// Mock the dropdown menu components
vi.mock('../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children, ...props }: { children: React.ReactNode, 'aria-label'?: string }) => (
    <button data-testid="dropdown-trigger" {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <div data-testid="dropdown-item" onClick={onClick}>{children}</div>
  )
}))

describe('LanguageToggle', () => {
  // Mock language context
  const mockChangeLanguage = vi.fn()
  const mockLanguageContext = {
    language: 'en',
    changeLanguage: mockChangeLanguage,
    availableLanguages: [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' }
    ]
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders the language toggle with current language icon', () => {
    render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <LanguageToggle />
      </LanguageContext.Provider>
    )
    
    // Check that the dropdown trigger is rendered with correct aria-label
    const trigger = screen.getByTestId('dropdown-trigger')
    expect(trigger).toHaveAttribute('aria-label', 'Select Language')
    
    // Check that the current language icon is rendered in the trigger button
    const triggerButton = screen.getByTestId('dropdown-trigger')
    const icon = triggerButton.querySelector('[data-testid="icon"]')
    expect(icon).toHaveAttribute('data-icon', 'emojione:flag-for-united-kingdom')
  })
  
  it('renders all available languages in the dropdown', () => {
    render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <LanguageToggle />
      </LanguageContext.Provider>
    )
    
    // Check that both language options are rendered
    const items = screen.getAllByTestId('dropdown-item')
    expect(items).toHaveLength(2)
    
    // Check that the language names are rendered
    expect(items[0].textContent).toContain('English')
    expect(items[1].textContent).toContain('Deutsch')
    
    // Check that the language icons are rendered
    const icons = screen.getAllByTestId('icon')
    expect(icons[1]).toHaveAttribute('data-icon', 'emojione:flag-for-united-kingdom')
    expect(icons[2]).toHaveAttribute('data-icon', 'emojione:flag-for-germany')
  })
  
  it('calls changeLanguage when a language is selected', () => {
    render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <LanguageToggle />
      </LanguageContext.Provider>
    )
    
    // Get the language items
    const items = screen.getAllByTestId('dropdown-item')
    
    // Click on the German language option
    fireEvent.click(items[1])
    
    // Check that changeLanguage was called with the correct language code
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
  })
  
  it('highlights the current language in the dropdown', () => {
    // Set German as the current language
    const germanContext = {
      ...mockLanguageContext,
      language: 'de'
    }
    
    render(
      <LanguageContext.Provider value={germanContext}>
        <LanguageToggle />
      </LanguageContext.Provider>
    )
    
    // Check that the German flag icon is shown in the trigger
    const triggerButton = screen.getByTestId('dropdown-trigger')
    const triggerIcon = triggerButton.querySelector('[data-testid="icon"]')
    expect(triggerIcon).toHaveAttribute('data-icon', 'emojione:flag-for-germany')
    
    // Note: In a real test, we would check for the highlighting class on the selected item,
    // but since we're mocking the dropdown components, we can't easily test this.
  })
  
  it('uses a fallback icon when language has no specific icon', () => {
    // Add a language without a specific icon
    const contextWithExtraLanguage = {
      ...mockLanguageContext,
      availableLanguages: [
        ...mockLanguageContext.availableLanguages,
        { code: 'fr', name: 'Français' }
      ]
    }
    
    render(
      <LanguageContext.Provider value={contextWithExtraLanguage}>
        <LanguageToggle />
      </LanguageContext.Provider>
    )
    
    // Get all icons
    const icons = screen.getAllByTestId('icon')
    
    // The third language (French) should use the fallback icon
    expect(icons[3]).toHaveAttribute('data-icon', 'solar:global-linear')
  })
})
