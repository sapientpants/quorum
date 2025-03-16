import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatProvider } from '../ChatContext'
import { ChatContext } from '../ChatContextValue'
import { useContext } from 'react'

// Mock the hooks
vi.mock('../../hooks/useChatState', () => ({
  useChatState: vi.fn().mockReturnValue({
    messages: [],
    isLoading: false,
    setIsLoading: vi.fn(),
    error: null,
    setError: vi.fn(),
    addUserMessage: vi.fn(),
    addAIMessage: vi.fn(),
    updateAIMessage: vi.fn(),
    removeMessage: vi.fn(),
    handleRetry: vi.fn(),
    clearError: vi.fn()
  })
}))

vi.mock('../../hooks/useProviderSelection', () => ({
  useProviderSelection: vi.fn().mockReturnValue({
    activeProvider: null,
    setActiveProvider: vi.fn(),
    activeModel: null,
    setActiveModel: vi.fn(),
    availableModels: [],
    apiKeys: {},
    handleApiKeyChange: vi.fn(),
    isProviderConfigured: vi.fn(),
    isStreamingSupported: vi.fn().mockReturnValue(true),
    getSupportedProvidersList: vi.fn().mockReturnValue([
      { id: 'openai', displayName: 'OpenAI', models: [] },
      { id: 'anthropic', displayName: 'Anthropic', models: [] }
    ])
  })
}))

vi.mock('../../hooks/useSettings', () => ({
  useSettings: vi.fn().mockReturnValue({
    settings: { temperature: 0.7 },
    setSettings: vi.fn(),
    useStreaming: true,
    setUseStreaming: vi.fn()
  })
}))

vi.mock('../../hooks/useStreamingLLM', () => ({
  useStreamingLLM: vi.fn().mockReturnValue({
    streamMessage: vi.fn(),
    abortStream: vi.fn()
  })
}))

// Simple test component that consumes the context
function TestComponent() {
  const context = useContext(ChatContext)
  
  if (!context) {
    return <div>Context not available</div>
  }
  
  return (
    <div>
      <div data-testid="loading">{context.isLoading.toString()}</div>
      <div data-testid="error">{context.error || 'no error'}</div>
      <div data-testid="provider">{context.activeProvider?.id || 'no provider'}</div>
      <div data-testid="model">{context.activeModel || 'no model'}</div>
    </div>
  )
}

describe('ChatProvider', () => {
  it('renders children correctly', () => {
    render(
      <ChatProvider>
        <div data-testid="child">Child Component</div>
      </ChatProvider>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
  
  it('provides the context value to children', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    )
    
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('no error')
    expect(screen.getByTestId('provider')).toHaveTextContent('no provider')
    expect(screen.getByTestId('model')).toHaveTextContent('no model')
  })
  
  it('provides all required context properties', () => {
    let contextValue: typeof ChatContext extends React.Context<infer T> ? T | undefined : never
    
    function ContextCapture() {
      contextValue = useContext(ChatContext)
      return null
    }
    
    render(
      <ChatProvider>
        <ContextCapture />
      </ChatProvider>
    )
    
    // Check that all required properties are present
    expect(contextValue).toHaveProperty('messages')
    expect(contextValue).toHaveProperty('isLoading')
    expect(contextValue).toHaveProperty('error')
    expect(contextValue).toHaveProperty('activeProvider')
    expect(contextValue).toHaveProperty('setActiveProvider')
    expect(contextValue).toHaveProperty('activeModel')
    expect(contextValue).toHaveProperty('setActiveModel')
    expect(contextValue).toHaveProperty('availableModels')
    expect(contextValue).toHaveProperty('apiKeys')
    expect(contextValue).toHaveProperty('handleApiKeyChange')
    expect(contextValue).toHaveProperty('isProviderConfigured')
    expect(contextValue).toHaveProperty('isStreamingSupported')
    expect(contextValue).toHaveProperty('supportedProviders')
    expect(contextValue).toHaveProperty('settings')
    expect(contextValue).toHaveProperty('setSettings')
    expect(contextValue).toHaveProperty('useStreaming')
    expect(contextValue).toHaveProperty('setUseStreaming')
    expect(contextValue).toHaveProperty('addUserMessage')
    expect(contextValue).toHaveProperty('sendMessage')
    expect(contextValue).toHaveProperty('handleRetry')
    expect(contextValue).toHaveProperty('clearError')
    expect(contextValue).toHaveProperty('abortStream')
  })
})
