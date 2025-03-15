import type { Message } from '../../types/chat'
import type { LLMProviderId } from '../../types/llm'
import type { Participant } from '../../types/participant'
import { createLLMService } from './createLLMService'
import { ApiKeyManager } from './ApiKeyManager'
import type { StreamingOptions } from '../../types/llm'
import { Result, failure } from '../../types/result'
import { LLMError, ErrorType } from './LLMError'

/**
 * Create an LLM provider with optional dependencies
 */
export function createLLMProvider(options?: {
  apiKeyManager?: ApiKeyManager
}) {
  const apiKeyManager = options?.apiKeyManager || new ApiKeyManager()
  const service = createLLMService({ apiKeyManager })
  
  /**
   * Send a message to an LLM participant
   */
  async function sendMessage(
    messages: Message[],
    participant: Participant,
    options?: {
      streaming?: StreamingOptions
      abortSignal?: AbortSignal
    }
  ): Promise<Result<Message>> {
    if (participant.type !== 'llm') {
      return failure(new LLMError(ErrorType.INVALID_PROVIDER, 'Participant must be an LLM'))
    }
    
    return service.sendMessage(
      messages,
      participant.provider,
      participant.model,
      participant.systemPrompt,
      participant.settings,
      options
    )
  }
  
  /**
   * Get available models for a provider
   */
  async function getAvailableModels(provider: LLMProviderId): Promise<Result<string[]>> {
    return service.getAvailableModels(provider)
  }
  
  /**
   * Check if a provider is configured (has API key)
   */
  function isProviderConfigured(provider: LLMProviderId): boolean {
    return apiKeyManager.hasKey(provider)
  }
  
  /**
   * Get all supported providers
   */
  function getSupportedProviders(): LLMProviderId[] {
    return service.getSupportedProviders()
  }
  
  /**
   * Get API key manager instance
   */
  function getApiKeyManager(): ApiKeyManager {
    return apiKeyManager
  }
  
  /**
   * Check if a provider supports streaming
   */
  function supportsStreaming(provider: LLMProviderId): boolean {
    return service.supportsStreaming(provider)
  }
  
  /**
   * Validate an API key for a provider
   */
  async function validateApiKey(provider: LLMProviderId, apiKey: string): Promise<Result<boolean>> {
    return service.validateApiKey(provider, apiKey)
  }
  
  return {
    sendMessage,
    getAvailableModels,
    isProviderConfigured,
    getSupportedProviders,
    getApiKeyManager,
    supportsStreaming,
    validateApiKey
  }
}

// Create a default instance for backward compatibility
export const llmProvider = createLLMProvider()
