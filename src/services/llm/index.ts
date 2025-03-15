// Export new functional implementations
export { createLLMService } from './createLLMService'
export { createLLMProvider, llmProvider } from './createLLMProvider'
export { createApiKeyStorage } from './createApiKeyStorage'
export { createApiKeyValidator } from './createApiKeyValidator'
// export { createApiKeyManager } from './createApiKeyManager'

// Export legacy class implementations for backward compatibility
export { ApiKeyManager } from './ApiKeyManager'

// Import types
import type { Message } from '../../types/chat'
import type { LLMProviderId, LLMSettings } from '../../types/llm'
import { SUPPORTED_PROVIDERS } from '../../types/llm'
import type { StreamingOptions } from '../../types/llm'
import { getLLMClient } from './LLMClientFactory'
import { ApiKeyManager } from './ApiKeyManager'
import { llmProvider } from './createLLMProvider'

// Legacy exports for backward compatibility
export const sendMessageToLLM = async (
  messages: Message[],
  provider: LLMProviderId,
  apiKey: string,
  model?: string,
  settings?: LLMSettings,
  streamingOptions?: StreamingOptions
): Promise<string> => {
  const apiKeyManager = new ApiKeyManager();
  apiKeyManager.setKey(provider, apiKey);
  
  const response = await llmProvider.sendMessage(
    messages,
    {
      id: 'temp',
      name: provider,
      type: 'llm',
      provider,
      model: model || '',
      systemPrompt: '',
      settings: {
        temperature: settings?.temperature ?? 0.7,
        maxTokens: settings?.maxTokens ?? 1000
      }
    },
    { streaming: streamingOptions }
  );
  
  if (response.success) {
    return response.data.text;
  } else {
    throw response.error;
  }
};

export const getAvailableModels = (provider: LLMProviderId): string[] => {
  return getLLMClient(provider).getAvailableModels();
};

export const getDefaultModel = (provider: LLMProviderId): string => {
  return getLLMClient(provider).getDefaultModel();
};

export const getSupportedProviders = (): LLMProviderId[] => {
  return SUPPORTED_PROVIDERS;
};

export const supportsStreaming = (provider: LLMProviderId): boolean => {
  return getLLMClient(provider).supportsStreaming();
};

// Export LLM client interface
export type { LLMClient, ProviderCapabilities } from '../../types/llm'
export type { StreamingOptions } from '../../types/llm'
export { getLLMClient, registerLLMClient } from './LLMClientFactory'

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
