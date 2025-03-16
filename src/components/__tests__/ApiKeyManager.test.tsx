import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyManager from '../ApiKeyManager'
import { loadApiKeys, saveApiKeys } from '../../services/apiKeyService'
import type { LLMProviderId } from '../../types/llm'

// Mock the API key service functions
vi.mock('../../services/apiKeyService', () => ({
  loadApiKeys: vi.fn().mockReturnValue([]),
  saveApiKeys: vi.fn(),
  createApiKey: vi.fn((provider, key) => ({
    id: 'test-id',
    provider,
    key,
    isVisible: false
  })),
  clearApiKeys: vi.fn()
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'settings.apiKeyManager.openaiDescription': 'Required for GPT-4o and GPT-4.5 models',
        'settings.apiKeyManager.anthropicDescription': 'Required for Claude models',
        'settings.apiKeyManager.googleDescription': 'Required for Gemini models',
        'settings.apiKeyManager.grokDescription': 'Required for Grok models',
        'settings.apiKeyManager.enterApiKey': 'Enter your API key',
        'settings.apiKeyManager.clearAllKeys': 'Clear All Keys',
        'settings.apiKeyManager.saved': 'Saved',
        'settings.apiKeyManager.showKey': 'Show API key',
        'settings.apiKeyManager.hideKey': 'Hide API key',
        'settings.apiKeyManager.keyPresent': 'API key is set',
        'common.loading': 'Loading...'
      }
      return translations[key] || key
    }
  })
}))

// Mock iconify
vi.mock('@iconify/react', () => ({
  Icon: () => <span />
}))

// Get the mocked functions with proper typing
const mockedLoadApiKeys = vi.mocked(loadApiKeys)
const mockedSaveApiKeys = vi.mocked(saveApiKeys)

describe('ApiKeyManager', () => {
  const onApiKeyChangeMock = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementations
    mockedLoadApiKeys.mockReturnValue([])
    // Clear localStorage/sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })
  
  it('renders correctly', () => {
    render(<ApiKeyManager onApiKeyChange={onApiKeyChangeMock} />)
    
    // Check that the component renders with the provider labels
    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('Anthropic')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Grok')).toBeInTheDocument()
    
    // Check that the clear all button is present
    expect(screen.getByText('Clear All Keys')).toBeInTheDocument()
  })
  
  it('allows entering API keys directly', () => {
    render(<ApiKeyManager onApiKeyChange={onApiKeyChangeMock} />)
    
    // Find the OpenAI input field
    const openaiInput = screen.getByLabelText('OpenAI')
    
    // Enter an API key
    fireEvent.change(openaiInput, { target: { value: 'sk-test-key' } })
    
    // Check that onApiKeyChange was called with the correct arguments
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('openai', 'sk-test-key')
    
    // Check that saveApiKeys was called
    expect(mockedSaveApiKeys).toHaveBeenCalled()
  })
  
  it('loads saved API keys on mount', () => {
    // Setup mock to return some API keys
    const mockApiKeys = [
      { id: '1', provider: 'openai' as LLMProviderId, key: 'openai-key', isVisible: false },
      { id: '2', provider: 'anthropic' as LLMProviderId, key: 'anthropic-key', isVisible: false }
    ]
    
    mockedLoadApiKeys.mockReturnValueOnce(mockApiKeys)
    
    render(<ApiKeyManager onApiKeyChange={onApiKeyChangeMock} />)
    
    // Check that onApiKeyChange was called for each provider
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('openai', 'openai-key')
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('anthropic', 'anthropic-key')
  })
  
  it('uses the provided storage option', () => {
    // Render with session storage option
    render(
      <ApiKeyManager 
        onApiKeyChange={onApiKeyChangeMock} 
        storageOption={{ storage: 'session' }}
      />
    )
    
    // Find the OpenAI input field
    const openaiInput = screen.getByLabelText('OpenAI')
    
    // Enter an API key
    fireEvent.change(openaiInput, { target: { value: 'sk-test-key' } })
    
    // Check that the correct storage option was passed
    expect(mockedSaveApiKeys).toHaveBeenCalledWith(
      expect.any(Array),
      { storage: 'session' }
    )
  })
})
