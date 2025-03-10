export interface ApiKey {
  id: string
  provider: LLMProvider
  key: string
  label?: string
  isVisible?: boolean
}

export type LLMProvider = 'openai' | 'anthropic' | 'grok' | string

export type OpenAIModel = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | string
export type AnthropicModel = 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku' | string
export type GrokModel = 'grok-1' | 'grok-1-mini' | string

export type LLMModel = OpenAIModel | AnthropicModel | GrokModel | string

export interface LLMSettings {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
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