import type { Message } from '../../../types/chat'
import type { LLMSettings } from '../../../types/llm'
import type { LLMClient, StreamingOptions, ProviderCapabilities } from '../types'

export abstract class BaseClient implements LLMClient {
  protected abstract readonly providerName: string
  protected abstract readonly defaultModelName: string
  protected abstract readonly availableModels: string[]
  protected abstract readonly capabilities: ProviderCapabilities
  
  abstract sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal
  ): Promise<string>
  
  abstract validateApiKey(apiKey: string): Promise<boolean>
  
  getAvailableModels(): string[] {
    return this.availableModels
  }
  
  getDefaultModel(): string {
    return this.defaultModelName
  }
  
  getProviderName(): string {
    return this.providerName
  }
  
  supportsStreaming(): boolean {
    return this.capabilities.supportsStreaming && 
           typeof ReadableStream !== 'undefined' && 
           typeof TextDecoder !== 'undefined'
  }
  
  getCapabilities(): ProviderCapabilities {
    return this.capabilities
  }
  
  /**
   * Helper method to handle API errors
   */
  protected handleApiError(error: unknown, provider: string): Error {
    if (error instanceof Error) {
      return error
    }
    
    return new Error(`${provider} API error: ${JSON.stringify(error)}`)
  }
}