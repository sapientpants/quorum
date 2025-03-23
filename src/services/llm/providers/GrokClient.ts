import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  GrokModel,
  LLMModel,
  ProviderCapabilities,
} from "../../../types/llm";
import { BaseClient } from "../base/BaseClient";
import { LLMError, LLMErrorType } from "../errors";

// Grok-specific interfaces
interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface GrokResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GrokStreamChunk {
  choices: {
    delta?: {
      content: string;
    };
  }[];
}

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
   * Extract the content from a Grok API response
   */
  protected extractContentFromResponse(responseData: unknown): string {
    const data = responseData as GrokResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "No response content from Grok",
        { provider: this.providerName },
      );
    }

    return data.choices[0].message.content;
  }

  /**
   * Extract token content from a Grok streaming chunk
   */
  protected extractTokenFromStreamChunk(chunk: unknown): string | null {
    const data = chunk as GrokStreamChunk;

    if (data.choices?.[0]?.delta?.content) {
      return data.choices[0].delta.content;
    }

    return null;
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
