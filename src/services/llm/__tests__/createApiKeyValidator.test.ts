import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiKeyValidator } from '../createApiKeyValidator'
import { getLLMClient } from '../LLMClientFactory'
import { LLMError, ErrorType } from '../LLMError'
import type { LLMClient, LLMProviderId } from '../../../types/llm'

// Mock the LLMClientFactory
vi.mock('../LLMClientFactory', () => ({
  getLLMClient: vi.fn()
}))

describe('createApiKeyValidator', () => {
  // Create a mock LLM client
  const mockLLMClient: Partial<LLMClient> = {
    validateApiKey: vi.fn()
  }
  
  beforeEach(() => {
    vi.resetAllMocks()
    // Set up the mock to return our mock client
    vi.mocked(getLLMClient).mockReturnValue(mockLLMClient as LLMClient)
  })
  
  it('should return false for empty provider or API key', async () => {
    const validator = createApiKeyValidator()
    
    // Test with empty provider
    const result1 = await validator.validateKey('' as LLMProviderId, 'test-api-key')
    expect(result1.success).toBe(true)
    if (result1.success) {
      expect(result1.data).toBe(false)
    }
    
    // Test with empty API key
    const result2 = await validator.validateKey('openai', '')
    expect(result2.success).toBe(true)
    if (result2.success) {
      expect(result2.data).toBe(false)
    }
    
    // Verify the client's validateApiKey was not called
    expect(mockLLMClient.validateApiKey).not.toHaveBeenCalled()
  })
  
  it('should return true for valid API key', async () => {
    const validator = createApiKeyValidator()
    
    // Set up the mock to return true for a valid key
    if (mockLLMClient.validateApiKey) {
      vi.mocked(mockLLMClient.validateApiKey).mockResolvedValue(true)
    }
    
    const result = await validator.validateKey('openai', 'valid-api-key')
    
    // Verify the result
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe(true)
    }
    
    // Verify the client was called with the correct parameters
    expect(getLLMClient).toHaveBeenCalledWith('openai')
    expect(mockLLMClient.validateApiKey).toHaveBeenCalledWith('valid-api-key')
  })
  
  it('should return false for invalid API key', async () => {
    const validator = createApiKeyValidator()
    
    // Set up the mock to return false for an invalid key
    if (mockLLMClient.validateApiKey) {
      vi.mocked(mockLLMClient.validateApiKey).mockResolvedValue(false)
    }
    
    const result = await validator.validateKey('openai', 'invalid-api-key')
    
    // Verify the result
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe(false)
    }
    
    // Verify the client was called with the correct parameters
    expect(getLLMClient).toHaveBeenCalledWith('openai')
    expect(mockLLMClient.validateApiKey).toHaveBeenCalledWith('invalid-api-key')
  })
  
  it('should handle errors from the client', async () => {
    const validator = createApiKeyValidator()
    
    // Set up the mock to throw an error
    if (mockLLMClient.validateApiKey) {
      vi.mocked(mockLLMClient.validateApiKey).mockRejectedValue(new Error('API validation failed'))
    }
    
    // Mock console.error to avoid noise in tests
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = await validator.validateKey('openai', 'test-api-key')
    
    // Verify the result
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe(false)
    }
    
    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error validating API key for openai:')
  })
  
  it('should handle errors from getLLMClient', async () => {
    const validator = createApiKeyValidator()
    
    // Set up the mock to throw an error
    vi.mocked(getLLMClient).mockImplementation(() => {
      throw new LLMError(ErrorType.INVALID_PROVIDER, 'Provider not supported')
    })
    
    const result = await validator.validateKey('unsupported' as LLMProviderId, 'test-api-key')
    
    // Verify the result is success: true but data: false
    // This is because the error is caught in the try/catch block inside validateKey
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe(false)
    }
    
    // We can't check the specific error type/message because it's caught and converted to a boolean result
  })
})
