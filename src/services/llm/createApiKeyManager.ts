import type { LLMProviderId } from '../../types/llm'
import type { ApiKeyStorageOptions } from '../../types/api'
import { API_KEY_STORAGE_KEY } from '../../types/api'
import { createApiKeyValidator } from './createApiKeyValidator'
import { Result } from '../../types/result'

interface ApiKeyManager {
  setStorageOption: (option: ApiKeyStorageOptions['storage']) => void
  getStorageOption: () => ApiKeyStorageOptions['storage']
  setKey: (provider: LLMProviderId, key: string) => void
  getKey: (provider: LLMProviderId) => string | undefined
  hasKey: (provider: LLMProviderId) => boolean
  removeKey: (provider: LLMProviderId) => void
  clearKeys: () => void
  validateKey: (provider: LLMProviderId, apiKey: string) => Promise<Result<boolean>>
}

/**
 * Creates an API key manager for handling LLM provider API keys
 */
export function createApiKeyManager(): ApiKeyManager {
  const keys: Map<LLMProviderId, string> = new Map()
  let storageOption: ApiKeyStorageOptions['storage'] = 'session'
  const validator = createApiKeyValidator()
  
  // Load keys from storage on initialization
  loadKeys()
  
  /**
   * Set the storage option for API keys
   */
  function setStorageOption(option: ApiKeyStorageOptions['storage']): void {
    storageOption = option
    saveKeys() // Re-save keys with new storage option
  }
  
  /**
   * Get the current storage option
   */
  function getStorageOption(): ApiKeyStorageOptions['storage'] {
    return storageOption
  }
  
  /**
   * Set an API key for a provider
   */
  function setKey(provider: LLMProviderId, key: string): void {
    keys.set(provider, key)
    saveKeys()
  }
  
  /**
   * Get an API key for a provider
   */
  function getKey(provider: LLMProviderId): string | undefined {
    return keys.get(provider)
  }
  
  /**
   * Check if a key exists for a provider
   */
  function hasKey(provider: LLMProviderId): boolean {
    return keys.has(provider) && !!keys.get(provider)
  }
  
  /**
   * Remove an API key for a provider
   */
  function removeKey(provider: LLMProviderId): void {
    keys.delete(provider)
    saveKeys()
  }
  
  /**
   * Clear all API keys
   */
  function clearKeys(): void {
    keys.clear()
    saveKeys()
  }

  /**
   * Validate an API key for a provider
   */
  async function validateKey(provider: LLMProviderId, apiKey: string): Promise<Result<boolean>> {
    return validator.validateKey(provider, apiKey)
  }
  
  /**
   * Load keys from storage
   */
  function loadKeys(): void {
    try {
      // Try localStorage first
      let storedKeys = localStorage.getItem(API_KEY_STORAGE_KEY)
      
      // If not in localStorage, try sessionStorage
      if (!storedKeys) {
        storedKeys = sessionStorage.getItem(API_KEY_STORAGE_KEY)
        if (storedKeys) {
          storageOption = 'session'
        }
      } else {
        storageOption = 'local'
      }
      
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys) as Record<string, string>
        Object.entries(parsedKeys).forEach(([provider, key]) => {
          keys.set(provider as LLMProviderId, key)
        })
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }
  
  /**
   * Save keys to storage
   */
  function saveKeys(): void {
    try {
      const keysObj: Record<string, string> = {}
      keys.forEach((key, provider) => {
        keysObj[provider] = key
      })
      
      const serialized = JSON.stringify(keysObj)
      
      // Clear both storages first
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      sessionStorage.removeItem(API_KEY_STORAGE_KEY)
      
      // Save to the appropriate storage
      if (storageOption === 'local') {
        localStorage.setItem(API_KEY_STORAGE_KEY, serialized)
      } else if (storageOption === 'session') {
        sessionStorage.setItem(API_KEY_STORAGE_KEY, serialized)
      }
      // If 'none', don't save to storage
    } catch (error) {
      console.error('Error saving API keys:', error)
    }
  }

  return {
    setStorageOption,
    getStorageOption,
    setKey,
    getKey,
    hasKey,
    removeKey,
    clearKeys,
    validateKey
  }
}
