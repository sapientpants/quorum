import type { Message } from '../../types/chat'
import type { LLMProvider as ProviderType } from '../../types/llm'
import type { Participant } from '../../types/participant'
import { LLMService } from './llmService'
import { ApiKeyManager } from './ApiKeyManager'
import type { StreamingOptions } from './types'

export class LLMProvider {
  private service: LLMService
  private apiKeyManager: ApiKeyManager
  
  constructor() {
    this.apiKeyManager = new ApiKeyManager()
    this.service = new LLMService(this.apiKeyManager)
  }
  
  /**
   * Send a message to an LLM participant
   */
  async sendMessage(
    messages: Message[],
    participant: Participant,
    options?: {
      streaming?: StreamingOptions
      abortSignal?: AbortSignal
    }
  ): Promise<Message> {
    if (participant.type !== 'llm') {
      throw new Error('Participant must be an LLM')
    }
    
    return this.service.sendMessage(
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
  async getAvailableModels(provider: ProviderType): Promise<string[]> {
    return this.service.getAvailableModels(provider)
  }
  
  /**
   * Check if a provider is configured (has API key)
   */
  isProviderConfigured(provider: ProviderType): boolean {
    return this.apiKeyManager.hasKey(provider)
  }
  
  /**
   * Get all supported providers
   */
  getSupportedProviders(): ProviderType[] {
    return this.service.getSupportedProviders()
  }
  
  /**
   * Get API key manager instance
   */
  getApiKeyManager(): ApiKeyManager {
    return this.apiKeyManager
  }
  
  /**
   * Check if a provider supports streaming
   */
  supportsStreaming(provider: ProviderType): boolean {
    return this.service.supportsStreaming(provider)
  }
  
  /**
   * Validate an API key for a provider
   */
  async validateApiKey(provider: ProviderType, apiKey: string): Promise<boolean> {
    return this.service.validateApiKey(provider, apiKey)
  }
}

// Create a singleton instance
export const llmProvider = new LLMProvider()