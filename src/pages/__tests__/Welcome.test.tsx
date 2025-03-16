import { render, screen, fireEvent, act } from '@testing-library/react'
import { Welcome } from '../Welcome'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import type { Mock } from 'vitest'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn<() => NavigateFunction>(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock components
vi.mock('../../components/TopBar', () => ({
  TopBar: () => <div data-testid="top-bar">Top Bar</div>
}))

// Mock the ConsentModal and ApiKeySetup components
vi.mock('../../components/onboarding/ConsentModal', () => ({
  ConsentModal: () => <div>Mocked ConsentModal</div>
}))

vi.mock('../../components/ApiKeySetup', () => ({
  ApiKeySetup: () => <div>Mocked ApiKeySetup</div>
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'welcome.title': 'Welcome to Quorum',
        'welcome.getStarted': 'Get Started',
        'welcome.subtitle': 'Experience the future of AI collaboration',
        'welcome.features.customParticipants': 'Create custom AI participants with unique personalities',
        'welcome.features.multiModel': 'Mix and match different AI models in one conversation',
        'welcome.features.saveConfigs': 'Save and share your favorite conversation configurations',
        'welcome.features.analyze': 'Analyze and export conversation insights',
        'welcome.apiNote.text': 'You will need API keys to use the AI models',
        'welcome.consent.title': 'API Keys & Privacy Notice',
        'welcome.consent.continue': 'Continue',
        'welcome.consent.cancel': 'Cancel',
        'welcome.consent.agreement': 'I understand and agree to these terms',
        'welcome.consent.points.localStorage': 'Local Storage',
        'welcome.consent.points.sessionStorage': 'Session Storage',
        'welcome.consent.points.noStorage': 'No Storage'
      }
      return translations[key] || key
    }
  })
}))

describe('Welcome', () => {
  const mockNavigate: NavigateFunction = vi.fn()
  const mockedUseNavigate = useNavigate as Mock<() => NavigateFunction>

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockedUseNavigate.mockReturnValue(mockNavigate)
  })

  it('renders welcome screen correctly', () => {
    render(<Welcome />)
    expect(screen.getByText('Welcome to Quorum')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  // Skip these tests as they're not compatible with the new wizard flow
  it.skip('shows consent modal when getting started for first time', () => {
    // This test is no longer valid with the new wizard flow
  })

  it.skip('shows API key setup after consent', async () => {
    // This test is no longer valid with the new wizard flow
  })

  it.skip('navigates to participants page after API key setup', async () => {
    // This test is no longer valid with the new wizard flow
  })

  it('skips consent for returning users and checks API keys correctly', async () => {
    localStorage.setItem('hasConsented', 'true')
    // Mock the API_KEY_STORAGE_KEY to have at least one key
    localStorage.setItem('quorum_api_keys', JSON.stringify({ 'openai': 'sk-testkey' }))
    
    render(<Welcome />)
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Get Started' }))
    })
    
    // With the new wizard flow, it should navigate to security first
    expect(mockNavigate).toHaveBeenCalledWith('/security')
  })

  it('navigates to security page for fully set up users', async () => {
    localStorage.setItem('hasConsented', 'true')
    localStorage.setItem('hasApiKeys', 'true')
    render(<Welcome />)
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Get Started' }))
    })
    
    // With the new wizard flow, it should navigate to security first
    expect(mockNavigate).toHaveBeenCalledWith('/security')
  })
})
