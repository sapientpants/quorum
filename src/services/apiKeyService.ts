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
      // OpenAI keys start with 'sk-' or 'sk-proj-'
      if ((!key.startsWith('sk-') && !key.startsWith('sk-proj-')) || 
          (key.startsWith('sk-proj-') && key.length !== 164) || 
          (key.startsWith('sk-') && !key.startsWith('sk-proj-') && key.length !== 51)) {
        return { 
          isValid: false, 
          message: 'Invalid OpenAI API key format. Should start with "sk-" (51 characters) or "sk-proj-" (164 characters)' 
        }
      }
      break
    case 'anthropic':
      // Anthropic keys start with 'sk-ant-' and are at least 40 characters
      if (!key.startsWith('sk-ant-') || key.length < 40) {
        return { 
          isValid: false, 
          message: 'Invalid Anthropic API key format. Should start with "sk-ant-" and be at least 40 characters' 
        }
      }
      break
    case 'grok':
      // Grok keys start with 'grok-' and are at least 40 characters
      if (!key.startsWith('grok-') || key.length < 40) {
        return { 
          isValid: false, 
          message: 'Invalid Grok API key format. Should start with "grok-" and be at least 40 characters' 
        }
      }
      break
    case 'google':
      // Google AI keys are at least 40 characters
      if (key.length < 40) {
        return { 
          isValid: false, 
          message: 'Invalid Google AI API key format. Should be at least 40 characters' 
        }
      }
      break
    default:
      // For unknown providers, just check if the key is a reasonable length
      if (key.length < 30) {
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
export function createApiKey(provider: LLMProvider, key: string): ApiKey {
  return {
    id: nanoid(),
    provider,
    key,
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