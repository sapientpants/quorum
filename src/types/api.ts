import type { LLMProviderId } from './llm'

export interface ApiKey {
  id: string
  provider: LLMProviderId
  key: string
  isVisible?: boolean
}

export interface ApiKeyStorageOptions {
  storage: 'local' | 'session' | 'none'
}

export interface ApiKeyValidationResult {
  isValid: boolean
  message?: string
}

export const API_KEY_STORAGE_KEY = 'quorum_api_keys'
