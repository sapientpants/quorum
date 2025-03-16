import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  validateApiKey, 
  saveApiKeys, 
  loadApiKeys, 
  createApiKey, 
  clearApiKeys 
} from '../apiKeyService'
import type { ApiKey, ApiKeyStorageOptions } from '../../types/api'
import type { LLMProviderId } from '../../types/llm'
import { API_KEY_STORAGE_KEY } from '../../types/api'

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id-123'
}))

describe('apiKeyService', () => {
  // Create separate mocks for localStorage and sessionStorage
  const createStorageMock = () => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      })
    }
  }
  
  const localStorageMock = createStorageMock()
  const sessionStorageMock = createStorageMock()

  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks()
    
    // Mock localStorage and sessionStorage with separate mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })
    
    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    
    // Reset the mock implementations
    vi.resetAllMocks()
  })

  describe('validateApiKey', () => {
    it('should reject empty keys', () => {
      const result = validateApiKey('openai', '')
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('cannot be empty')
    })

    it('should validate OpenAI keys correctly', () => {
      // Valid OpenAI key (51 chars)
      const validKey = 'sk-' + 'a'.repeat(48)
      const result = validateApiKey('openai', validKey)
      expect(result.isValid).toBe(true)

      // Valid OpenAI project key (164 chars)
      // Note: The actual implementation expects 164 chars total, not 164 chars after the prefix
      const validProjectKey = 'sk-proj-' + 'a'.repeat(156)
      const projectResult = validateApiKey('openai', validProjectKey)
      expect(projectResult.isValid).toBe(true)

      // Invalid OpenAI key (wrong prefix)
      const invalidKey1 = 'invalid-' + 'a'.repeat(45)
      const result1 = validateApiKey('openai', invalidKey1)
      expect(result1.isValid).toBe(false)
      expect(result1.message).toContain('Invalid OpenAI API key format')

      // Invalid OpenAI key (wrong length)
      const invalidKey2 = 'sk-' + 'a'.repeat(20)
      const result2 = validateApiKey('openai', invalidKey2)
      expect(result2.isValid).toBe(false)
      expect(result2.message).toContain('Invalid OpenAI API key format')
    })

    it('should validate Anthropic keys correctly', () => {
      // Valid Anthropic key
      const validKey = 'sk-ant-' + 'a'.repeat(40)
      const result = validateApiKey('anthropic', validKey)
      expect(result.isValid).toBe(true)

      // Invalid Anthropic key (wrong prefix)
      const invalidKey1 = 'invalid-' + 'a'.repeat(40)
      const result1 = validateApiKey('anthropic', invalidKey1)
      expect(result1.isValid).toBe(false)
      expect(result1.message).toContain('Invalid Anthropic API key format')

      // Invalid Anthropic key (too short)
      const invalidKey2 = 'sk-ant-' + 'a'.repeat(10)
      const result2 = validateApiKey('anthropic', invalidKey2)
      expect(result2.isValid).toBe(false)
      expect(result2.message).toContain('Invalid Anthropic API key format')
    })

    it('should validate Grok keys correctly', () => {
      // Valid Grok key
      const validKey = 'grok-' + 'a'.repeat(40)
      const result = validateApiKey('grok', validKey)
      expect(result.isValid).toBe(true)

      // Invalid Grok key (wrong prefix)
      const invalidKey1 = 'invalid-' + 'a'.repeat(40)
      const result1 = validateApiKey('grok', invalidKey1)
      expect(result1.isValid).toBe(false)
      expect(result1.message).toContain('Invalid Grok API key format')

      // Invalid Grok key (too short)
      const invalidKey2 = 'grok-' + 'a'.repeat(10)
      const result2 = validateApiKey('grok', invalidKey2)
      expect(result2.isValid).toBe(false)
      expect(result2.message).toContain('Invalid Grok API key format')
    })

    it('should validate Google keys correctly', () => {
      // Valid Google key
      const validKey = 'a'.repeat(40)
      const result = validateApiKey('google', validKey)
      expect(result.isValid).toBe(true)

      // Invalid Google key (too short)
      const invalidKey = 'a'.repeat(30)
      const result1 = validateApiKey('google', invalidKey)
      expect(result1.isValid).toBe(false)
      expect(result1.message).toContain('Invalid Google AI API key format')
    })

    it('should validate unknown provider keys with basic checks', () => {
      // Valid unknown provider key (at least 30 chars)
      const validKey = 'a'.repeat(30)
      const result = validateApiKey('unknown-provider', validKey)
      expect(result.isValid).toBe(true)

      // Invalid unknown provider key (too short)
      const invalidKey = 'a'.repeat(20)
      const result1 = validateApiKey('unknown-provider', invalidKey)
      expect(result1.isValid).toBe(false)
      expect(result1.message).toContain('API key seems too short')
    })
  })

  describe('saveApiKeys', () => {
    it('should save API keys to localStorage by default', () => {
      const apiKeys: ApiKey[] = [
        { id: '1', provider: 'openai', key: 'test-key-1' },
        { id: '2', provider: 'anthropic', key: 'test-key-2' }
      ]
      
      saveApiKeys(apiKeys)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        API_KEY_STORAGE_KEY, 
        JSON.stringify(apiKeys)
      )
      expect(sessionStorage.setItem).not.toHaveBeenCalled()
    })

    it('should save API keys to sessionStorage when specified', () => {
      const apiKeys: ApiKey[] = [
        { id: '1', provider: 'openai', key: 'test-key-1' }
      ]
      
      const options: ApiKeyStorageOptions = { storage: 'session' }
      saveApiKeys(apiKeys, options)
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        API_KEY_STORAGE_KEY, 
        JSON.stringify(apiKeys)
      )
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should not save API keys when storage is set to none', () => {
      const apiKeys: ApiKey[] = [
        { id: '1', provider: 'openai', key: 'test-key-1' }
      ]
      
      const options: ApiKeyStorageOptions = { storage: 'none' }
      saveApiKeys(apiKeys, options)
      
      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(sessionStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('loadApiKeys', () => {
    it('should load API keys from localStorage by default', () => {
      const apiKeys: ApiKey[] = [
        { id: '1', provider: 'openai', key: 'test-key-1' },
        { id: '2', provider: 'anthropic', key: 'test-key-2' }
      ]
      
      localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(apiKeys))
      
      const result = loadApiKeys()
      
      expect(localStorage.getItem).toHaveBeenCalledWith(API_KEY_STORAGE_KEY)
      expect(result).toEqual(apiKeys)
    })

    it('should load API keys from sessionStorage when specified', () => {
      const apiKeys: ApiKey[] = [
        { id: '1', provider: 'openai', key: 'test-key-1' }
      ]
      
      sessionStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(apiKeys))
      
      const options: ApiKeyStorageOptions = { storage: 'session' }
      const result = loadApiKeys(options)
      
      expect(sessionStorage.getItem).toHaveBeenCalledWith(API_KEY_STORAGE_KEY)
      expect(result).toEqual(apiKeys)
    })

    it('should return an empty array when no keys are found', () => {
      const result = loadApiKeys()
      
      expect(result).toEqual([])
    })

    it('should return an empty array when storage is set to none', () => {
      const options: ApiKeyStorageOptions = { storage: 'none' }
      const result = loadApiKeys(options)
      
      expect(result).toEqual([])
      expect(localStorage.getItem).not.toHaveBeenCalled()
      expect(sessionStorage.getItem).not.toHaveBeenCalled()
    })

    it('should handle JSON parsing errors', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem(API_KEY_STORAGE_KEY, 'invalid-json')
      
      const result = loadApiKeys()
      
      expect(console.error).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('createApiKey', () => {
    it('should create a new API key object with the correct structure', () => {
      const provider: LLMProviderId = 'openai'
      const key = 'test-api-key'
      
      const result = createApiKey(provider, key)
      
      expect(result).toEqual({
        id: 'test-id-123', // From mocked nanoid
        provider,
        key,
        isVisible: false
      })
    })
  })

  describe('clearApiKeys', () => {
    it('should clear API keys from localStorage by default', () => {
      clearApiKeys()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith(API_KEY_STORAGE_KEY)
      expect(sessionStorage.removeItem).not.toHaveBeenCalled()
    })

    it('should clear API keys from sessionStorage when specified', () => {
      const options: ApiKeyStorageOptions = { storage: 'session' }
      clearApiKeys(options)
      
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(API_KEY_STORAGE_KEY)
      expect(localStorage.removeItem).not.toHaveBeenCalled()
    })

    it('should not clear API keys when storage is set to none', () => {
      const options: ApiKeyStorageOptions = { storage: 'none' }
      clearApiKeys(options)
      
      expect(localStorage.removeItem).not.toHaveBeenCalled()
      expect(sessionStorage.removeItem).not.toHaveBeenCalled()
    })
  })
})
