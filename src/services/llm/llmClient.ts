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
   * @param messages The conversation history
   * @param apiKey The API key for the provider
   * @param model The model to use
   * @param settings Additional settings for the request
   * @param streamingOptions Options for streaming responses
   * @returns The LLM's response text
   */
  sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions
  ): Promise<string>

  /**
   * Get the available models for this provider
   * @returns An array of model identifiers
   */
  getAvailableModels(): string[]

  /**
   * Get the default model for this provider
   * @returns The default model identifier
   */
  getDefaultModel(): string

  /**
   * Get the provider name
   * @returns The provider name
   */
  getProviderName(): string

  /**
   * Check if this provider supports streaming
   * @returns Whether streaming is supported
   */
  supportsStreaming(): boolean
}
