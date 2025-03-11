import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyManager from './ApiKeyManager'
import { loadApiKeys, saveApiKeys, clearApiKeys } from '../services/apiKeyService'
import type { LLMProvider } from '../types/llm'

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

// Get the mocked functions with proper typing
const mockedLoadApiKeys = vi.mocked(loadApiKeys)
const mockedSaveApiKeys = vi.mocked(saveApiKeys)
const mockedClearApiKeys = vi.mocked(clearApiKeys)

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
      { id: '1', provider: 'openai' as LLMProvider, key: 'openai-key', label: 'OpenAI Key', isVisible: false },
      { id: '2', provider: 'anthropic' as LLMProvider, key: 'anthropic-key', label: 'Anthropic Key', isVisible: false }
    ]
    
    mockedLoadApiKeys.mockReturnValueOnce(mockApiKeys)
    
    render(<ApiKeyManager onApiKeyChange={onApiKeyChangeMock} />)
    
    // Check that onApiKeyChange was called for each provider
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('openai', 'openai-key')
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('anthropic', 'anthropic-key')
  })
  
  it('changes storage type when requested', () => {
    render(<ApiKeyManager onApiKeyChange={onApiKeyChangeMock} />)
    
    // Click the "Session Only" button
    fireEvent.click(screen.getByText('Session Only'))
    
    // Check that clearApiKeys was called
    expect(mockedClearApiKeys).toHaveBeenCalledWith({ storage: 'local' })
    
    // Check that the storage type explanation changed
    expect(screen.getByText('Keys will be saved only for this session and cleared when you close the browser')).toBeInTheDocument()
  })
}) 