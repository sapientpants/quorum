import type { Message } from "../../../types/chat";
import type { LLMSettings } from "../../../types/llm";
import type { LLMClient, StreamingOptions } from "../../../types/llm";
import type { ProviderCapabilities } from "../../../types/llm";
import type { StreamingResponse } from "../../../types/streaming";
import { LLMChatMessage, LLMResponse, LLMConfig } from "../types";
import { LLMError, LLMErrorType } from "../errors";

export abstract class BaseClient implements LLMClient {
  protected abstract readonly providerName: string;
  protected abstract readonly defaultModelName: string;
  protected abstract readonly availableModels: string[];
  protected abstract readonly capabilities: ProviderCapabilities;

  protected apiKey: string;
  protected model: string;
  protected baseUrl: string;

  // Placeholder for error handler to be attached via context
  protected setError?: (error: LLMError, provider: string) => void;

  constructor(config: Record<string, unknown> = {}) {
    this.apiKey = (config.apiKey as string) || "";
    this.model = (config.model as string) || this.getDefaultModel();
    this.baseUrl = (config.baseUrl as string) || this.getDefaultBaseUrl();
    // Don't access abstract property in constructor
    // this.providerName = this.getProviderName();
  }

  /**
   * Set the error handler function
   * This is typically set by the component that uses the client
   */
  public setErrorHandler(handler: (error: LLMError, provider: string) => void) {
    this.setError = handler;
  }

  abstract sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal,
  ): Promise<string>;

  abstract validateApiKey(apiKey: string): Promise<boolean>;

  /**
   * Stream a message to the LLM and get a response as an async iterable
   * This is the new streaming method that uses AsyncIterable
   *
   * Default implementation that uses the callback-based streaming
   * Subclasses should override this with a more efficient implementation
   */
  async *streamMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    abortSignal?: AbortSignal,
  ): AsyncIterable<StreamingResponse> {
    try {
      // Create a promise that will be resolved when streaming is complete
      let resolveComplete: (value: string) => void;
      let rejectComplete: (reason: Error) => void;

      const completionPromise = new Promise<string>((resolve, reject) => {
        resolveComplete = resolve;
        rejectComplete = reject;
      });

      // Set up streaming options with callbacks that yield tokens
      const streamingOptions: StreamingOptions = {
        onToken: (token: string) => {
          // Yield the token
          this.yieldToken({ done: false, token });
        },
        onComplete: () => {
          // Resolve the completion promise with an empty string
          // The actual full text isn't needed here since we're streaming tokens
          resolveComplete("");
        },
        onError: (error: Error) => {
          // Reject the completion promise
          rejectComplete(error);
        },
      };

      // Start the streaming request
      this.sendMessage(
        messages,
        apiKey,
        model,
        settings,
        streamingOptions,
        abortSignal,
      ).catch((error) => {
        if (rejectComplete) {
          rejectComplete(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });

      // Use a custom async iterator to yield tokens as they arrive
      let yieldResolve:
        | ((value: IteratorResult<StreamingResponse>) => void)
        | null = null;
      let yieldValue: StreamingResponse | null = null;

      const iterator = {
        [Symbol.asyncIterator]() {
          return {
            next: async (): Promise<IteratorResult<StreamingResponse>> => {
              // If we have a value to yield, return it and clear it
              if (yieldValue) {
                const value = yieldValue;
                yieldValue = null;
                return { done: value.done, value };
              }

              // Otherwise, wait for the next value or completion
              try {
                // Create a promise that will be resolved when a new token arrives
                const nextValuePromise = new Promise<
                  IteratorResult<StreamingResponse>
                >((resolve) => {
                  yieldResolve = resolve;
                });

                // Race between the completion promise and the next value promise
                const result = await Promise.race([
                  completionPromise.then(() => ({
                    done: true,
                    value: { done: true },
                  })),
                  nextValuePromise,
                ]);

                return result;
              } catch (error) {
                // If there's an error, yield it and mark as done
                return {
                  done: true,
                  value: {
                    done: true,
                    error:
                      error instanceof Error ? error : new Error(String(error)),
                  },
                };
              }
            },
          };
        },
      };

      // Helper method to yield tokens
      this.yieldToken = (value: StreamingResponse) => {
        if (yieldResolve) {
          yieldResolve({ done: value.done, value });
          yieldResolve = null;
        } else {
          yieldValue = value;
        }
      };

      // Yield tokens from the iterator
      yield* iterator;
    } catch (error) {
      // If there's an error, yield it and mark as done
      yield {
        done: true,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  getAvailableModels(): string[] {
    return this.availableModels;
  }

  getDefaultModel(): string {
    return this.defaultModelName;
  }

  getProviderName(): string {
    return this.providerName;
  }

  supportsStreaming(): boolean {
    return (
      this.capabilities.supportsStreaming &&
      typeof ReadableStream !== "undefined" &&
      typeof TextDecoder !== "undefined"
    );
  }

  getCapabilities(): ProviderCapabilities {
    return this.capabilities;
  }

  /**
   * Helper method to handle API errors
   */
  protected handleApiError(error: unknown): never {
    console.error("LLM API Error:", error);

    let llmError: LLMError;

    if (error instanceof LLMError) {
      llmError = error;
    } else {
      // Convert various error types to our standard LLMError format
      const errorObj = error as Error & {
        status?: number;
        statusCode?: number;
        response?: {
          status?: number;
          data?: unknown;
        };
        data?: unknown;
      };
      const status =
        errorObj.status || errorObj.statusCode || errorObj.response?.status;
      const errorBody = (errorObj.response?.data || errorObj.data || {}) as {
        request_id?: string;
        requestId?: string;
        error?: {
          type?: string;
          code?: string;
        };
      };
      const errorMessage = errorObj.message || "Unknown error occurred";

      if (status === 401 || status === 403) {
        llmError = new LLMError(
          LLMErrorType.AUTHENTICATION,
          "Authentication failed. Please check your API key.",
          {
            statusCode: status,
            originalError: error,
            requestId: errorBody.request_id || errorBody.requestId || null,
          },
        );
      } else if (status === 429) {
        llmError = new LLMError(
          LLMErrorType.RATE_LIMIT,
          "Rate limit exceeded. Please try again later.",
          {
            statusCode: status,
            originalError: error,
            requestId: errorBody.request_id || errorBody.requestId || null,
          },
        );
      } else if (
        status === 400 &&
        (errorBody.error?.type === "content_filter" ||
          errorBody.error?.code === "content_filter")
      ) {
        llmError = new LLMError(
          LLMErrorType.CONTENT_FILTER,
          "Your request was filtered due to content policy violation.",
          {
            statusCode: status,
            originalError: error,
            requestId: errorBody.request_id || errorBody.requestId || null,
          },
        );
      } else if (errorMessage && errorMessage.includes("timeout")) {
        llmError = new LLMError(
          LLMErrorType.TIMEOUT,
          "Request timed out. Please try again.",
          {
            statusCode: status || 408,
            originalError: error,
            requestId: errorBody.request_id || errorBody.requestId || null,
          },
        );
      } else if (
        errorMessage &&
        (errorMessage.includes("network") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("offline"))
      ) {
        llmError = new LLMError(
          LLMErrorType.NETWORK,
          "Network error. Please check your internet connection.",
          {
            statusCode: status || 0,
            originalError: error,
          },
        );
      } else {
        llmError = new LLMError(LLMErrorType.API_ERROR, errorMessage, {
          statusCode: status || 500,
          originalError: error,
          requestId: errorBody.request_id || errorBody.requestId || null,
        });
      }
    }

    // If an error handler is set, use it
    if (this.setError) {
      this.setError(llmError, this.providerName);
    }

    throw llmError;
  }

  // Helper method for the streaming implementation
  private yieldToken: (value: StreamingResponse) => void = () => {};

  /**
   * Get the default base URL for this provider's API
   */
  protected abstract getDefaultBaseUrl(): string;

  /**
   * Send a chat completion request to the LLM provider
   */
  public abstract chat(
    messages: LLMChatMessage[],
    config?: Partial<LLMConfig>,
  ): Promise<LLMResponse>;

  /**
   * Generate a streaming chat response
   */
  public abstract chatStream(
    messages: LLMChatMessage[],
    onChunk: (chunk: string) => void,
    config?: Partial<LLMConfig>,
  ): Promise<LLMResponse>;
}
