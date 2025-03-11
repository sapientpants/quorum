import type { LLMProvider } from '../../types/llm'
import type { ApiKeyStorageOptions } from '../../types/api'
import { createApiKeyStorage } from './createApiKeyStorage'
import { createApiKeyValidator } from './createApiKeyValidator'
import { Result } from '../../types/result'

/**
 * Create an API key manager that combines storage and validation
 */
export function createApiKeyManager(options?: {
  storageType?: ApiKeyStorageOptions['storage']
}) {
  const storage = createApiKeyStorage({ 
    storageType: options?.storageType || 'session' 
  })
  
  const validator = createApiKeyValidator()
  
  return {
    /**
     * Set the storage option for API keys
     */
    setStorageOption(option: ApiKeyStorageOptions['storage']): void {
      storage.setStorageOption(option)
    },
    
    /**
     * Get the current storage option
     */
    getStorageOption(): ApiKeyStorageOptions['storage'] {
      return storage.getStorageOption()
    },
    
    /**
     * Set an API key for a provider
     */
    setKey(provider: LLMProvider, key: string): void {
      storage.setKey(provider, key)
    },
    
    /**
     * Get an API key for a provider
     */
    getKey(provider: LLMProvider): string | undefined {
      return storage.getKey(provider)
    },
    
    /**
     * Check if a key exists for a provider
     */
    hasKey(provider: LLMProvider): boolean {
      return storage.hasKey(provider)
    },
    
    /**
     * Remove an API key for a provider
     */
    removeKey(provider: LLMProvider): void {
      storage.removeKey(provider)
    },
    
    /**
     * Clear all API keys
     */
    clearKeys(): void {
      storage.clearKeys()
    },
    
    /**
     * Validate an API key for a provider
     */
    async validateKey(provider: LLMProvider, apiKey: string): Promise<Result<boolean>> {
      return validator.validateKey(provider, apiKey)
    }
  }
}