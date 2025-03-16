import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiKeyInput } from '../ApiKeyInput'

describe('ApiKeyInput', () => {
  const onApiKeyChangeMock = vi.fn()
  
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      clear: () => {
        store = {}
      }
    }
  })()
  
  // Replace global localStorage with mock
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })
  
  it('renders correctly with default values', () => {
    render(<ApiKeyInput onApiKeyChange={onApiKeyChangeMock} />)
    
    // Check label
    expect(screen.getByText('OpenAI API Key')).toBeInTheDocument()
    
    // Check input field
    const inputField = screen.getByPlaceholderText('Enter your OpenAI API key') as HTMLInputElement
    expect(inputField).toBeInTheDocument()
    expect(inputField.value).toBe('')
    expect(inputField.type).toBe('password') // Should be hidden by default
    
    // Check visibility toggle button
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    // Check disclaimer text
    expect(screen.getByText('Your API key is stored locally in your browser and never sent to our servers.')).toBeInTheDocument()
  })
  
  it('renders with initial API key', () => {
    render(<ApiKeyInput onApiKeyChange={onApiKeyChangeMock} initialApiKey="test-api-key" />)
    
    const inputField = screen.getByPlaceholderText('Enter your OpenAI API key') as HTMLInputElement
    expect(inputField.value).toBe('test-api-key')
  })
  
  it('loads API key from localStorage on mount', () => {
    // Set up localStorage with a saved API key
    localStorageMock.getItem.mockReturnValueOnce('saved-api-key')
    
    render(<ApiKeyInput onApiKeyChange={onApiKeyChangeMock} />)
    
    // Input should have the value from localStorage
    const inputField = screen.getByPlaceholderText('Enter your OpenAI API key') as HTMLInputElement
    expect(inputField.value).toBe('saved-api-key')
    
    // onApiKeyChange should be called with the saved key
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('saved-api-key')
  })
  
  it('saves API key to localStorage when changed', () => {
    render(<ApiKeyInput onApiKeyChange={onApiKeyChangeMock} />)
    
    // Change the API key
    const inputField = screen.getByPlaceholderText('Enter your OpenAI API key')
    fireEvent.change(inputField, { target: { value: 'new-api-key' } })
    
    // Check that localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith('openai_api_key', 'new-api-key')
    
    // Check that onApiKeyChange was called
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('new-api-key')
  })
  
  it('toggles visibility when button is clicked', () => {
    render(<ApiKeyInput onApiKeyChange={onApiKeyChangeMock} initialApiKey="test-api-key" />)
    
    // Input should be password type initially
    let inputField = screen.getByPlaceholderText('Enter your OpenAI API key') as HTMLInputElement
    expect(inputField.type).toBe('password')
    
    // Click the visibility toggle button
    fireEvent.click(screen.getByRole('button'))
    
    // Input should now be text type
    inputField = screen.getByPlaceholderText('Enter your OpenAI API key') as HTMLInputElement
    expect(inputField.type).toBe('text')
    
    // Click the button again
    fireEvent.click(screen.getByRole('button'))
    
    // Input should be password type again
    inputField = screen.getByPlaceholderText('Enter your OpenAI API key') as HTMLInputElement
    expect(inputField.type).toBe('password')
  })
  
  it('calls onApiKeyChange when input changes', () => {
    render(<ApiKeyInput onApiKeyChange={onApiKeyChangeMock} />)
    
    // Change the API key
    const inputField = screen.getByPlaceholderText('Enter your OpenAI API key')
    fireEvent.change(inputField, { target: { value: 'test-key-123' } })
    
    // Check that onApiKeyChange was called with the new value
    expect(onApiKeyChangeMock).toHaveBeenCalledWith('test-key-123')
  })
})
