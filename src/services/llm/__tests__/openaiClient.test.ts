import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OpenAIClient } from '../openaiClient'
import type { Message } from '../../../types/chat'
import type { LLMSettings, StreamingOptions } from '../../../types/llm'

// Mock fetch
global.fetch = vi.fn()

describe('OpenAIClient', () => {
  let client: OpenAIClient
  
  beforeEach(() => {
    client = new OpenAIClient()
    vi.resetAllMocks()
    
    // Mock console.error to prevent it from cluttering the test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  it('returns the correct provider name', () => {
    expect(client.getProviderName()).toBe('openai')
  })
  
  it('returns the correct available models', () => {
    const models = client.getAvailableModels()
    expect(models).toContain('gpt-4o')
    expect(models).toContain('gpt-4-turbo')
    expect(models).toContain('gpt-3.5-turbo')
  })
  
  it('returns the correct default model', () => {
    expect(client.getDefaultModel()).toBe('gpt-4o')
  })
  
  it('indicates if streaming is supported', () => {
    // This depends on the environment, but we can at least verify it returns a boolean
    expect(typeof client.supportsStreaming()).toBe('boolean')
  })
  
  it('throws an error when sending a message without an API key', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      }
    ]
    
    await expect(client.sendMessage(messages, '')).rejects.toThrow('OpenAI API key is required')
  })
  
  it('converts messages to OpenAI format correctly', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'system',
        text: 'You are a helpful assistant',
        timestamp: Date.now()
      },
      {
        id: '2',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      },
      {
        id: '3',
        senderId: 'assistant',
        text: 'Hi there',
        timestamp: Date.now()
      }
    ]
    
    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'Hello from OpenAI' } }]
      })
    } as Response)
    
    await client.sendMessage(messages, 'test-key')
    
    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        }),
        body: expect.stringContaining('"messages":[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there"}]')
      })
    )
  })
  
  it('sends settings correctly', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      }
    ]
    
    const settings: LLMSettings = {
      temperature: 0.7,
      maxTokens: 100,
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5
    }
    
    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'Hello from OpenAI' } }]
      })
    } as Response)
    
    await client.sendMessage(messages, 'test-key', 'gpt-4o', settings)
    
    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"temperature":0.7,"max_tokens":100,"top_p":0.9,"frequency_penalty":0.5,"presence_penalty":0.5')
      })
    )
  })
  
  it('returns the response content from a standard request', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      }
    ]
    
    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'Hello from OpenAI' } }]
      })
    } as Response)
    
    const response = await client.sendMessage(messages, 'test-key')
    
    expect(response).toBe('Hello from OpenAI')
  })
  
  it('handles API errors correctly', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      }
    ]
    
    // Mock an error response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({
        error: {
          message: 'Invalid API key'
        }
      })
    } as Response)
    
    await expect(client.sendMessage(messages, 'test-key')).rejects.toThrow('OpenAI API error: 401 Unauthorized')
  })
  
  it('handles network errors correctly', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      }
    ]
    
    // Mock a network error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    
    await expect(client.sendMessage(messages, 'test-key')).rejects.toThrow('Network error')
    expect(console.error).toHaveBeenCalled()
  })
  
  it('handles empty response errors correctly', async () => {
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user',
        text: 'Hello',
        timestamp: Date.now()
      }
    ]
    
    // Mock an empty response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: []
      })
    } as Response)
    
    await expect(client.sendMessage(messages, 'test-key')).rejects.toThrow('No response from OpenAI')
  })
  
  // Skip streaming tests if not in a browser environment
  if (typeof ReadableStream !== 'undefined' && typeof TextDecoder !== 'undefined') {
    it('uses streaming when streamingOptions are provided', async () => {
      const messages: Message[] = [
        {
          id: '1',
          senderId: 'user',
          text: 'Hello',
          timestamp: Date.now()
        }
      ]
      
      const streamingOptions: StreamingOptions = {
        onToken: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn()
      }
      
      // Create a mock readable stream
      const mockReader = {
        read: vi.fn(),
        releaseLock: vi.fn()
      }
      
      // Set up the reader to return chunks of data
      let callCount = 0
      const chunks = [
        { choices: [{ delta: { content: 'Hello' } }] },
        { choices: [{ delta: { content: ' from' } }] },
        { choices: [{ delta: { content: ' OpenAI' } }] }
      ]
      
      mockReader.read.mockImplementation(() => {
        if (callCount < chunks.length) {
          const chunk = chunks[callCount]
          callCount++
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
          })
        } else if (callCount === chunks.length) {
          callCount++
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n')
          })
        } else {
          return Promise.resolve({ done: true })
        }
      })
      
      // Mock a streaming response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: {
          getReader: () => mockReader
        }
      } as unknown as Response)
      
      const response = await client.sendMessage(messages, 'test-key', 'gpt-4o', undefined, streamingOptions)
      
      // Check that the response is correct
      expect(response).toBe('Hello from OpenAI')
      
      // Check that the streaming callbacks were called
      expect(streamingOptions.onToken).toHaveBeenCalledWith('Hello')
      expect(streamingOptions.onToken).toHaveBeenCalledWith(' from')
      expect(streamingOptions.onToken).toHaveBeenCalledWith(' OpenAI')
      expect(streamingOptions.onComplete).toHaveBeenCalledWith('Hello from OpenAI')
      expect(streamingOptions.onError).not.toHaveBeenCalled()
    })
    
    it('calls onError when streaming fails', async () => {
      const messages: Message[] = [
        {
          id: '1',
          senderId: 'user',
          text: 'Hello',
          timestamp: Date.now()
        }
      ]
      
      const streamingOptions: StreamingOptions = {
        onToken: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn()
      }
      
      // Mock a streaming error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error during streaming'))
      
      await expect(client.sendMessage(messages, 'test-key', 'gpt-4o', undefined, streamingOptions)).rejects.toThrow('Network error during streaming')
      
      // Check that the error callback was called
      expect(streamingOptions.onError).toHaveBeenCalled()
    })
    
    it('handles JSON parsing errors in streaming', async () => {
      const messages: Message[] = [
        {
          id: '1',
          senderId: 'user',
          text: 'Hello',
          timestamp: Date.now()
        }
      ]
      
      const streamingOptions: StreamingOptions = {
        onToken: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn()
      }
      
      // Create a mock readable stream
      const mockReader = {
        read: vi.fn(),
        releaseLock: vi.fn()
      }
      
      // Set up the reader to return invalid JSON
      mockReader.read.mockImplementationOnce(() => {
        return Promise.resolve({
          done: false,
          value: new TextEncoder().encode('data: {invalid json}\n\n')
        })
      }).mockImplementationOnce(() => {
        return Promise.resolve({ done: true })
      })
      
      // Mock a streaming response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: {
          getReader: () => mockReader
        }
      } as unknown as Response)
      
      const response = await client.sendMessage(messages, 'test-key', 'gpt-4o', undefined, streamingOptions)
      
      // Check that the response is empty (no valid tokens were received)
      expect(response).toBe('')
      
      // Check that console.warn was called for the JSON parsing error
      expect(console.warn).toHaveBeenCalled()
    })
  }
})
