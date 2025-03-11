import type { Message } from '../../types/chat'
import type { LLMSettings } from '../../types/llm'

export interface StreamingOptions {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

export interface LLMClient {
  /**
   * Send a message to the LLM and get a response
   */
  sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal
  ): Promise<string>
  
  /**
   * Get the available models for this provider
   */
  getAvailableModels(): string[]
  
  /**
   * Get the default model for this provider
   */
  getDefaultModel(): string
  
  /**
   * Get the provider name
   */
  getProviderName(): string
  
  /**
   * Check if this provider supports streaming
   */
  supportsStreaming(): boolean
  
  /**
   * Validate an API key
   */
  validateApiKey(apiKey: string): Promise<boolean>
  
  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities
}

export interface ProviderCapabilities {
  supportsStreaming: boolean
  supportsSystemMessages: boolean
  maxContextLength: number
  supportsFunctionCalling?: boolean
  supportsVision?: boolean
  supportsTool?: boolean
}