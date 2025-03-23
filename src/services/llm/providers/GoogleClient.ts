import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  GoogleModel,
  LLMModel,
  ProviderCapabilities,
} from "../../../types/llm";
import { BaseClient } from "../base/BaseClient";
import { LLMError, LLMErrorType } from "../errors";

// Google-specific interfaces
interface GoogleContent {
  role: string;
  parts: {
    text: string;
  }[];
}

interface GoogleRequest {
  contents: GoogleContent[];
  generationConfig: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

interface GoogleResponse {
  candidates: {
    content: {
      parts: {
        text?: string;
      }[];
    };
  }[];
}

// Provider-specific error type
export class GoogleError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "GoogleError";
  }
}

/**
 * Implementation of the Google LLM client
 */
export class GoogleClient extends BaseClient {
  protected readonly providerName = "google";
  // Will be set dynamically in the getRequestUrl method
  protected readonly apiBaseUrl = "";
  protected readonly supportedModels: GoogleModel[] = [
    "gemini-2.0-pro",
    "gemini-2.0-flash",
  ];
  protected readonly defaultModel: GoogleModel = "gemini-2.0-pro";
  protected readonly capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 32768,
  };

  /**
   * Get the API URL which includes the model and API key
   */
  private getRequestUrl(model: string, apiKey: string): string {
    return `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
  }

  /**
   * Override the handleStandardRequest method to use the dynamic URL
   */
  protected async handleStandardRequest(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    abortSignal?: AbortSignal,
  ): Promise<string> {
    const requestBody = this.createRequestBody(messages, model, settings);
    const headers = this.getRequestHeaders(apiKey);
    const url = this.getRequestUrl(model, apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: abortSignal,
    });

    if (!response.ok) {
      await this.handleResponseError(response);
    }

    const data = await response.json();
    return this.extractContentFromResponse(data);
  }

  /**
   * Convert the application's message format to Google's format
   */
  protected convertMessages(messages: Message[]): GoogleContent[] {
    return messages.map((msg) => ({
      role: msg.senderId === "assistant" ? "model" : msg.senderId,
      parts: [{ text: msg.text }],
    }));
  }

  /**
   * Create a request body for the Google API
   */
  protected createRequestBody(
    messages: Message[],
    _model: LLMModel,
    settings?: LLMSettings,
    _streaming?: boolean,
  ): GoogleRequest {
    const googleContents = this.convertMessages(messages);

    return {
      contents: googleContents,
      generationConfig: {
        temperature: settings?.temperature ?? 0.7,
        maxOutputTokens: settings?.maxTokens ?? 800,
        topP: settings?.topP ?? 0.95,
        topK: 40,
      },
    };
  }

  /**
   * Extract the content from a Google API response
   */
  protected extractContentFromResponse(responseData: unknown): string {
    const data = responseData as GoogleResponse;

    if (!data.candidates?.[0]?.content?.parts) {
      throw new LLMError(
        LLMErrorType.API_ERROR,
        "Invalid response format from Google API",
        { provider: this.providerName },
      );
    }

    // Extract the response text from the first candidate's parts
    return data.candidates[0].content.parts
      .map((part) => part.text ?? "")
      .join("");
  }

  /**
   * Extract token content from a Google streaming chunk
   *
   * Note: This is a placeholder. Google's actual streaming format
   * would need to be implemented.
   */
  protected extractTokenFromStreamChunk(_chunk: unknown): string | null {
    // Google streaming implementation would go here
    return null;
  }

  /**
   * Get request headers for the Google API
   */
  protected getRequestHeaders(_apiKey: string): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Check if an error is a Google-specific error
   */
  protected isProviderSpecificError(error: unknown): boolean {
    return error instanceof GoogleError;
  }

  /**
   * Convert Google-specific errors to standard LLMError format
   */
  protected convertToStandardError(error: unknown): LLMError {
    const googleError = error as GoogleError;

    return new LLMError(LLMErrorType.API_ERROR, googleError.message, {
      originalError: googleError,
      provider: this.providerName,
    });
  }

  /**
   * Override the streamMessage method since Google streaming
   * might require special handling
   */
  async *streamMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    _abortSignal?: AbortSignal,
  ): AsyncIterable<import("../../../types/streaming").StreamingResponse> {
    // For now, let's implement a simple version that just returns
    // a complete response (no actual streaming)
    try {
      const response = await this.sendMessage(
        messages,
        apiKey,
        model,
        settings,
      );
      yield { done: false, token: response };
      yield { done: true };
    } catch (error) {
      const standardError = this.handleError(error);
      yield { done: true, error: standardError };
    }
  }
}
