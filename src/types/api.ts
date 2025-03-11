import type { LLMProvider } from './llm'

export interface ApiKey {
  id: string
  provider: LLMProvider
  key: string
  label?: string
  isVisible?: boolean
}

export interface ApiKeyManagerProps {
  onApiKeyChange: (provider: string, apiKey: string) => void
  initialApiKeys?: ApiKey[]
}

export interface ApiKeyStorageOptions {
  storage: 'local' | 'session' | 'none'
}

export interface ApiKeyValidationResult {
  isValid: boolean
  message?: string
}

export const API_KEY_STORAGE_KEY = 'quorum_api_keys' 