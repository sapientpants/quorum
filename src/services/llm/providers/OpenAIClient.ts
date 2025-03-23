import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  OpenAIModel,
  LLMModel,
  ProviderCapabilities,
} from "../../../types/llm";
import { BaseClient } from "../base/BaseClient";
import { LLMError, LLMErrorType } from "../errors";

// OpenAI-specific interfaces
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
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

interface OpenAIStreamChunk {
  choices: {
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

// Provider-specific error type
export class OpenAIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

/**
 * Implementation of the OpenAI LLM client
 */
export class OpenAIClient extends BaseClient {
  protected readonly providerName = "openai";
  protected readonly apiBaseUrl = "https://api.openai.com/v1/chat/completions";
  protected readonly supportedModels: OpenAIModel[] = [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ];
  protected readonly defaultModel: OpenAIModel = "gpt-4o";
  protected readonly capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 128000,
  };

  /**
   * Convert the application's message format to OpenAI's format
   */
  protected convertMessages(messages: Message[]): OpenAIMessage[] {
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
   * Create a request body for the OpenAI API
   */
  protected createRequestBody(
    messages: Message[],
    model: LLMModel,
    settings?: LLMSettings,
    streaming?: boolean,
  ): OpenAIRequest {
    const openAIMessages = this.convertMessages(messages);

    return {
      model: model,
      messages: openAIMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      frequency_penalty: settings?.frequencyPenalty,
      presence_penalty: settings?.presencePenalty,
      stream: streaming || false,
    };
  }

  /**
   * Extract the content from an OpenAI API response
   */
  protected extractContentFromResponse(responseData: unknown): string {
    const data = responseData as OpenAIResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "No response content from OpenAI",
        { provider: this.providerName },
      );
    }

    return data.choices[0].message.content;
  }

  /**
   * Extract token content from an OpenAI streaming chunk
   */
  protected extractTokenFromStreamChunk(chunk: unknown): string | null {
    const data = chunk as OpenAIStreamChunk;

    if (
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].delta.content
    ) {
      return data.choices[0].delta.content;
    }

    return null;
  }

  /**
   * Get request headers for the OpenAI API
   */
  protected getRequestHeaders(apiKey: string): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  /**
   * Check if an error is an OpenAI-specific error
   */
  protected isProviderSpecificError(error: unknown): boolean {
    return error instanceof OpenAIError;
  }

  /**
   * Convert OpenAI-specific errors to standard LLMError format
   */
  protected convertToStandardError(error: unknown): LLMError {
    const openAIError = error as OpenAIError;

    let errorType: LLMErrorType;
    const status = openAIError.status;

    if (status === 401 || status === 403) {
      errorType = LLMErrorType.AUTHENTICATION;
    } else if (status === 429) {
      errorType = LLMErrorType.RATE_LIMIT;
    } else if (status === 404) {
      errorType = LLMErrorType.INVALID_MODEL;
    } else {
      errorType = LLMErrorType.API_ERROR;
    }

    return new LLMError(errorType, openAIError.message, {
      statusCode: status,
      originalError: openAIError,
      responseData: openAIError.data,
      provider: this.providerName,
    });
  }
}
