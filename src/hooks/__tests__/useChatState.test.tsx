import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatState } from '../useChatState'
import type { Message } from '../../types/chat'
import type { LLMProviderId } from '../../types/llm'

// Mock nanoid to return predictable IDs
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id')
}))

describe('useChatState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('initializes with default welcome message when no initial messages are provided', () => {
    const { result } = renderHook(() => useChatState())
    
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual({
      id: '1',
      senderId: 'system',
      text: 'Welcome to Quorum! Please select a provider and add an API key to start chatting.',
      timestamp: expect.any(Number)
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
  
  it('initializes with provided initial messages', () => {
    const initialMessages: Message[] = [
      {
        id: 'initial-1',
        senderId: 'user',
        text: 'Hello',
        timestamp: 1000
      }
    ]
    
    const { result } = renderHook(() => useChatState(initialMessages))
    
    expect(result.current.messages).toEqual(initialMessages)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
  
  it('adds a user message', () => {
    const { result } = renderHook(() => useChatState())
    
    act(() => {
      result.current.addUserMessage('Hello, AI!')
    })
    
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toEqual({
      id: 'test-id',
      senderId: 'user',
      text: 'Hello, AI!',
      timestamp: expect.any(Number)
    })
  })
  
  it('does not add empty user messages', () => {
    const { result } = renderHook(() => useChatState())
    
    act(() => {
      result.current.addUserMessage('   ')
    })
    
    expect(result.current.messages).toHaveLength(1) // Still only the welcome message
  })
  
  it('adds an AI message', () => {
    const { result } = renderHook(() => useChatState())
    
    const mockProvider = { id: 'openai' as LLMProviderId, displayName: 'OpenAI', models: [] }
    const mockModel = 'gpt-4'
    
    act(() => {
      result.current.addAIMessage(mockProvider, mockModel)
    })
    
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toEqual({
      id: 'test-id',
      senderId: 'assistant',
      text: '',
      timestamp: expect.any(Number),
      provider: 'openai',
      model: 'gpt-4',
      status: 'sending'
    })
  })
  
  it('updates an AI message', () => {
    const { result } = renderHook(() => useChatState())
    
    const mockProvider = { id: 'openai' as LLMProviderId, displayName: 'OpenAI', models: [] }
    const mockModel = 'gpt-4'
    
    let aiMessageId: string
    
    act(() => {
      aiMessageId = result.current.addAIMessage(mockProvider, mockModel)
    })
    
    act(() => {
      result.current.updateAIMessage(aiMessageId, {
        text: 'Hello, human!',
        status: 'sent'
      })
    })
    
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toEqual({
      id: 'test-id',
      senderId: 'assistant',
      text: 'Hello, human!',
      timestamp: expect.any(Number),
      provider: 'openai',
      model: 'gpt-4',
      status: 'sent'
    })
  })
  
  it('removes a message', () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        senderId: 'system',
        text: 'Welcome',
        timestamp: 1000
      },
      {
        id: '2',
        senderId: 'user',
        text: 'Hello',
        timestamp: 2000
      }
    ]
    
    const { result } = renderHook(() => useChatState(initialMessages))
    
    act(() => {
      result.current.removeMessage('2')
    })
    
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].id).toBe('1')
  })
  
  it('handles retry for error messages', () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: 1000
      },
      {
        id: '2',
        senderId: 'assistant',
        text: 'Error occurred',
        timestamp: 2000,
        status: 'error'
      }
    ]
    
    const { result } = renderHook(() => useChatState(initialMessages))
    
    const mockSendMessage = vi.fn()
    
    act(() => {
      result.current.handleRetry('2', mockSendMessage)
    })
    
    // Check that the error message was removed
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].id).toBe('1')
    
    // Check that the send function was called with the user message
    expect(mockSendMessage).toHaveBeenCalledWith('Hello')
  })
  
  it('does not retry non-error messages', () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: 1000
      },
      {
        id: '2',
        senderId: 'assistant',
        text: 'Hi there',
        timestamp: 2000,
        status: 'sent'
      }
    ]
    
    const { result } = renderHook(() => useChatState(initialMessages))
    
    const mockSendMessage = vi.fn()
    
    act(() => {
      result.current.handleRetry('2', mockSendMessage)
    })
    
    // Check that no messages were removed
    expect(result.current.messages).toHaveLength(2)
    
    // Check that the send function was not called
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
  
  it('sets and clears loading state', () => {
    const { result } = renderHook(() => useChatState())
    
    act(() => {
      result.current.setIsLoading(true)
    })
    
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setIsLoading(false)
    })
    
    expect(result.current.isLoading).toBe(false)
  })
  
  it('sets and clears error state', () => {
    const { result } = renderHook(() => useChatState())
    
    act(() => {
      result.current.setError('Something went wrong')
    })
    
    expect(result.current.error).toBe('Something went wrong')
    
    act(() => {
      result.current.clearError()
    })
    
    expect(result.current.error).toBeNull()
  })
})
