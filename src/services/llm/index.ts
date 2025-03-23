/**
 * LLM Service Index
 *
 * This file exports all the necessary components for working with LLM providers
 */

// Base components
export { BaseClient } from "./base/BaseClient";
export { LLMError, LLMErrorType } from "./errors";

// Provider implementations
export { AnthropicClient } from "./providers/AnthropicClient";
export { OpenAIClient } from "./providers/OpenAIClient";
export { GoogleClient } from "./providers/GoogleClient";
export { GrokClient } from "./providers/GrokClient";

// Factory and services
export { LLMClientFactory, LLMService } from "./LLMClientFactory";

// Helper functions
export const getAvailableModels = LLMService.getAvailableModels;
export const getDefaultModel = LLMService.getDefaultModel;
export const supportsStreaming = LLMService.supportsStreaming;

// Default export
import LLMService from "./LLMClientFactory";
export default LLMService;
