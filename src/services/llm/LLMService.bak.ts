import type { Message } from '../../types/chat'
import type { LLMSettings, LLMProvider } from '../../types/llm'
import { SUPPORTED_PROVIDERS } from '../../types/llm'
import { getLLMClient } from './LLMClientFactory'
import { ApiKeyManager } from './ApiKeyManager'
import { LLMError, ErrorType } from './LLMError'
import type { StreamingOptions } from './types'

export class LLMService {
  private apiKeyManager: ApiKeyManager
  
  constructor(apiKeyManager: ApiKeyManager) {
    this.apiKeyManager = apiKeyManager
  }
  
  /**
   * Send a message to an LLM and get a response
   */
  async sendMessage(
    messages: Message[],
    provider: LLMProvider,
    model: string,
    systemPrompt: string,
    settings?: LLMSettings,
    options?: {
      streaming?: StreamingOptions
      abortSignal?: AbortSignal
    }
  ): Promise<Message> {
    if (!provider) {
      throw new LLMError(ErrorType.INVALID_PROVIDER, 'Provider is required')
    }
    
    const apiKey = this.apiKeyManager.getKey(provider)
    if (!apiKey) {
      throw new LLMError(
        ErrorType.MISSING_API_KEY,
        `API key for ${provider} is required`
      )
    }
    
    try {
      const client = getLLMClient(provider)
      
      // Prepare messages with system prompt
      const messagesWithSystem = this.prepareMessagesWithSystemPrompt(
        messages,
        systemPrompt
      )
      
      // Note: We're using the existing client interface which doesn't have the abortSignal parameter
      // This will be fixed when we update the client implementations
      const response = await client.sendMessage(
        messagesWithSystem,
        apiKey,
        model,
        settings,
        options?.streaming
      )
      
      // Create a new message from the response
      return {
        id: crypto.randomUUID(),
        senderId: provider, // Use provider as senderId
        text: response,
        timestamp: Date.now(),
        provider,
        model,
        status: 'sent'
      }
    } catch (error) {
      console.error(`Error sending message to ${provider}:`, error)
      
      // Create an error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        senderId: provider,
        text: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        provider,
        model,
        status: 'error',
        error: error instanceof Error ? error : new Error('Unknown error')
      }
      
      throw new LLMError(
        error instanceof LLMError ? error.type : ErrorType.API_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        errorMessage
      )
    }
  }
  
  /**
   * Prepare messages with system prompt
   */
  private prepareMessagesWithSystemPrompt(
    messages: Message[],
    systemPrompt: string
  ): Message[] {
    // Check if there's already a system message
    const hasSystemMessage = messages.some(m => m.senderId === 'system')
    
    if (hasSystemMessage || !systemPrompt) {
      return messages
    }
    
    // Add system message at the beginning
    return [
      {
        id: crypto.randomUUID(),
        senderId: 'system',
        text: systemPrompt,
        timestamp: Date.now()
      },
      ...messages
    ]
  }
  
  /**
   * Get available models for a provider
   */
  async getAvailableModels(provider: LLMProvider): Promise<string[]> {
    if (!provider) {
      return []
    }
    
    try {
      const client = getLLMClient(provider)
      return client.getAvailableModels()
    } catch (error) {
      console.error(`Error getting available models for ${provider}:`, error)
      return []
    }
  }
  
  /**
   * Get the default model for a provider
   */
  getDefaultModel(provider: LLMProvider): string {
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
   * Check if a provider supports streaming
   */
  supportsStreaming(provider: LLMProvider): boolean {
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
   * Get all supported providers
   */
  getSupportedProviders(): LLMProvider[] {
    return SUPPORTED_PROVIDERS
  }
  
  /**
   * Validate an API key for a provider
   * 
   * Note: This is a temporary implementation until we update the client implementations
   */
  async validateApiKey(provider: LLMProvider, apiKey: string): Promise<boolean> {
    if (!provider || !apiKey) {
      return false
    }
    
    try {
      // For now, we'll just try to get available models as a way to validate the key
      const client = getLLMClient(provider)
      
      // Make a minimal API call to check if the key is valid
      // This will be replaced with client.validateApiKey() when we update the clients
      await client.sendMessage(
        [{ id: '1', senderId: 'user', text: 'test', timestamp: Date.now() }],
        apiKey,
        client.getDefaultModel(),
        { maxTokens: 1 } // Minimize token usage
      )
      
      return true
    } catch (error) {
      console.error(`Error validating API key for ${provider}:`, error)
      return false
    }
  }
}