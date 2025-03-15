import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyManager from './ApiKeyManager'
import { loadApiKeys, saveApiKeys } from '../services/apiKeyService'
import type { LLMProviderId } from '../types/llm'

// Mock the API key service functions
vi.mock('../services/apiKeyService', () => ({
  validateApiKey: vi.fn().mockReturnValue({ isValid: true }),
  loadApiKeys: vi.fn().mockReturnValue([]),
  saveApiKeys: vi.fn(),
  createApiKey: vi.fn((provider, key, label) => ({
    id: 'test-id',
    provider,
    key,
    label: label || `${provider} API Key`,
    isVisible: false
  })),
  clearApiKeys: vi.fn()
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'settings.apiKeyManager.title': 'API Key Management',
        'settings.apiKeyManager.description': 'Enter your API keys for the language model providers you want to use.',
        'settings.apiKeyManager.addNewApiKey': 'Add New API Key',
        'settings.apiKeyManager.provider': 'Provider',
        'settings.apiKeyManager.apiKey': 'API Key',
        'settings.apiKeyManager.addKey': 'Add Key',
        'settings.apiKeyManager.enterApiKey': 'Enter your {{provider}} API key',
        'settings.apiKeyManager.noKeysConfigured': 'No API keys configured yet.'
      }
      return translations[key] || key
    }
  })
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
    
    // Check that the component renders with the correct title
    expect(screen.getByText('API Key Management')).toBeInTheDocument()
    expect(screen.getByText('Add New API Key')).toBeInTheDocument()
  })
  
  it('allows adding a new API key', () => {
    render(<ApiKeyManager onApiKeyChange={onApiKeyChangeMock} />)
    
    // Click the "Add New API Key" button
    fireEvent.click(screen.getByText('Add New API Key'))
    
    // Check that the form appears
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('API Key')).toBeInTheDocument()
    
    // Select a provider
    const providerSelect = screen.getByRole('combobox')
    fireEvent.change(providerSelect, { target: { value: 'anthropic' } })
    
    // Enter an API key
    const keyInput = screen.getByPlaceholderText('Enter your anthropic API key')
    fireEvent.change(keyInput, { target: { value: 'test-api-key' } })
    
    // Click the "Add Key" button
    fireEvent.click(screen.getByText('Add Key'))
    
    // Check that onApiKeyChange was called with the correct arguments
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('anthropic', 'test-api-key')
    
    // Check that saveApiKeys was called
    expect(mockedSaveApiKeys).toHaveBeenCalled()
  })
  
  it('loads saved API keys on mount', () => {
    // Setup mock to return some API keys
    const mockApiKeys = [
      { id: '1', provider: 'openai' as LLMProviderId, key: 'openai-key', label: 'OpenAI Key', isVisible: false },
      { id: '2', provider: 'anthropic' as LLMProviderId, key: 'anthropic-key', label: 'Anthropic Key', isVisible: false }
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
    
    // Click the "Add New API Key" button
    fireEvent.click(screen.getByText('Add New API Key'))
    
    // Enter and save a key
    const keyInput = screen.getByPlaceholderText('Enter your openai API key')
    fireEvent.change(keyInput, { target: { value: 'test-key' } })
    fireEvent.click(screen.getByText('Add Key'))
    
    // Check that the correct storage option was passed
    expect(mockedSaveApiKeys).toHaveBeenCalledWith(
      expect.any(Array),
      { storage: 'session' }
    )
  })
})
