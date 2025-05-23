import type { LLMProviderId } from "../../types/llm";
import { LLMService } from "./LLMClientFactory";
import { Result, success, tryCatch } from "../../types/result";
import { LLMError, LLMErrorType } from "./errors";

/**
 * Create an API key validator service
 */
export function createApiKeyValidator() {
  return {
    /**
     * Validate an API key for a provider
     *
     * @param provider The LLM provider
     * @param apiKey The API key to validate
     * @returns A Result indicating whether the key is valid
     */
    async validateKey(
      provider: LLMProviderId,
      apiKey: string,
    ): Promise<Result<boolean>> {
      if (!provider || !apiKey) {
        return success(false);
      }

      return tryCatch(
        async () => {
          try {
            const client = LLMService.getClient(provider);

            // Use the client's validateApiKey method
            const isValid = await client.validateApiKey(apiKey);
            return isValid;
          } catch (error) {
            console.error(`Error validating API key for ${provider}:`, error);
            return false;
          }
        },
        (error) =>
          new LLMError(
            LLMErrorType.AUTHENTICATION,
            `Error validating API key for ${provider}: ${error instanceof Error ? error.message : String(error)}`,
          ),
      );
    },
  };
}
