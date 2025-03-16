import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SecurityStep } from '../SecurityStep'
import type { KeyStoragePreference } from '../../../types/preferences'

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'wizard.security.title': 'Security Settings',
        'wizard.security.description': 'Choose how to store your API keys',
        'wizard.security.localStorage.title': 'Local Storage',
        'wizard.security.localStorage.description': 'Store keys in browser local storage',
        'wizard.security.sessionOnly.title': 'Session Storage',
        'wizard.security.sessionOnly.description': 'Store keys for this session only',
        'wizard.security.noStorage.title': 'No Storage',
        'wizard.security.noStorage.description': 'Do not store keys',
        'wizard.security.note': 'Security note',
        'wizard.security.changeNote': 'You can change this later',
        'wizard.navigation.back': 'Back',
        'wizard.navigation.next': 'Next',
      }
      return translations[key] || key
    },
  }),
}))

// Mock preferences store
const updatePreferencesMock = vi.fn()
const mockPreferences = { keyStoragePreference: 'local' as KeyStoragePreference }

vi.mock('../../../store/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: mockPreferences,
    updatePreferences: updatePreferencesMock,
  }),
}))

vi.mock('@iconify/react', () => ({
  Icon: vi.fn(({ icon, className }) => (
    <span data-testid="icon" data-icon={icon} className={className}>
      Icon
    </span>
  )),
}))

describe('SecurityStep', () => {
  const onNext = vi.fn()
  const onBack = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset preferences to default
    mockPreferences.keyStoragePreference = 'local'
  })
  
  it('renders the component with title and description', () => {
    render(<SecurityStep onNext={onNext} />)
    
    expect(screen.getByText('Security Settings')).toBeInTheDocument()
    expect(screen.getByText('Choose how to store your API keys')).toBeInTheDocument()
  })
  
  it('renders all storage options', () => {
    render(<SecurityStep onNext={onNext} />)
    
    expect(screen.getByText('Local Storage')).toBeInTheDocument()
    expect(screen.getByText('Session Storage')).toBeInTheDocument()
    expect(screen.getByText('No Storage')).toBeInTheDocument()
  })
  
  it('selects the option from preferences by default', () => {
    render(<SecurityStep onNext={onNext} />)
    
    // Local storage should be selected by default based on mock preferences
    const localStorageOption = screen.getByText('Local Storage').closest('div[class*="rounded-lg border-2"]')
    expect(localStorageOption).toHaveClass('border-primary')
    expect(localStorageOption).toHaveClass('bg-primary/5')
  })
  
  it('changes selection when clicking on an option', () => {
    render(<SecurityStep onNext={onNext} />)
    
    // Initially local storage should be selected
    let localStorageOption = screen.getByText('Local Storage').closest('div[class*="rounded-lg border-2"]')
    expect(localStorageOption).toHaveClass('border-primary')
    
    // Click on session storage option
    const sessionStorageOption = screen.getByText('Session Storage').closest('div[class*="rounded-lg border-2"]')
    fireEvent.click(sessionStorageOption!)
    
    // Now session storage should be selected
    expect(sessionStorageOption).toHaveClass('border-primary')
    expect(sessionStorageOption).toHaveClass('bg-primary/5')
    
    // And local storage should not be selected
    localStorageOption = screen.getByText('Local Storage').closest('div[class*="rounded-lg border-2"]')
    expect(localStorageOption).not.toHaveClass('border-primary')
    expect(localStorageOption).not.toHaveClass('bg-primary/5')
  })
  
  it('updates preferences when changing selection', () => {
    render(<SecurityStep onNext={onNext} />)
    
    // Click on session storage option
    const sessionStorageOption = screen.getByText('Session Storage').closest('div[class*="rounded-lg border-2"]')
    fireEvent.click(sessionStorageOption!)
    
    // Check that preferences were updated
    expect(updatePreferencesMock).toHaveBeenCalledWith({ keyStoragePreference: 'session' })
    
    // Click on no storage option
    const noStorageOption = screen.getByText('No Storage').closest('div[class*="rounded-lg border-2"]')
    fireEvent.click(noStorageOption!)
    
    // Check that preferences were updated again
    expect(updatePreferencesMock).toHaveBeenCalledWith({ keyStoragePreference: 'none' })
  })
  
  it('calls onNext when clicking next button', () => {
    render(<SecurityStep onNext={onNext} />)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(onNext).toHaveBeenCalled()
  })
  
  it('does not render back button when onBack is not provided', () => {
    render(<SecurityStep onNext={onNext} />)
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })
  
  it('renders back button when onBack is provided', () => {
    render(<SecurityStep onNext={onNext} onBack={onBack} />)
    
    const backButton = screen.getByText('Back')
    expect(backButton).toBeInTheDocument()
  })
  
  it('calls onBack when clicking back button', () => {
    render(<SecurityStep onNext={onNext} onBack={onBack} />)
    
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)
    
    expect(onBack).toHaveBeenCalled()
  })
  
  it('renders info note', () => {
    render(<SecurityStep onNext={onNext} />)
    
    expect(screen.getByText('Security note')).toBeInTheDocument()
    expect(screen.getByText('You can change this later')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
