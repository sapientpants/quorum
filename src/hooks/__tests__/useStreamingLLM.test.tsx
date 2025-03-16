/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStreamingLLM } from '../useStreamingLLM'
import { OpenAIStreamClient } from '../../services/llm/openaiStreamClient'
import { LLMError, ErrorType } from '../../services/llm/LLMError'
import type { Message } from '../../types/chat'

// Mock the OpenAIStreamClient
vi.mock('../../services/llm/openaiStreamClient', () => ({
  OpenAIStreamClient: vi.fn().mockImplementation(() => ({
    streamMessage: vi.fn(),
    providerName: 'openai',
    defaultModelName: 'gpt-4',
    availableModels: ['gpt-4', 'gpt-3.5-turbo'],
    capabilities: {
      streaming: true,
      systemPrompt: true,
      functionCalling: true
    }
  }))
}))

describe('useStreamingLLM', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: 'user',
      text: 'Hello',
      timestamp: 1000
    }
  ]
  
  const mockProvider = 'openai'
  const mockApiKey = 'test-api-key'
  const mockModel = 'gpt-4'
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('initializes with default state', () => {
    const { result } = renderHook(() => useStreamingLLM())
    
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.streamMessage).toBe('function')
    expect(typeof result.current.abortStream).toBe('function')
  })
  
  it('handles missing provider error', async () => {
    const { result } = renderHook(() => useStreamingLLM())
    
    const onErrorMock = vi.fn()
    
    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        '' as any, // Empty provider - cast to any to bypass type checking for test
        mockApiKey,
        mockModel,
        undefined,
        { onError: onErrorMock }
      )
      
      expect(response).toBeNull()
    })
    
    expect(result.current.error).toBeInstanceOf(LLMError)
    expect(result.current.error?.type).toBe(ErrorType.INVALID_PROVIDER)
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError))
  })
  
  it('handles missing API key error', async () => {
    const { result } = renderHook(() => useStreamingLLM())
    
    const onErrorMock = vi.fn()
    
    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        mockProvider,
        '', // Empty API key
        mockModel,
        undefined,
        { onError: onErrorMock }
      )
      
      expect(response).toBeNull()
    })
    
    expect(result.current.error).toBeInstanceOf(LLMError)
    expect(result.current.error?.type).toBe(ErrorType.MISSING_API_KEY)
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError))
  })
  
  it('handles unsupported provider error', async () => {
    const { result } = renderHook(() => useStreamingLLM())
    
    const onErrorMock = vi.fn()
    
    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        'anthropic', // Unsupported provider
        mockApiKey,
        mockModel,
        undefined,
        { onError: onErrorMock }
      )
      
      expect(response).toBeNull()
    })
    
    expect(result.current.error).toBeInstanceOf(LLMError)
    expect(result.current.error?.type).toBe(ErrorType.INVALID_PROVIDER)
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError))
  })
  
  it('streams messages successfully', async () => {
    // Mock the streamMessage function to return an async iterable
    const mockStreamMessage = vi.fn().mockImplementation(() => {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { token: 'Hello', done: false }
          yield { token: ' world', done: false }
          yield { token: '!', done: true }
        }
      }
    })
    
    // Set up the mock implementation
    vi.mocked(OpenAIStreamClient).mockImplementation(() => ({
      streamMessage: mockStreamMessage,
      providerName: 'openai',
      defaultModelName: 'gpt-4',
      availableModels: ['gpt-4', 'gpt-3.5-turbo'],
      capabilities: {
        streaming: true,
        systemPrompt: true,
        functionCalling: true
      }
    } as any))
    
    const { result } = renderHook(() => useStreamingLLM())
    
    const onTokenMock = vi.fn()
    const onCompleteMock = vi.fn()
    
    await act(async () => {
      // During streaming, isStreaming should be true
      expect(result.current.isStreaming).toBe(false)
      
      const response = await result.current.streamMessage(
        mockMessages,
        mockProvider,
        mockApiKey,
        mockModel,
        undefined,
        {
          onToken: onTokenMock,
          onComplete: onCompleteMock
        }
      )
      
      // After streaming, isStreaming should be false
      expect(result.current.isStreaming).toBe(false)
      
      // Check the response
      expect(response).toBe('Hello world!')
    })
    
    // Check that the client was created with the correct API key
    expect(OpenAIStreamClient).toHaveBeenCalledWith({ apiKey: mockApiKey })
    
    // Check that streamMessage was called with the correct arguments
    expect(mockStreamMessage).toHaveBeenCalledWith(
      mockMessages,
      mockApiKey,
      mockModel,
      undefined,
      expect.any(AbortSignal)
    )
    
    // Check that the callbacks were called
    expect(onTokenMock).toHaveBeenCalledTimes(3)
    expect(onTokenMock).toHaveBeenNthCalledWith(1, 'Hello')
    expect(onTokenMock).toHaveBeenNthCalledWith(2, ' world')
    expect(onTokenMock).toHaveBeenNthCalledWith(3, '!')
    
    expect(onCompleteMock).toHaveBeenCalledWith('Hello world!')
  })
  
  it('handles stream errors', async () => {
    // Mock the streamMessage function to throw an error
    const mockError = new Error('Stream error')
    const mockStreamMessage = vi.fn().mockImplementation(() => {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { token: 'Hello', done: false }
          yield { error: mockError }
        }
      }
    })
    
    // Set up the mock implementation
    vi.mocked(OpenAIStreamClient).mockImplementation(() => ({
      streamMessage: mockStreamMessage,
      providerName: 'openai',
      defaultModelName: 'gpt-4',
      availableModels: ['gpt-4', 'gpt-3.5-turbo'],
      capabilities: {
        streaming: true,
        systemPrompt: true,
        functionCalling: true
      }
    } as any))
    
    const { result } = renderHook(() => useStreamingLLM())
    
    const onTokenMock = vi.fn()
    const onErrorMock = vi.fn()
    
    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        mockProvider,
        mockApiKey,
        mockModel,
        undefined,
        {
          onToken: onTokenMock,
          onError: onErrorMock
        }
      )
      
      expect(response).toBeNull()
    })
    
    // Check that the error was set
    expect(result.current.error).toBeInstanceOf(LLMError)
    expect(result.current.error?.message).toBe('Stream error')
    
    // Check that the callbacks were called
    expect(onTokenMock).toHaveBeenCalledWith('Hello')
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError))
  })
  
  it('aborts the stream', async () => {
    // Create a mock abort controller
    const mockAbort = vi.fn()
    global.AbortController = vi.fn().mockImplementation(() => ({
      signal: {},
      abort: mockAbort
    }))
    
    const { result } = renderHook(() => useStreamingLLM())
    
    // Start streaming (but don't await it)
    act(() => {
      result.current.streamMessage(
        mockMessages,
        mockProvider,
        mockApiKey,
        mockModel
      )
    })
    
    // Abort the stream
    act(() => {
      result.current.abortStream()
    })
    
    // Check that abort was called
    expect(mockAbort).toHaveBeenCalled()
    
    // Check that isStreaming was set to false
    expect(result.current.isStreaming).toBe(false)
  })
})
