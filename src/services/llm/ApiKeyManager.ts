import type { LLMProvider } from '../../types/llm'
import type { ApiKeyStorageOptions } from '../../types/api'
import { API_KEY_STORAGE_KEY } from '../../types/api'

export class ApiKeyManager {
  private keys: Map<LLMProvider, string> = new Map()
  private storageOption: ApiKeyStorageOptions['storage'] = 'session'
  
  constructor() {
    this.loadKeys()
  }
  
  /**
   * Set the storage option for API keys
   */
  setStorageOption(option: ApiKeyStorageOptions['storage']): void {
    this.storageOption = option
    this.saveKeys() // Re-save keys with new storage option
  }
  
  /**
   * Get the current storage option
   */
  getStorageOption(): ApiKeyStorageOptions['storage'] {
    return this.storageOption
  }
  
  /**
   * Set an API key for a provider
   */
  setKey(provider: LLMProvider, key: string): void {
    this.keys.set(provider, key)
    this.saveKeys()
  }
  
  /**
   * Get an API key for a provider
   */
  getKey(provider: LLMProvider): string | undefined {
    return this.keys.get(provider)
  }
  
  /**
   * Check if a key exists for a provider
   */
  hasKey(provider: LLMProvider): boolean {
    return this.keys.has(provider) && !!this.keys.get(provider)
  }
  
  /**
   * Remove an API key for a provider
   */
  removeKey(provider: LLMProvider): void {
    this.keys.delete(provider)
    this.saveKeys()
  }
  
  /**
   * Clear all API keys
   */
  clearKeys(): void {
    this.keys.clear()
    this.saveKeys()
  }
  
  /**
   * Load keys from storage
   */
  private loadKeys(): void {
    try {
      // Try localStorage first
      let storedKeys = localStorage.getItem(API_KEY_STORAGE_KEY)
      
      // If not in localStorage, try sessionStorage
      if (!storedKeys) {
        storedKeys = sessionStorage.getItem(API_KEY_STORAGE_KEY)
        if (storedKeys) {
          this.storageOption = 'session'
        }
      } else {
        this.storageOption = 'local'
      }
      
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys) as Record<string, string>
        Object.entries(parsedKeys).forEach(([provider, key]) => {
          this.keys.set(provider as LLMProvider, key)
        })
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }
  
  /**
   * Save keys to storage
   */
  private saveKeys(): void {
    try {
      const keysObj: Record<string, string> = {}
      this.keys.forEach((key, provider) => {
        keysObj[provider] = key
      })
      
      const serialized = JSON.stringify(keysObj)
      
      // Clear both storages first
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      sessionStorage.removeItem(API_KEY_STORAGE_KEY)
      
      // Save to the appropriate storage
      if (this.storageOption === 'local') {
        localStorage.setItem(API_KEY_STORAGE_KEY, serialized)
      } else if (this.storageOption === 'session') {
        sessionStorage.setItem(API_KEY_STORAGE_KEY, serialized)
      }
      // If 'none', don't save to storage
    } catch (error) {
      console.error('Error saving API keys:', error)
    }
  }
}