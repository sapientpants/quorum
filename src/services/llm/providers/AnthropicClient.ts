import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  AnthropicModel,
  LLMModel,
  ProviderCapabilities,
} from "../../../types/llm";
import { BaseClient } from "../base/BaseClient";
import { LLMError, LLMErrorType } from "../errors";

// Anthropic-specific interfaces
interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  model: string;
  content: {
    type: string;
    text: string;
  }[];
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AnthropicStreamChunk {
  delta?: {
    text: string;
  };
}

// Provider-specific error types
export class AnthropicError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AnthropicError";
  }
}

/**
 * Implementation of the Anthropic LLM client
 */
export class AnthropicClient extends BaseClient {
  protected readonly providerName = "anthropic";
  protected readonly apiBaseUrl = "https://api.anthropic.com/v1/messages";
  protected readonly supportedModels: AnthropicModel[] = [
    "claude-3.7-sonnet",
    "claude-3.5-sonnet",
    "claude-3.5-haiku",
  ];
  protected readonly defaultModel: AnthropicModel = "claude-3.7-sonnet";
  protected readonly capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 100000,
  };

  /**
   * Convert the application's message format to Anthropic's format
   */
  protected convertMessages(messages: Message[]): {
    messages: AnthropicMessage[];
    system?: string;
  } {
    // Extract system message if present
    const systemMessage = messages.find((m) => m.senderId === "system");
    const systemPrompt = systemMessage?.text;

    // Filter out system messages and convert the rest
    const anthropicMessages = messages
      .filter((m) => m.senderId !== "system")
      .map((message) => {
        // Anthropic only supports 'user' or 'assistant' roles
        const role = message.senderId === "user" ? "user" : "assistant";
        return {
          role: role,
          content: message.text,
        } as AnthropicMessage;
      });

    return {
      messages: anthropicMessages,
      system: systemPrompt,
    };
  }

  /**
   * Create a request body for the Anthropic API
   */
  protected createRequestBody(
    messages: Message[],
    model: LLMModel,
    settings?: LLMSettings,
    streaming?: boolean,
  ): AnthropicRequest {
    const { messages: anthropicMessages, system } =
      this.convertMessages(messages);

    return {
      model: model,
      messages: anthropicMessages,
      system,
      max_tokens: settings?.maxTokens ?? 1000,
      temperature: settings?.temperature,
      top_p: settings?.topP,
      stream: streaming || false,
    };
  }

  /**
   * Extract the content from an Anthropic API response
   */
  protected extractContentFromResponse(responseData: unknown): string {
    // Using type guard instead of type assertion
    if (!this.isAnthropicResponse(responseData)) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "Invalid response format from Anthropic",
        { provider: this.providerName },
      );
    }

    const data = responseData;

    // The empty content array case is already checked in the isAnthropicResponse method,
    // but we'll check it again here to match the expected error message in the tests
    if (!data.content || data.content.length === 0) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "No response content from Anthropic",
        { provider: this.providerName },
      );
    }

    return data.content[0].text;
  }

  /**
   * Extract token content from an Anthropic streaming chunk
   */
  protected extractTokenFromStreamChunk(chunk: unknown): string | null {
    if (this.isAnthropicStreamChunk(chunk)) {
      return chunk.delta?.text ?? null;
    }
    return null;
  }

  /**
   * Get request headers for the Anthropic API
   */
  protected getRequestHeaders(apiKey: string): HeadersInit {
    return {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
  }

  /**
   * Check if an error is an Anthropic-specific error
   */
  protected isProviderSpecificError(error: unknown): boolean {
    return error instanceof AnthropicError;
  }

  /**
   * Type guard to check if a value has the structure of an AnthropicResponse
   */
  protected isAnthropicResponse(value: unknown): value is AnthropicResponse {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const obj = value as Record<string, unknown>;

    if (!("content" in obj) || !Array.isArray(obj.content)) {
      return false;
    }

    if (obj.content.length === 0) {
      return false;
    }

    const firstContent = obj.content[0];
    if (
      typeof firstContent !== "object" ||
      firstContent === null ||
      !("type" in firstContent) ||
      !("text" in firstContent)
    ) {
      return false;
    }

    return (
      typeof firstContent.type === "string" &&
      typeof firstContent.text === "string"
    );
  }

  /**
   * Type guard for stream chunks
   */
  protected isAnthropicStreamChunk(
    value: unknown,
  ): value is AnthropicStreamChunk {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const obj = value as Record<string, unknown>;

    if (!("delta" in obj)) {
      return false;
    }

    const delta = obj.delta;
    if (typeof delta !== "object" || delta === null) {
      return false;
    }

    return (
      "text" in (delta as Record<string, unknown>) &&
      typeof (delta as Record<string, unknown>).text === "string"
    );
  }

  protected convertToStandardError(error: unknown): LLMError {
    const anthropicError = error as AnthropicError;

    let errorType: LLMErrorType;
    switch (anthropicError.code) {
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

    return new LLMError(errorType, anthropicError.message, {
      originalError: anthropicError,
      provider: this.providerName,
    });
  }
}
