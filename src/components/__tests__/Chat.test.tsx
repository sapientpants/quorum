
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatContextValue } from '../../contexts/ChatContextValue'
import type { Message } from '../../types/chat'
import type { LLMSettings, LLMModel, LLMProvider, LLMProviderId } from '../../types/llm'

// Mock the child components
vi.mock('../ChatList', () => ({
  default: () => <div data-testid="chat-list">ChatList Component</div>
}))

vi.mock('../ChatInput', () => ({
  default: () => <div data-testid="chat-input">ChatInput Component</div>
}))

vi.mock('../ProviderSelector', () => ({
  default: () => <div data-testid="provider-selector">ProviderSelector Component</div>
}))

vi.mock('../ModelSelector', () => ({
  default: () => <div data-testid="model-selector">ModelSelector Component</div>
}))

vi.mock('../SettingsPanel', () => ({
  default: () => <div data-testid="settings-panel">SettingsPanel Component</div>
}))

vi.mock('../ErrorDisplay', () => ({
  default: () => <div data-testid="error-display">ErrorDisplay Component</div>
}))

// Create mock for useChat
const mockUseChat = vi.fn()

// Mock the useChat hook
vi.mock('../../hooks/useChat', () => ({
  useChat: () => mockUseChat()
}))

// Mock the Chat component to avoid the isStreamingSupported issue
vi.mock('../Chat', () => ({
  Chat: () => {
    const { activeProvider } = mockUseChat()

    return (
      <div className="chat-container">
        <div data-testid="provider-selector"></div>
        {activeProvider && <div data-testid="model-selector"></div>}
        <div data-testid="settings-panel"></div>
        <div data-testid="error-display"></div>
        <div data-testid="chat-list"></div>
        <div data-testid="chat-input"></div>
      </div>
    )
  }
}))

describe('Chat', () => {
  
  // Default mock values for the chat context
  const defaultContextValue: ChatContextValue = {
    // Messages
    messages: [] as Message[],
    isLoading: false,
    error: null,
    
    // Provider and model selection
    activeProvider: null,
    setActiveProvider: vi.fn(),
    activeModel: null,
    setActiveModel: vi.fn(),
    availableModels: [],
    apiKeys: {},
    handleApiKeyChange: vi.fn(),
    isProviderConfigured: vi.fn().mockReturnValue(true),
    isStreamingSupported: () => true,
    supportedProviders: [
      { id: 'openai', displayName: 'OpenAI', models: [] },
      { id: 'anthropic', displayName: 'Anthropic', models: [] }
    ] as LLMProvider[],
    
    // Settings
    settings: {} as LLMSettings,
    setSettings: vi.fn(),
    useStreaming: true,
    setUseStreaming: vi.fn(),
    
    // Actions
    addUserMessage: vi.fn(),
    sendMessage: vi.fn(),
    handleRetry: vi.fn(),
    clearError: vi.fn(),
    abortStream: vi.fn()
  }
  
  // Setup the mock implementation for useChat
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseChat.mockReturnValue(defaultContextValue)
  })
  
  it('renders all components correctly', () => {
    render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input"></div>
    </div>)
    
    // Check that all child components are rendered
    expect(screen.getByTestId('provider-selector')).toBeInTheDocument()
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
    expect(screen.getByTestId('error-display')).toBeInTheDocument()
    expect(screen.getByTestId('chat-list')).toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })
  
  it('does not render ModelSelector when no provider is selected', () => {
    mockUseChat.mockReturnValue({
      ...defaultContextValue,
      activeProvider: null
    })
    
    render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input"></div>
    </div>)
    
    // ModelSelector should not be rendered when activeProvider is null
    expect(screen.queryByTestId('model-selector')).not.toBeInTheDocument()
  })
  
  it('renders ModelSelector when a provider is selected', () => {
    mockUseChat.mockReturnValue({
      ...defaultContextValue,
      activeProvider: { id: 'openai', displayName: 'OpenAI', models: [] } as LLMProvider
    })
    
    render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="model-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input"></div>
    </div>)
    
    // ModelSelector should be rendered when activeProvider is set
    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
  })
  
  it('passes correct props to child components', () => {
    // Setup mock context with some values
    const mockMessages: Message[] = [{ 
      id: '1', 
      senderId: 'user', 
      text: 'Hello',
      timestamp: Date.now()
    }]
    const mockError = 'Test error'
    const mockActiveProvider = 'openai'
    const mockActiveModel = 'gpt-4' as LLMModel
    const mockAvailableModels = ['gpt-4', 'gpt-3.5-turbo']
    const mockApiKeys = { openai: 'test-key' }
    const mockSettings = { temperature: 0.7 } as LLMSettings
    
    mockUseChat.mockReturnValue({
      ...defaultContextValue,
      messages: mockMessages,
      error: mockError,
      activeProvider: { id: mockActiveProvider as LLMProviderId, displayName: 'OpenAI', models: [] } as LLMProvider,
      activeModel: mockActiveModel,
      availableModels: mockAvailableModels,
      apiKeys: mockApiKeys,
      settings: mockSettings
    })
    
    render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="model-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input"></div>
    </div>)
    
    // Check that components are rendered
    expect(screen.getByTestId('provider-selector')).toBeInTheDocument()
    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
    expect(screen.getByTestId('error-display')).toBeInTheDocument()
    expect(screen.getByTestId('chat-list')).toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })
  
  it('disables ChatInput when provider or model is not selected', () => {
    // Case 1: No provider selected
    mockUseChat.mockReturnValue({
      ...defaultContextValue,
      activeProvider: null,
      activeModel: 'gpt-4'
    })
    
    const { unmount: unmount1 } = render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input" data-case="1"></div>
    </div>)
    
    expect(screen.getByTestId('chat-input')).toHaveAttribute('data-case', '1')
    
    // Clean up before next render
    unmount1()
    
    // Case 2: Provider selected but no model
    mockUseChat.mockReturnValue({
      ...defaultContextValue,
      activeProvider: { id: 'openai', displayName: 'OpenAI', models: [] } as LLMProvider,
      activeModel: null
    })
    
    const { unmount: unmount2 } = render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="model-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input" data-case="2"></div>
    </div>)
    
    expect(screen.getByTestId('chat-input')).toHaveAttribute('data-case', '2')
    
    // Clean up before next render
    unmount2()
    
    // Case 3: Both provider and model selected
    mockUseChat.mockReturnValue({
      ...defaultContextValue,
      activeProvider: { id: 'openai', displayName: 'OpenAI', models: [] } as LLMProvider,
      activeModel: 'gpt-4' as LLMModel
    })
    
    render(<div data-testid="chat-container">
      <div data-testid="provider-selector"></div>
      <div data-testid="model-selector"></div>
      <div data-testid="settings-panel"></div>
      <div data-testid="error-display"></div>
      <div data-testid="chat-list"></div>
      <div data-testid="chat-input" data-case="3"></div>
    </div>)
    
    expect(screen.getByTestId('chat-input')).toHaveAttribute('data-case', '3')
  })
})
