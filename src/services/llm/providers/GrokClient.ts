import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  GrokModel,
  LLMModel,
  ProviderCapabilities,
} from "../../../types/llm";
import { BaseClient } from "../base/BaseClient";
import { LLMError, LLMErrorType } from "../errors";
import type {
  GrokMessage,
  GrokRequest,
  GrokResponse,
  GrokStreamChunk,
} from "./types";

// Provider-specific error type
export class GrokError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "GrokError";
  }
}

/**
 * Implementation of the Grok LLM client
 */
export class GrokClient extends BaseClient {
  protected readonly providerName = "grok";
  protected readonly apiBaseUrl = "https://api.grok.x/v1/chat/completions";
  protected readonly supportedModels: GrokModel[] = ["grok-3", "grok-2"];
  protected readonly defaultModel: GrokModel = "grok-3";
  protected readonly capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 16384,
  };

  /**
   * Convert the application's message format to Grok's format
   */
  protected convertMessages(messages: Message[]): GrokMessage[] {
    return messages.map((message) => {
      // Determine the role based on senderId
      let role: "system" | "user" | "assistant";

      if (message.senderId === "user") {
        role = "user";
      } else if (message.senderId === "system") {
        role = "system";
      } else {
        role = "assistant";
      }

      return {
        role,
        content: message.text,
      };
    });
  }

  /**
   * Create a request body for the Grok API
   */
  protected createRequestBody(
    messages: Message[],
    model: LLMModel,
    settings?: LLMSettings,
    streaming?: boolean,
  ): GrokRequest {
    const grokMessages = this.convertMessages(messages);

    return {
      model: model,
      messages: grokMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      stream: streaming || false,
    };
  }

  /**
   * Type guard to check if a value has the structure of a GrokResponse
   */
  protected isGrokResponse(value: unknown): value is GrokResponse {
    if (
      typeof value === "object" &&
      value !== null &&
      "choices" in value &&
      Array.isArray((value as Record<string, unknown>).choices)
    ) {
      const choices = (value as Record<string, unknown>).choices as unknown[];
      if (choices.length > 0) {
        const firstChoice = choices[0] as Record<string, unknown>;
        return (
          typeof firstChoice === "object" &&
          firstChoice !== null &&
          "message" in firstChoice &&
          typeof firstChoice.message === "object" &&
          firstChoice.message !== null &&
          "content" in (firstChoice.message as Record<string, unknown>) &&
          typeof (firstChoice.message as Record<string, unknown>).content ===
            "string"
        );
      }
    }
    return false;
  }

  /**
   * Type guard for stream chunks
   */
  protected isGrokStreamChunk(value: unknown): value is GrokStreamChunk {
    if (
      typeof value === "object" &&
      value !== null &&
      "choices" in value &&
      Array.isArray((value as Record<string, unknown>).choices)
    ) {
      const choices = (value as Record<string, unknown>).choices as unknown[];
      if (choices.length > 0) {
        const firstChoice = choices[0] as Record<string, unknown>;
        return (
          typeof firstChoice === "object" &&
          firstChoice !== null &&
          "delta" in firstChoice &&
          typeof firstChoice.delta === "object" &&
          firstChoice.delta !== null &&
          "content" in (firstChoice.delta as Record<string, unknown>) &&
          typeof (firstChoice.delta as Record<string, unknown>).content ===
            "string"
        );
      }
    }
    return false;
  }

  /**
   * Extract the content from a Grok API response
   */
  protected extractContentFromResponse(responseData: unknown): string {
    if (!this.isGrokResponse(responseData)) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "Invalid response format from Grok",
        { provider: this.providerName },
      );
    }

    if (!responseData.choices || responseData.choices.length === 0) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "No response content from Grok",
        { provider: this.providerName },
      );
    }

    return responseData.choices[0].message.content;
  }

  /**
   * Extract token content from a Grok streaming chunk
   */
  protected extractTokenFromStreamChunk(chunk: unknown): string | null {
    if (!this.isGrokStreamChunk(chunk)) {
      return null;
    }

    return chunk.choices[0].delta?.content ?? null;
  }

  /**
   * Get request headers for the Grok API
   */
  protected getRequestHeaders(apiKey: string): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  /**
   * Check if an error is a Grok-specific error
   */
  protected isProviderSpecificError(error: unknown): boolean {
    return error instanceof GrokError;
  }

  /**
   * Convert Grok-specific errors to standard LLMError format
   */
  protected convertToStandardError(error: unknown): LLMError {
    const grokError = error as GrokError;

    let errorType: LLMErrorType;
    switch (grokError.code) {
      case "auth_error":
        errorType = LLMErrorType.AUTHENTICATION;
        break;
      case "rate_limit_error":
        errorType = LLMErrorType.RATE_LIMIT;
        break;
      case "model_error":
        errorType = LLMErrorType.INVALID_MODEL;
        break;
      default:
        errorType = LLMErrorType.API_ERROR;
    }

    return new LLMError(errorType, grokError.message, {
      originalError: grokError,
      provider: this.providerName,
    });
  }
}
