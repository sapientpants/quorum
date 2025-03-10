import type { Message } from '../../types/chat'
import type { LLMSettings, LLMProvider, LLMModel } from '../../types/api'
import { getLLMClient, type StreamingOptions } from './llmClient'

/**
 * Send a message to an LLM and get a response
 * @param messages The conversation history
 * @param provider The LLM provider
 * @param apiKey The API key for the provider
 * @param model The model to use (optional, will use provider's default if not provided)
 * @param settings Additional settings for the request (optional)
 * @param streamingOptions Options for streaming responses (optional)
 * @returns The LLM's response text
 */
export async function sendMessageToLLM(
  messages: Message[],
  provider: LLMProvider,
  apiKey: string,
  model?: LLMModel,
  settings?: LLMSettings,
  streamingOptions?: StreamingOptions
): Promise<string> {
  if (!provider) {
    throw new Error('Provider is required')
  }

  if (!apiKey) {
    throw new Error(`API key for ${provider} is required`)
  }

  try {
    const client = getLLMClient(provider)
    const modelToUse = model || client.getDefaultModel()
    
    return await client.sendMessage(messages, apiKey, modelToUse, settings, streamingOptions)
  } catch (error) {
    console.error(`Error sending message to ${provider}:`, error)
    throw error
  }
}

/**
 * Get available models for a provider
 * @param provider The LLM provider
 * @returns An array of available models
 */
export function getAvailableModels(provider: LLMProvider): string[] {
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
 * @param provider The LLM provider
 * @returns The default model
 */
export function getDefaultModel(provider: LLMProvider): string {
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
 * @param provider The LLM provider
 * @returns Whether the provider supports streaming
 */
export function supportsStreaming(provider: LLMProvider): boolean {
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
 * @returns An array of supported providers
 */
export function getSupportedProviders(): LLMProvider[] {
  return ['openai', 'anthropic', 'grok']
} 