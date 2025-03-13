import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Welcome } from './Welcome'

// Mock the i18n hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() }
  })
}))

// Mock the ApiKeySetup component
vi.mock('../components/ApiKeySetup', () => ({
  default: vi.fn(({ onComplete }) => (
    <div data-testid="api-key-setup">
      <button onClick={onComplete}>Complete Setup</button>
    </div>
  ))
}))

describe('Welcome', () => {
  const mockNavigate = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock useNavigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => mockNavigate
      }
    })
  })
  
  function renderWelcome() {
    return render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
  }
  
  it('renders welcome screen correctly', () => {
    renderWelcome()
    
    // Check that the welcome content is displayed
    expect(screen.getByText('welcome.title')).toBeInTheDocument()
    expect(screen.getByText('welcome.subtitle')).toBeInTheDocument()
    expect(screen.getByText('welcome.getStarted')).toBeInTheDocument()
  })
  
  it('shows consent modal when getting started for first time', () => {
    renderWelcome()
    
    // Click get started
    fireEvent.click(screen.getByText('welcome.getStarted'))
    
    // Check that consent modal is shown
    expect(screen.getByText('welcome.consent.title')).toBeInTheDocument()
    expect(screen.getByText('welcome.consent.agreement')).toBeInTheDocument()
  })
  
  it('shows API key setup after consent', async () => {
    renderWelcome()
    
    // Click get started
    fireEvent.click(screen.getByText('welcome.getStarted'))
    
    // Check consent checkbox and continue
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByText('welcome.consent.continue'))
    
    // Check that API key setup is shown
    await waitFor(() => {
      expect(screen.getByTestId('api-key-setup')).toBeInTheDocument()
    })
  })
  
  it('navigates to chat after API key setup', async () => {
    renderWelcome()
    
    // Click get started
    fireEvent.click(screen.getByText('welcome.getStarted'))
    
    // Check consent checkbox and continue
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByText('welcome.consent.continue'))
    
    // Complete API key setup
    await waitFor(() => {
      fireEvent.click(screen.getByText('Complete Setup'))
    })
    
    // Check that we navigated to chat
    expect(mockNavigate).toHaveBeenCalledWith('/chat')
    expect(localStorage.getItem('hasApiKeys')).toBe('true')
  })
  
  it('skips consent for returning users but shows API key setup if needed', () => {
    // Set up as returning user with consent
    localStorage.setItem('hasConsented', 'true')
    
    renderWelcome()
    
    // Click get started
    fireEvent.click(screen.getByText('welcome.getStarted'))
    
    // Check that consent modal is not shown
    expect(screen.queryByText('welcome.consent.title')).not.toBeInTheDocument()
    
    // Check that API key setup is shown
    expect(screen.getByTestId('api-key-setup')).toBeInTheDocument()
  })
  
  it('navigates directly to chat for fully set up users', () => {
    // Set up as returning user with consent and API keys
    localStorage.setItem('hasConsented', 'true')
    localStorage.setItem('hasApiKeys', 'true')
    
    renderWelcome()
    
    // Click get started
    fireEvent.click(screen.getByText('welcome.getStarted'))
    
    // Check that we navigated to chat
    expect(mockNavigate).toHaveBeenCalledWith('/chat')
  })
}) 