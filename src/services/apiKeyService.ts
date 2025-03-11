import { nanoid } from 'nanoid'
import type { ApiKey, ApiKeyValidationResult, ApiKeyStorageOptions } from '../types/api'
import type { LLMProvider } from '../types/llm'
import { API_KEY_STORAGE_KEY } from '../types/api'

// Validate API keys for different providers
export function validateApiKey(provider: string, key: string): ApiKeyValidationResult {
  if (!key || key.trim() === '') {
    return { isValid: false, message: 'API key cannot be empty' }
  }

  switch (provider) {
    case 'openai':
      // OpenAI keys typically start with 'sk-' and are 51 characters long
      if (!key.startsWith('sk-') || key.length < 40) {
        return { 
          isValid: false, 
          message: 'Invalid OpenAI API key format. Should start with "sk-"' 
        }
      }
      break
    case 'anthropic':
      // Anthropic keys typically start with 'sk-ant-' 
      if (!key.startsWith('sk-ant-')) {
        return { 
          isValid: false, 
          message: 'Invalid Anthropic API key format. Should start with "sk-ant-"' 
        }
      }
      break
    case 'grok':
      // Grok keys are typically long strings
      if (key.length < 30) {
        return { 
          isValid: false, 
          message: 'Invalid Grok API key format' 
        }
      }
      break
    default:
      // For other providers, just check if the key is not empty
      if (key.length < 10) {
        return { 
          isValid: false, 
          message: 'API key seems too short' 
        }
      }
  }

  return { isValid: true }
}

// Save API keys based on storage preference
export function saveApiKeys(
  apiKeys: ApiKey[], 
  options: ApiKeyStorageOptions = { storage: 'local' }
): void {
  if (options.storage === 'none') return

  const storage = options.storage === 'local' ? localStorage : sessionStorage
  storage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(apiKeys))
}

// Load API keys from storage
export function loadApiKeys(
  options: ApiKeyStorageOptions = { storage: 'local' }
): ApiKey[] {
  if (options.storage === 'none') return []

  const storage = options.storage === 'local' ? localStorage : sessionStorage
  const savedKeys = storage.getItem(API_KEY_STORAGE_KEY)
  
  if (!savedKeys) return []
  
  try {
    return JSON.parse(savedKeys) as ApiKey[]
  } catch (error) {
    console.error('Error parsing saved API keys:', error)
    return []
  }
}

// Create a new API key object
export function createApiKey(provider: LLMProvider, key: string, label?: string): ApiKey {
  return {
    id: nanoid(),
    provider,
    key,
    label: label || `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`,
    isVisible: false
  }
}

// Clear all saved API keys
export function clearApiKeys(
  options: ApiKeyStorageOptions = { storage: 'local' }
): void {
  if (options.storage === 'none') return

  const storage = options.storage === 'local' ? localStorage : sessionStorage
  storage.removeItem(API_KEY_STORAGE_KEY)
} 