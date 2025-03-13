import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApiKeySetup from './ApiKeySetup'
import { validateApiKey } from '../services/apiKeyService'
import type { ApiKey } from '../types/api'
import type { LLMProvider } from '../types/llm'

// Mock the apiKeyService
vi.mock('../services/apiKeyService', () => ({
  validateApiKey: vi.fn()
}))

describe('ApiKeySetup', () => {
  const onCompleteMock = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    // Reset validateApiKey mock to return valid by default
    vi.mocked(validateApiKey).mockReturnValue({ isValid: true })
  })
  
  it('renders correctly', () => {
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Check that all provider inputs are present
    expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your Google AI API key')).toBeInTheDocument()
    
    // Check that storage options are present
    expect(screen.getByText('Session Storage')).toBeInTheDocument()
    expect(screen.getByText('Local Storage')).toBeInTheDocument()
    expect(screen.getByText('No Storage')).toBeInTheDocument()
  })
  
  it('loads initial keys if provided', () => {
    const initialKeys: ApiKey[] = [
      { id: '1', provider: 'openai' as LLMProvider, key: 'test-openai-key', isVisible: false },
      { id: '2', provider: 'anthropic' as LLMProvider, key: 'test-anthropic-key', isVisible: false }
    ]
    
    render(<ApiKeySetup onComplete={onCompleteMock} initialKeys={initialKeys} />)
    
    // Check that the inputs have the initial values
    expect(screen.getByPlaceholderText('sk-...')).toHaveValue('test-openai-key')
    expect(screen.getByPlaceholderText('sk-ant-...')).toHaveValue('test-anthropic-key')
  })
  
  it('validates that at least one key is provided', async () => {
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Try to submit without any keys
    fireEvent.click(screen.getByText('Continue'))
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('At least one API key is required')).toBeInTheDocument()
    })
    
    // onComplete should not have been called
    expect(onCompleteMock).not.toHaveBeenCalled()
  })
  
  it('validates key format for each provider', async () => {
    // Mock validateApiKey to return invalid for OpenAI
    vi.mocked(validateApiKey).mockImplementation((provider: string) => {
      if (provider === 'openai') {
        return { isValid: false, message: 'Invalid OpenAI key format' }
      }
      return { isValid: true }
    })
    
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Enter an invalid OpenAI key
    fireEvent.change(screen.getByPlaceholderText('sk-...'), {
      target: { value: 'invalid-key' }
    })
    
    // Try to submit
    fireEvent.click(screen.getByText('Continue'))
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid OpenAI key format')).toBeInTheDocument()
    })
    
    // onComplete should not have been called
    expect(onCompleteMock).not.toHaveBeenCalled()
  })
  
  it('stores keys in localStorage when local storage is selected', async () => {
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Select local storage
    fireEvent.click(screen.getByText('Local Storage'))
    
    // Enter an OpenAI key
    fireEvent.change(screen.getByPlaceholderText('sk-...'), {
      target: { value: 'sk-valid-key' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByText('Continue'))
    
    // Check that the key was stored in localStorage
    await waitFor(() => {
      expect(localStorage.getItem('openai_api_key')).toBe('sk-valid-key')
    })
    
    // onComplete should have been called
    expect(onCompleteMock).toHaveBeenCalled()
  })
  
  it('stores keys in sessionStorage when session storage is selected', async () => {
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Session storage is selected by default
    
    // Enter an OpenAI key
    fireEvent.change(screen.getByPlaceholderText('sk-...'), {
      target: { value: 'sk-valid-key' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByText('Continue'))
    
    // Check that the key was stored in sessionStorage
    await waitFor(() => {
      expect(sessionStorage.getItem('openai_api_key')).toBe('sk-valid-key')
    })
    
    // onComplete should have been called
    expect(onCompleteMock).toHaveBeenCalled()
  })
  
  it('does not store keys when no storage is selected', async () => {
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Select no storage
    fireEvent.click(screen.getByText('No Storage'))
    
    // Enter an OpenAI key
    fireEvent.change(screen.getByPlaceholderText('sk-...'), {
      target: { value: 'sk-valid-key' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByText('Continue'))
    
    // Check that the key was not stored
    await waitFor(() => {
      expect(localStorage.getItem('openai_api_key')).toBeNull()
      expect(sessionStorage.getItem('openai_api_key')).toBeNull()
    })
    
    // onComplete should have been called
    expect(onCompleteMock).toHaveBeenCalled()
  })
  
  it('clears errors when user starts typing', () => {
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Try to submit without any keys to trigger error
    fireEvent.click(screen.getByText('Continue'))
    
    // Check that error is shown
    expect(screen.getByText('At least one API key is required')).toBeInTheDocument()
    
    // Start typing in OpenAI key input
    fireEvent.change(screen.getByPlaceholderText('sk-...'), {
      target: { value: 's' }
    })
    
    // Error should be cleared
    expect(screen.queryByText('At least one API key is required')).not.toBeInTheDocument()
  })
  
  it('shows loading state during submission', async () => {
    // Mock validateApiKey to be async
    let resolveValidation: () => void
    const validationPromise = new Promise<void>(resolve => {
      resolveValidation = resolve
    })

    vi.mocked(validateApiKey).mockImplementation(() => {
      resolveValidation()
      return { isValid: true }
    })
    
    render(<ApiKeySetup onComplete={onCompleteMock} />)
    
    // Enter an OpenAI key
    fireEvent.change(screen.getByPlaceholderText('sk-...'), {
      target: { value: 'sk-valid-key' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByText('Continue'))
    
    // Button should be disabled and show loading state
    const button = screen.getByText('Continue')
    expect(button).toBeDisabled()
    expect(button.className).toContain('loading')
    
    // Wait for validation to complete
    await validationPromise
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(button.className).not.toContain('loading')
    })
  })
}) 