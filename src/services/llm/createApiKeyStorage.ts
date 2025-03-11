import type { LLMProvider } from '../../types/llm'
import type { ApiKeyStorageOptions } from '../../types/api'
import { API_KEY_STORAGE_KEY } from '../../types/api'

/**
 * Create an API key storage service
 */
export function createApiKeyStorage(options: { 
  storageType?: ApiKeyStorageOptions['storage'] 
} = {}) {
  let storageOption: ApiKeyStorageOptions['storage'] = options.storageType || 'session'
  const keys: Map<LLMProvider, string> = new Map()
  
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
          keys.set(provider as LLMProvider, key)
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
  
  // Load keys on initialization
  loadKeys()
  
  return {
    /**
     * Set the storage option for API keys
     */
    setStorageOption(option: ApiKeyStorageOptions['storage']): void {
      storageOption = option
      saveKeys() // Re-save keys with new storage option
    },
    
    /**
     * Get the current storage option
     */
    getStorageOption(): ApiKeyStorageOptions['storage'] {
      return storageOption
    },
    
    /**
     * Set an API key for a provider
     */
    setKey(provider: LLMProvider, key: string): void {
      keys.set(provider, key)
      saveKeys()
    },
    
    /**
     * Get an API key for a provider
     */
    getKey(provider: LLMProvider): string | undefined {
      return keys.get(provider)
    },
    
    /**
     * Check if a key exists for a provider
     */
    hasKey(provider: LLMProvider): boolean {
      return keys.has(provider) && !!keys.get(provider)
    },
    
    /**
     * Remove an API key for a provider
     */
    removeKey(provider: LLMProvider): void {
      keys.delete(provider)
      saveKeys()
    },
    
    /**
     * Clear all API keys
     */
    clearKeys(): void {
      keys.clear()
      saveKeys()
    }
  }
}