// Export LLM Provider
export { llmProvider, LLMProvider } from './LLMProvider'

// Export LLM service class
export { LLMService } from './llmService'

// Import types
import type { Message } from '../../types/chat'
import type { LLMProvider as ProviderType, LLMSettings } from '../../types/llm'
import { SUPPORTED_PROVIDERS } from '../../types/llm'
import type { StreamingOptions } from './types'
import { getLLMClient } from './llmClient'
import { ApiKeyManager } from './ApiKeyManager'
import { LLMService } from './llmService'

// Legacy exports for backward compatibility
export const sendMessageToLLM = async (
  messages: Message[],
  provider: ProviderType,
  apiKey: string,
  model?: string,
  settings?: LLMSettings,
  streamingOptions?: StreamingOptions
): Promise<string> => {
  const apiKeyManager = new ApiKeyManager();
  apiKeyManager.setKey(provider, apiKey);
  const service = new LLMService(apiKeyManager);
  const response = await service.sendMessage(
    messages,
    provider,
    model || '',
    '',
    settings,
    { streaming: streamingOptions }
  );
  return response.text;
};

export const getAvailableModels = (provider: ProviderType): string[] => {
  return getLLMClient(provider).getAvailableModels();
};

export const getDefaultModel = (provider: ProviderType): string => {
  return getLLMClient(provider).getDefaultModel();
};

export const getSupportedProviders = (): ProviderType[] => {
  return SUPPORTED_PROVIDERS;
};

export const supportsStreaming = (provider: ProviderType): boolean => {
  return getLLMClient(provider).supportsStreaming();
};

// Export LLM client interface
export type { LLMClient, StreamingOptions, ProviderCapabilities } from './types'
export { getLLMClient, registerLLMClient } from './LLMClientFactory'

// Export provider-specific clients
export { OpenAIClient } from './openaiClient'
export { AnthropicClient } from './anthropicClient'
export { GrokClient } from './grokClient'
export { GoogleClient } from './googleClient'

// Export error handling
export { LLMError, ErrorType } from './LLMError'

// Export API key management
export { ApiKeyManager } from './ApiKeyManager'

// Export base client
export { BaseClient } from './clients/BaseClient'