import type { LLMClient, ProviderCapabilities, LLMModel } from "../../types/llm";
import { OpenAIClient } from "./openaiClient";
import { AnthropicClient } from "./anthropicClient";
import { GrokClient } from "./grokClient";
import { GoogleClient } from "./googleClient";
import type { LLMProviderId } from "../../types/llm";
import { LLMError, ErrorType } from "./LLMError";
import { validateApiKey } from "../../services/apiKeyService";

// Registry for LLM clients
const clientRegistry = new Map<string, () => LLMClient>();
const clientCache: Record<string, LLMClient> = {};

/**
 * Register an LLM client factory for a provider
 * This allows for extending the system with new providers without modifying existing code
 */
function registerLLMClient(
  provider: string,
  factory: () => LLMClient,
): void {
  clientRegistry.set(provider.toLowerCase(), factory);

  // Clear cache for this provider if it exists
  if (clientCache[provider.toLowerCase()]) {
    delete clientCache[provider.toLowerCase()];
  }
}

/**
 * Get the appropriate LLM client based on the provider
 */
export function getLLMClient(provider: LLMProviderId): LLMClient {
  const providerKey = provider.toLowerCase();

  // Return cached client if available
  if (clientCache[providerKey]) {
    return clientCache[providerKey];
  }

  // Check if client is registered
  const factory = clientRegistry.get(providerKey);

  if (factory) {
    // Create and enhance the client
    const baseClient = factory();
    const enhancedClient = createEnhancedClient(baseClient, provider);

    // Cache the enhanced client
    clientCache[providerKey] = enhancedClient;

    return enhancedClient;
  }

  throw new LLMError(
    ErrorType.INVALID_PROVIDER,
    `LLM client for provider ${provider} not implemented`,
  );
}

/**
 * Create a client with enhanced capabilities
 * This is a helper function to create clients with consistent behavior
 */
function createEnhancedClient(
  baseClient: Partial<LLMClient>,
  provider: LLMProviderId,
): LLMClient {
  // Ensure the base client has the required methods
  if (
    !baseClient.sendMessage ||
    !baseClient.getAvailableModels ||
    !baseClient.getDefaultModel ||
    !baseClient.getProviderName ||
    !baseClient.supportsStreaming
  ) {
    throw new LLMError(
      ErrorType.INVALID_PROVIDER,
      `Invalid client implementation for provider ${provider}`,
    );
  }

  // We've already checked that these methods exist, so we can safely use them
  const sendMessage = baseClient.sendMessage;
  const getAvailableModels = baseClient.getAvailableModels;
  const getDefaultModel = baseClient.getDefaultModel;
  const getProviderName = baseClient.getProviderName;
  const supportsStreaming = baseClient.supportsStreaming;

  // Create the enhanced client
  const enhancedClient: LLMClient = {
    // Required methods from the base client
    sendMessage,
    getAvailableModels,
    getDefaultModel,
    getProviderName,
    supportsStreaming,

    // Add validateApiKey method if it doesn't exist
    validateApiKey:
      baseClient.validateApiKey ||
      (async (apiKey: string): Promise<boolean> => {
        // First do basic format validation
        const formatValidation = validateApiKey(provider, apiKey);
        if (!formatValidation.isValid) {
          return false;
        }

        // Then try to validate with the provider's API
        try {
          const response = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          return response.ok;
        } catch (_error) {
          console.error(`Error validating ${provider} API key:`, _error);
          return false;
        }
      }),

    // Add getCapabilities method if it doesn't exist
    getCapabilities:
      baseClient.getCapabilities ||
      (() => {
        const capabilities: ProviderCapabilities = {
          supportsStreaming: supportsStreaming(),
          supportsSystemMessages: true,
          maxContextLength: 4000,
          supportsFunctionCalling: provider === "openai",
          supportsVision: provider === "openai" || provider === "anthropic",
          supportsTool: provider === "openai",
        };
        return capabilities;
      }),
  };

  return enhancedClient;
}

// Register built-in clients
registerLLMClient("openai", () => {
  const client = new OpenAIClient();
  
  // Create a client that implements the LLMClient interface
  const enhancedClient: LLMClient = {
    sendMessage: client.sendMessage.bind(client),
    getAvailableModels: () => client.getAvailableModels() as LLMModel[],
    getDefaultModel: () => client.getDefaultModel() as LLMModel,
    getProviderName: client.getProviderName.bind(client),
    supportsStreaming: client.supportsStreaming.bind(client),
    
    validateApiKey: async (apiKey: string) => {
      if (!apiKey) return false;
      try {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        return response.ok;
      } catch (_error) {
        return false;
      }
    },
    
    getCapabilities: () => ({
      supportsStreaming: true,
      supportsSystemMessages: true,
      maxContextLength: 16000,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsTool: true,
    }),
  };
  
  return enhancedClient;
});

registerLLMClient("anthropic", () => new AnthropicClient());
registerLLMClient("grok", () => new GrokClient());
registerLLMClient("google", () => new GoogleClient());
