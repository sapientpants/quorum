import type { Message } from "../../../types/chat";
import type {
  LLMClient,
  LLMSettings,
  LLMModel,
  StreamingOptions,
  ProviderCapabilities,
} from "../../../types/llm";
import type { StreamingResponse } from "../../../types/streaming";
import { LLMError, LLMErrorType } from "../errors";

/**
 * BaseClient provides common functionality for all LLM clients.
 * This abstract class handles shared logic like error handling and streaming.
 */
export abstract class BaseClient implements LLMClient {
  // Abstract properties to be implemented by provider-specific clients
  protected abstract readonly providerName: string;
  protected abstract readonly supportedModels: LLMModel[];
  protected abstract readonly defaultModel: LLMModel;
  protected abstract readonly apiBaseUrl: string;
  protected abstract readonly capabilities: ProviderCapabilities;

  /**
   * Convert the application's message format to the provider-specific format
   */
  protected abstract convertMessages(messages: Message[]): unknown;

  /**
   * Create a request body for the provider's API
   */
  protected abstract createRequestBody(
    messages: Message[],
    model: LLMModel,
    settings?: LLMSettings,
    streaming?: boolean,
  ): unknown;

  /**
   * Process the API response to extract the text content
   */
  protected abstract extractContentFromResponse(responseData: unknown): string;

  /**
   * Process a streaming chunk to extract token content
   */
  protected abstract extractTokenFromStreamChunk(chunk: unknown): string | null;

  /**
   * Check if an error is specific to this provider
   */
  protected abstract isProviderSpecificError(error: unknown): boolean;

  /**
   * Convert provider-specific errors to a standard LLMError
   */
  protected abstract convertToStandardError(error: unknown): LLMError;

  /**
   * Sends a message to the LLM provider and returns the response
   */
  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel = this.defaultModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal,
  ): Promise<string> {
    if (!apiKey) {
      throw new LLMError(LLMErrorType.AUTHENTICATION, "API key is required", {
        provider: this.providerName,
      });
    }

    if (!this.supportedModels.includes(model)) {
      throw new LLMError(
        LLMErrorType.INVALID_MODEL,
        `Model ${model} is not supported. Available models: ${this.supportedModels.join(", ")}`,
        { provider: this.providerName },
      );
    }

    try {
      if (this.supportsStreaming() && streamingOptions) {
        return await this.handleStreamingRequest(
          messages,
          apiKey,
          model,
          settings,
          streamingOptions,
          abortSignal,
        );
      } else {
        return await this.handleStandardRequest(
          messages,
          apiKey,
          model,
          settings,
          abortSignal,
        );
      }
    } catch (error) {
      const standardError = this.handleError(error);

      if (streamingOptions?.onError) {
        streamingOptions.onError(standardError);
      }

      throw standardError;
    }
  }

  /**
   * Handle a standard (non-streaming) request to the LLM provider
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

    const response = await fetch(this.apiBaseUrl, {
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
   * Handle a streaming request to the LLM provider
   */
  protected async handleStreamingRequest(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal,
  ): Promise<string> {
    const requestBody = this.createRequestBody(messages, model, settings, true);
    const headers = this.getRequestHeaders(apiKey);

    const response = await fetch(this.apiBaseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: abortSignal,
    });

    if (!response.ok) {
      await this.handleResponseError(response);
    }

    if (!response.body) {
      throw new LLMError(LLMErrorType.API_ERROR, "Response body is null", {
        provider: this.providerName,
      });
    }

    return await this.processStreamingResponse(response.body, streamingOptions);
  }

  /**
   * Process a streaming response body
   */
  protected async processStreamingResponse(
    responseBody: ReadableStream<Uint8Array>,
    streamingOptions?: StreamingOptions,
  ): Promise<string> {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = this.parseStreamChunk(chunk);

        for (const line of lines) {
          const token = this.processStreamLine(line);
          if (token) {
            fullText += token;
            if (streamingOptions?.onToken) {
              streamingOptions.onToken(token);
            }
          }
        }
      }

      if (streamingOptions?.onComplete) {
        streamingOptions.onComplete(fullText);
      }

      return fullText;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse a chunk of streamed data into lines
   */
  protected parseStreamChunk(chunk: string): string[] {
    return chunk
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.includes("[DONE]"));
  }

  /**
   * Process a line from the stream
   */
  protected processStreamLine(line: string): string | null {
    if (line.startsWith("data: ")) {
      try {
        const jsonStr = line.slice(6); // Remove the 'data: ' prefix
        const data = JSON.parse(jsonStr);
        return this.extractTokenFromStreamChunk(data);
      } catch (e) {
        console.warn("Error parsing JSON from stream:", e);
      }
    }
    return null;
  }

  /**
   * Handle API response errors
   */
  protected async handleResponseError(response: Response): Promise<never> {
    const status = response.status;
    let errorData: unknown = {};

    try {
      errorData = await response.json();
    } catch (_) {
      // If we can't parse the JSON, just use an empty object
    }

    let errorType: LLMErrorType;
    let errorMessage: string;

    if (status === 401 || status === 403) {
      errorType = LLMErrorType.AUTHENTICATION;
      errorMessage = "Authentication failed. Please check your API key.";
    } else if (status === 429) {
      errorType = LLMErrorType.RATE_LIMIT;
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (status === 404) {
      errorType = LLMErrorType.INVALID_MODEL;
      errorMessage = "The requested model is not available.";
    } else {
      errorType = LLMErrorType.API_ERROR;
      errorMessage = `${status} ${response.statusText}`;
    }

    throw new LLMError(errorType, errorMessage, {
      statusCode: status,
      responseData: errorData,
      provider: this.providerName,
    });
  }

  /**
   * Get request headers for the provider's API
   */
  protected abstract getRequestHeaders(apiKey: string): HeadersInit;

  /**
   * Handle errors and convert them to standard LLMError types
   */
  protected handleError(error: unknown): LLMError {
    // If it's already an LLMError, just return it
    if (error instanceof LLMError) {
      return error;
    }

    // If it's a provider-specific error, convert it
    if (this.isProviderSpecificError(error)) {
      return this.convertToStandardError(error);
    }

    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common error patterns
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out")
    ) {
      return new LLMError(
        LLMErrorType.TIMEOUT,
        "Request timed out. Please try again.",
        { originalError: error, provider: this.providerName },
      );
    }

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("offline")
    ) {
      return new LLMError(
        LLMErrorType.NETWORK,
        "Network error. Please check your internet connection.",
        { originalError: error, provider: this.providerName },
      );
    }

    // Default to generic API error
    return new LLMError(
      LLMErrorType.API_ERROR,
      `An error occurred while calling the ${this.providerName} API: ${errorMessage}`,
      { originalError: error, provider: this.providerName },
    );
  }

  /**
   * Checks if the provider supports streaming
   */
  supportsStreaming(): boolean {
    return (
      this.capabilities.supportsStreaming &&
      typeof ReadableStream !== "undefined" &&
      typeof TextDecoder !== "undefined"
    );
  }

  /**
   * Stream a message to the LLM and get a response as an async iterable
   */
  async *streamMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    abortSignal?: AbortSignal,
  ): AsyncIterable<StreamingResponse> {
    if (!apiKey) {
      yield {
        done: true,
        error: new LLMError(
          LLMErrorType.AUTHENTICATION,
          "API key is required",
          { provider: this.providerName },
        ),
      };
      return;
    }

    if (!this.capabilities.supportsStreaming) {
      yield {
        done: true,
        error: new LLMError(
          LLMErrorType.UNSUPPORTED_OPERATION,
          `Streaming is not supported by ${this.providerName}`,
          { provider: this.providerName },
        ),
      };
      return;
    }

    const controller = new AbortController();
    const signal = abortSignal
      ? AbortSignal.any([abortSignal, controller.signal])
      : controller.signal;

    try {
      const requestBody = this.createRequestBody(
        messages,
        model,
        settings,
        true,
      );
      const headers = this.getRequestHeaders(apiKey);

      const response = await fetch(this.apiBaseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      if (!response.body) {
        throw new LLMError(LLMErrorType.API_ERROR, "Response body is null", {
          provider: this.providerName,
        });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = this.parseStreamChunk(chunk);

          for (const line of lines) {
            const token = this.processStreamLine(line);
            if (token) {
              yield { done: false, token };
            }
          }
        }

        // Yield a final done response
        yield { done: true };
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      const standardError = this.handleError(error);
      yield { done: true, error: standardError };
    } finally {
      // Clean up if not already aborted
      if (!signal.aborted) {
        controller.abort();
      }
    }
  }

  /**
   * Get the available models for this provider
   */
  getAvailableModels(): LLMModel[] {
    return this.supportedModels;
  }

  /**
   * Get the default model for this provider
   */
  getDefaultModel(): LLMModel {
    return this.defaultModel;
  }

  /**
   * Get the provider name
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Get the provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return this.capabilities;
  }

  /**
   * Validate the API key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;

    try {
      // Perform a minimal API call to validate the key
      const minimalMessages = [
        {
          senderId: "user",
          text: "test",
          id: "test",
          timestamp: Date.now(),
        },
      ];
      const model = this.getDefaultModel();

      // Use the smallest possible request
      const settings: LLMSettings = {
        maxTokens: 1,
        temperature: 0,
      };

      await this.handleStandardRequest(
        minimalMessages,
        apiKey,
        model,
        settings,
      );
      return true;
    } catch (error) {
      console.warn(
        `API key validation failed for ${this.providerName}:`,
        error,
      );
      return false;
    }
  }
}
