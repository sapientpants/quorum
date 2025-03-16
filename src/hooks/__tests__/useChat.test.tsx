import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import * as React from 'react'
import { useChat } from '../useChat'
import { ChatContext } from '../../contexts/ChatContextValue'

// Mock the ChatContext value
const mockChatContextValue = {
  // Messages
  messages: [],
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
  isProviderConfigured: vi.fn(),
  isStreamingSupported: vi.fn(),
  supportedProviders: [],
  
  // Settings
  settings: { temperature: 0.7, maxTokens: 2000 },
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

// Mock the useContext hook
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useContext: vi.fn()
  }
})

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(React.useContext).mockReturnValue(mockChatContextValue)
  })

  it('returns the chat context', () => {
    const { result } = renderHook(() => useChat())
    
    expect(result.current).toEqual(mockChatContextValue)
    expect(React.useContext).toHaveBeenCalledWith(ChatContext)
  })

  it('throws an error when used outside of ChatProvider', () => {
    vi.mocked(React.useContext).mockReturnValue(undefined)
    
    expect(() => {
      renderHook(() => useChat())
    }).toThrow('useChat must be used within a ChatProvider')
  })
})
