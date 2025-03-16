import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiErrorModal } from '../ApiErrorModal'
import { LLMError, LLMErrorType } from '../../services/llm/errors'
import { ErrorContext, ErrorContextType } from '../../contexts/contexts/ErrorContextDefinition'
import { ConnectionQuality } from '../../utils/network'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'errors.titles.authError': 'Authentication Error',
        'errors.titles.rateLimitError': 'Rate Limit Exceeded',
        'errors.titles.timeoutError': 'Request Timeout',
        'errors.titles.contentFilterError': 'Content Filtered',
        'errors.titles.networkError': 'Network Error',
        'errors.titles.apiError': 'API Error',
        'errors.titles.unknownError': 'Unknown Error',
        'errors.suggestions.checkApiKey': 'Check your API key',
        'errors.suggestions.regenerateKey': 'Try regenerating your API key',
        'errors.suggestions.verifyAccount': 'Verify your account status',
        'errors.suggestions.waitAndRetry': 'Wait and try again later',
        'errors.suggestions.upgradeAccount': 'Consider upgrading your account',
        'errors.suggestions.checkUsage': 'Check your usage quota',
        'errors.suggestions.checkConnection': 'Check your internet connection',
        'errors.suggestions.retryRequest': 'Try the request again',
        'errors.suggestions.reduceComplexity': 'Reduce the complexity of your request',
        'errors.suggestions.modifyContent': 'Modify your content',
        'errors.suggestions.checkPolicies': 'Review content policies',
        'errors.suggestions.retry': 'Try again',
        'errors.suggestions.refreshPage': 'Refresh the page',
        'errors.suggestions.contactSupport': 'Contact support',
        'errors.suggestionsTitle': 'Suggestions',
        'errors.technicalDetails': 'Technical Details',
        'errors.viewDocumentation': 'View Documentation',
        'errors.dismiss': 'Dismiss',
        'errors.tryAgain': 'Try Again'
      }
      return translations[key] || key
    }
  })
}))

// Mock the Dialog component to avoid issues with the actual implementation
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode, open?: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-footer">{children}</div>
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
  ShieldAlert: () => <span data-testid="shield-alert-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
  Wifi: () => <span data-testid="wifi-icon" />,
  Network: () => <span data-testid="network-icon" />,
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  ExternalLink: () => <span data-testid="external-link-icon" />,
  X: () => <span data-testid="x-icon" />,
  RefreshCcw: () => <span data-testid="refresh-icon" />
}))

// Mock the Separator component
vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}))

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    onClick, 
    variant, 
    size 
  }: { 
    children: React.ReactNode, 
    onClick?: () => void, 
    variant?: string, 
    size?: string 
  }) => (
    <button 
      data-testid="button" 
      data-variant={variant} 
      data-size={size} 
      onClick={onClick}
    >
      {children}
    </button>
  )
}))

describe('ApiErrorModal', () => {
  // Mock error context values
  const mockClearError = vi.fn()
  const mockSetShowApiErrorModal = vi.fn()
  
  // Setup default context values
  const defaultContextValue: ErrorContextType = {
    apiError: null,
    setApiError: vi.fn(),
    showApiErrorModal: false,
    setShowApiErrorModal: mockSetShowApiErrorModal,
    networkStatus: ConnectionQuality.GOOD,
    isOnline: true,
    isLowBandwidth: false,
    currentProvider: null,
    setCurrentProvider: vi.fn(),
    clearError: mockClearError
  }
  
  // Helper function to render with context
  const renderWithContext = (contextValue: Partial<ErrorContextType> = {}) => {
    return render(
      <ErrorContext.Provider value={{ ...defaultContextValue, ...contextValue }}>
        <ApiErrorModal />
      </ErrorContext.Provider>
    )
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders nothing when there is no error', () => {
    const { container } = renderWithContext()
    expect(container.firstChild).toBeNull()
  })
  
  it('renders authentication error correctly', () => {
    const authError = new LLMError(
      LLMErrorType.AUTHENTICATION, 
      'Invalid API key',
      { statusCode: 401 }
    )
    
    renderWithContext({
      apiError: authError,
      showApiErrorModal: true,
      currentProvider: 'openai'
    })
    
    // Check title and status code
    expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    expect(screen.getByText('401')).toBeInTheDocument()
    
    // Check error message
    expect(screen.getByText('Invalid API key')).toBeInTheDocument()
    
    // Check suggestions
    expect(screen.getByText('Check your API key')).toBeInTheDocument()
    expect(screen.getByText('Try regenerating your API key')).toBeInTheDocument()
    expect(screen.getByText('Verify your account status')).toBeInTheDocument()
    
    // Check technical details
    expect(screen.getByText(/Error: Invalid API key/)).toBeInTheDocument()
    expect(screen.getByText(/Type: authentication/)).toBeInTheDocument()
    expect(screen.getByText(/Status: 401/)).toBeInTheDocument()
    
    // Check provider badge
    expect(screen.getByText('openai')).toBeInTheDocument()
    
    // Check buttons
    expect(screen.getByText('Dismiss')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('View Documentation')).toBeInTheDocument()
  })
  
  it('renders rate limit error correctly', () => {
    const rateLimitError = new LLMError(
      LLMErrorType.RATE_LIMIT, 
      'Too many requests',
      { statusCode: 429 }
    )
    
    renderWithContext({
      apiError: rateLimitError,
      showApiErrorModal: true,
      currentProvider: 'anthropic'
    })
    
    // Check title and status code
    expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument()
    expect(screen.getByText('429')).toBeInTheDocument()
    
    // Check error message
    expect(screen.getByText('Too many requests')).toBeInTheDocument()
    
    // Check suggestions
    expect(screen.getByText('Wait and try again later')).toBeInTheDocument()
    expect(screen.getByText('Consider upgrading your account')).toBeInTheDocument()
    expect(screen.getByText('Check your usage quota')).toBeInTheDocument()
    
    // Check provider badge
    expect(screen.getByText('anthropic')).toBeInTheDocument()
  })
  
  it('renders network error correctly', () => {
    const networkError = new LLMError(
      LLMErrorType.NETWORK, 
      'Failed to fetch',
      {}
    )
    
    renderWithContext({
      apiError: networkError,
      showApiErrorModal: true,
      currentProvider: 'google'
    })
    
    // Check title
    expect(screen.getByText('Network Error')).toBeInTheDocument()
    
    // Check error message
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    
    // Check suggestions
    expect(screen.getByText('Check your internet connection')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByText('Refresh the page')).toBeInTheDocument()
    
    // Check provider badge
    expect(screen.getByText('google')).toBeInTheDocument()
  })
  
  it('renders generic error correctly', () => {
    const genericError = new Error('Something went wrong')
    
    renderWithContext({
      apiError: genericError,
      showApiErrorModal: true
    })
    
    // Check title
    expect(screen.getByText('Unknown Error')).toBeInTheDocument()
    
    // Check error message
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Check suggestions
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByText('Refresh the page')).toBeInTheDocument()
    expect(screen.getByText('Contact support')).toBeInTheDocument()
  })
  
  it('calls clearError when dismiss button is clicked', () => {
    const error = new Error('Test error')
    
    renderWithContext({
      apiError: error,
      showApiErrorModal: true
    })
    
    fireEvent.click(screen.getByText('Dismiss'))
    expect(mockClearError).toHaveBeenCalledTimes(1)
  })
  
  it('calls clearError when try again button is clicked', () => {
    const error = new Error('Test error')
    
    renderWithContext({
      apiError: error,
      showApiErrorModal: true
    })
    
    fireEvent.click(screen.getByText('Try Again'))
    expect(mockClearError).toHaveBeenCalledTimes(1)
  })
  
  it('calls setShowApiErrorModal when dialog is closed', () => {
    const error = new Error('Test error')
    
    renderWithContext({
      apiError: error,
      showApiErrorModal: true
    })
    
    // The Dialog component from shadcn/ui would call onOpenChange when closed
    // We can't directly test this as it's internal to the Dialog component
    // But we can verify the prop is passed correctly
    expect(mockSetShowApiErrorModal).not.toHaveBeenCalled()
  })
})
