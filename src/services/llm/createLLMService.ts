import type { Message } from '../../types/chat'
import type { LLMProviderId, LLMSettings, StreamingOptions } from '../../types/llm'
import { getLLMClient } from './LLMClientFactory'
import { ApiKeyManager } from './ApiKeyManager'
import { Result, success, tryCatch } from '../../types/result'
import { LLMError, ErrorType } from './LLMError'
import { nanoid } from 'nanoid'
import { SUPPORTED_PROVIDERS } from '../../types/llm'

/**
 * Create an LLM service with the given dependencies
 */
export function createLLMService(dependencies: {
  apiKeyManager: ApiKeyManager
}) {
  const { apiKeyManager } = dependencies
  
  /**
   * Send a message to an LLM and get a response
   */
  async function sendMessage(
    messages: Message[],
    provider: LLMProviderId,
    model: string,
    systemPrompt: string = '',
    settings?: LLMSettings,
    options?: { streaming?: StreamingOptions }
  ): Promise<Result<Message>> {
    // Check if provider is valid
    if (!provider) {
      return success({
        id: nanoid(),
        senderId: 'assistant',
        text: '',
        timestamp: Date.now(),
        status: 'error'
      })
    }
    
    // Get API key for the provider
    const apiKey = apiKeyManager.getKey(provider)
    if (!apiKey) {
      return success({
        id: nanoid(),
        senderId: 'assistant',
        text: `Please add your ${provider} API key in settings`,
        timestamp: Date.now(),
        status: 'error'
      })
    }
    
    // Add system prompt if provided
    let messagesWithSystem = [...messages]
    if (systemPrompt) {
      messagesWithSystem = [
        {
          id: 'system',
          senderId: 'system',
          text: systemPrompt,
          timestamp: Date.now()
        },
        ...messagesWithSystem
      ]
    }
    
    return tryCatch(async () => {
      const client = getLLMClient(provider)
      const responseText = await client.sendMessage(
        messagesWithSystem,
        apiKey,
        model,
        settings,
        options?.streaming
      )
      
      return {
        id: nanoid(),
        senderId: 'assistant',
        text: responseText,
        timestamp: Date.now(),
        provider,
        model,
        status: 'sent'
      }
    }, (error) => {
      console.error(`Error calling ${provider}:`, error)
      return new LLMError(
        ErrorType.API_ERROR,
        `Error calling ${provider}: ${error instanceof Error ? error.message : String(error)}`
      )
    })
  }
  
  /**
   * Get available models for a provider
   */
  async function getAvailableModels(provider: LLMProviderId): Promise<Result<string[]>> {
    if (!provider) {
      return success([])
    }
    
    return tryCatch(async () => {
      const client = getLLMClient(provider)
      return client.getAvailableModels()
    })
  }
  
  /**
   * Get the default model for a provider
   */
  function getDefaultModel(provider: LLMProviderId): string {
    if (!provider) {
      return ''
    }
    
    try {
      const client = getLLMClient(provider)
      return client.getDefaultModel()
    } catch (error) {
      console.error(`Error getting default model for ${provider}:`, error)
      return ''
    }
  }
  
  /**
   * Get all supported providers
   */
  function getSupportedProviders(): LLMProviderId[] {
    return SUPPORTED_PROVIDERS
  }
  
  /**
   * Check if a provider supports streaming
   */
  function supportsStreaming(provider: LLMProviderId): boolean {
    if (!provider) {
      return false
    }
    
    try {
      const client = getLLMClient(provider)
      return client.supportsStreaming()
    } catch (error) {
      console.error(`Error checking streaming support for ${provider}:`, error)
      return false
    }
  }
  
  /**
   * Get provider capabilities
   */
  function getProviderCapabilities(provider: LLMProviderId) {
    if (!provider) {
      return {
        supportsStreaming: false,
        supportsSystemMessages: false,
        maxContextLength: 0
      }
    }
    
    try {
      const client = getLLMClient(provider)
      return client.getCapabilities()
    } catch (error) {
      console.error(`Error getting capabilities for ${provider}:`, error)
      return {
        supportsStreaming: false,
        supportsSystemMessages: false,
        maxContextLength: 0
      }
    }
  }
  
  /**
   * Validate an API key for a provider
   */
  async function validateApiKey(provider: LLMProviderId, apiKey: string): Promise<Result<boolean>> {
    if (!provider || !apiKey) {
      return success(false)
    }
    
    return tryCatch(async () => {
      const client = getLLMClient(provider)
      return await client.validateApiKey(apiKey)
    })
  }
  
  return {
    sendMessage,
    getAvailableModels,
    getDefaultModel,
    getSupportedProviders,
    supportsStreaming,
    getProviderCapabilities,
    validateApiKey
  }
}
