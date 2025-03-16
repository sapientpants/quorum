// Export new functional implementations
export { createApiKeyValidator } from './createApiKeyValidator'

// Import types
import type { LLMProviderId } from '../../types/llm'
import { getLLMClient } from './LLMClientFactory'

export const getAvailableModels = (provider: LLMProviderId): string[] => {
  return getLLMClient(provider).getAvailableModels();
};

export const getDefaultModel = (provider: LLMProviderId): string => {
  return getLLMClient(provider).getDefaultModel();
};

export const supportsStreaming = (provider: LLMProviderId): boolean => {
  return getLLMClient(provider).supportsStreaming();
};

// Export LLM client interface
export type { LLMClient, ProviderCapabilities } from '../../types/llm'
export type { StreamingOptions } from '../../types/llm'
export { getLLMClient } from './LLMClientFactory'

// Export provider-specific clients
export { OpenAIClient } from './openaiClient'
export { AnthropicClient } from './anthropicClient'
export { GrokClient } from './grokClient'
export { GoogleClient } from './googleClient'
export { OpenAIStreamClient } from './openaiStreamClient'

// Export error handling
export { LLMError, ErrorType } from './LLMError'

// Export base client - use type export for the class
export type { BaseClient } from './clients/BaseClient'

// Export Result type for error handling
export type { Result } from '../../types/result'
export { success, tryCatch } from '../../types/result'
