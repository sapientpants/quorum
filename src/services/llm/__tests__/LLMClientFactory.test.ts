import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLLMClient } from '../LLMClientFactory'
import { LLMError } from '../LLMError'
import type { LLMProviderId } from '../../../types/llm'

// Mock the LLM clients
vi.mock('../openaiClient', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    getAvailableModels: vi.fn().mockReturnValue(['gpt-4', 'gpt-3.5-turbo']),
    getDefaultModel: vi.fn().mockReturnValue('gpt-3.5-turbo'),
    getProviderName: vi.fn().mockReturnValue('OpenAI'),
    supportsStreaming: vi.fn().mockReturnValue(true),
    getCapabilities: vi.fn().mockReturnValue({
      supportsStreaming: true,
      supportsSystemMessages: true,
      maxContextLength: 4000,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsTool: true
    })
  }))
}))

vi.mock('../anthropicClient', () => ({
  AnthropicClient: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    getAvailableModels: vi.fn().mockReturnValue(['claude-3-opus', 'claude-3-sonnet']),
    getDefaultModel: vi.fn().mockReturnValue('claude-3-sonnet'),
    getProviderName: vi.fn().mockReturnValue('Anthropic'),
    supportsStreaming: vi.fn().mockReturnValue(true)
  }))
}))

vi.mock('../grokClient', () => ({
  GrokClient: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    getAvailableModels: vi.fn().mockReturnValue(['grok-1']),
    getDefaultModel: vi.fn().mockReturnValue('grok-1'),
    getProviderName: vi.fn().mockReturnValue('Grok'),
    supportsStreaming: vi.fn().mockReturnValue(true)
  }))
}))

vi.mock('../googleClient', () => ({
  GoogleClient: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    getAvailableModels: vi.fn().mockReturnValue(['gemini-pro']),
    getDefaultModel: vi.fn().mockReturnValue('gemini-pro'),
    getProviderName: vi.fn().mockReturnValue('Google'),
    supportsStreaming: vi.fn().mockReturnValue(true)
  }))
}))

// Mock the validateApiKey function
vi.mock('../../apiKeyService', () => ({
  validateApiKey: vi.fn().mockReturnValue({ isValid: true })
}))

// Mock fetch for API key validation
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({})
  } as Response)
)

// Mock console.error to prevent it from cluttering the test output
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('LLMClientFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('returns an OpenAI client when provider is openai', () => {
    const client = getLLMClient('openai')
    
    expect(client).toBeDefined()
    expect(client.getProviderName()).toBe('OpenAI')
    expect(client.getAvailableModels()).toContain('gpt-4')
    expect(client.getDefaultModel()).toBe('gpt-3.5-turbo')
    expect(client.supportsStreaming()).toBe(true)
  })
  
  it('returns an Anthropic client when provider is anthropic', () => {
    const client = getLLMClient('anthropic')
    
    expect(client).toBeDefined()
    expect(client.getProviderName()).toBe('Anthropic')
    expect(client.getAvailableModels()).toContain('claude-3-opus')
    expect(client.getDefaultModel()).toBe('claude-3-sonnet')
    expect(client.supportsStreaming()).toBe(true)
  })
  
  it('returns a Grok client when provider is grok', () => {
    const client = getLLMClient('grok')
    
    expect(client).toBeDefined()
    expect(client.getProviderName()).toBe('Grok')
    expect(client.getAvailableModels()).toContain('grok-1')
    expect(client.getDefaultModel()).toBe('grok-1')
    expect(client.supportsStreaming()).toBe(true)
  })
  
  it('returns a Google client when provider is google', () => {
    const client = getLLMClient('google')
    
    expect(client).toBeDefined()
    expect(client.getProviderName()).toBe('Google')
    expect(client.getAvailableModels()).toContain('gemini-pro')
    expect(client.getDefaultModel()).toBe('gemini-pro')
    expect(client.supportsStreaming()).toBe(true)
  })
  
  it('throws an error when provider is not implemented', () => {
    expect(() => getLLMClient('unknown' as LLMProviderId)).toThrow(LLMError)
    expect(() => getLLMClient('unknown' as LLMProviderId)).toThrow('LLM client for provider unknown not implemented')
  })
  
  it('caches clients for repeated calls', () => {
    const client1 = getLLMClient('openai')
    const client2 = getLLMClient('openai')
    
    expect(client1).toBe(client2) // Same instance
  })
  
  it('enhances clients with missing capabilities', async () => {
    // The Anthropic client mock doesn't have getCapabilities
    const client = getLLMClient('anthropic')
    
    // Check that the enhanced client has getCapabilities
    expect(client.getCapabilities).toBeDefined()
    
    // Check that the capabilities are correct
    const capabilities = client.getCapabilities()
    expect(capabilities.supportsStreaming).toBe(true)
    expect(capabilities.supportsSystemMessages).toBe(true)
    expect(capabilities.maxContextLength).toBe(4000)
    expect(capabilities.supportsFunctionCalling).toBe(false) // Only OpenAI supports function calling
    expect(capabilities.supportsVision).toBe(true) // Anthropic supports vision
  })
  
  it('enhances clients with validateApiKey method', async () => {
    // The Anthropic client mock doesn't have validateApiKey
    const client = getLLMClient('anthropic')
    
    // Check that the enhanced client has validateApiKey
    expect(client.validateApiKey).toBeDefined()
    
    // Check that validateApiKey works
    const result = await client.validateApiKey('test-key')
    expect(result).toBe(true)
    
    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/models',
      { headers: { 'x-api-key': 'test-key' } }
    )
  })
  
  it('handles API validation failures', async () => {
    // Mock fetch to return an error
    vi.mocked(fetch).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)
    )
    
    const client = getLLMClient('openai')
    const result = await client.validateApiKey('invalid-key')
    
    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalled()
  })
  
  it('handles network errors during API validation', async () => {
    // Mock fetch to throw an error
    vi.mocked(fetch).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    )
    
    const client = getLLMClient('openai')
    const result = await client.validateApiKey('test-key')
    
    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalled()
  })
})
