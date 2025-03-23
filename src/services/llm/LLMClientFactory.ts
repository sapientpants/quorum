import type { LLMClient, LLMProviderId } from "../../types/llm";
import { AnthropicClient } from "./providers/AnthropicClient";
import { OpenAIClient } from "./providers/OpenAIClient";
import { GoogleClient } from "./providers/GoogleClient";
import { GrokClient } from "./providers/GrokClient";
import { LLMError, LLMErrorType } from "./errors";

// Cache for client instances
type ClientCache = {
  [key in LLMProviderId]?: LLMClient;
};

/**
 * Factory for creating LLM client instances
 */
export class LLMClientFactory {
  private static clientCache: ClientCache = {};

  /**
   * Get an LLM client for the specified provider
   */
  public static getLLMClient(provider: LLMProviderId): LLMClient {
    // Check if we have a cached instance
    if (this.clientCache[provider]) {
      return this.clientCache[provider];
    }

    // Create a new client instance based on the provider
    let client: LLMClient;

    switch (provider) {
      case "openai":
        client = new OpenAIClient();
        break;
      case "anthropic":
        client = new AnthropicClient();
        break;
      case "google":
        client = new GoogleClient();
        break;
      case "grok":
        client = new GrokClient();
        break;
      default:
        throw new LLMError(
          LLMErrorType.INVALID_MODEL,
          `Provider '${provider}' is not supported`,
          {},
        );
    }

    // Cache the client for future use
    this.clientCache[provider] = client;

    return client;
  }

  /**
   * Clear the client cache
   */
  public static clearCache(): void {
    this.clientCache = {};
  }

  /**
   * Get available models for a provider
   */
  public static getAvailableModels(provider: LLMProviderId): string[] {
    const client = this.getLLMClient(provider);
    return client.getAvailableModels();
  }

  /**
   * Get the default model for a provider
   */
  public static getDefaultModel(provider: LLMProviderId): string {
    const client = this.getLLMClient(provider);
    return client.getDefaultModel();
  }

  /**
   * Check if a provider supports streaming
   */
  public static supportsStreaming(provider: LLMProviderId): boolean {
    const client = this.getLLMClient(provider);
    return client.supportsStreaming();
  }

  /**
   * Validate an API key for a provider
   */
  public static async validateApiKey(
    provider: LLMProviderId,
    apiKey: string,
  ): Promise<boolean> {
    const client = this.getLLMClient(provider);
    return await client.validateApiKey(apiKey);
  }
}

/**
 * Helper functions for LLM client operations
 */
export const LLMService = {
  /**
   * Get available models for a provider
   */
  getAvailableModels: (provider: LLMProviderId): string[] => {
    return LLMClientFactory.getAvailableModels(provider);
  },

  /**
   * Get the default model for a provider
   */
  getDefaultModel: (provider: LLMProviderId): string => {
    return LLMClientFactory.getDefaultModel(provider);
  },

  /**
   * Check if a provider supports streaming
   */
  supportsStreaming: (provider: LLMProviderId): boolean => {
    return LLMClientFactory.supportsStreaming(provider);
  },

  /**
   * Get a client for the specified provider
   */
  getClient: (provider: LLMProviderId): LLMClient => {
    return LLMClientFactory.getLLMClient(provider);
  },
};

export default LLMService;
