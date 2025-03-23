import type { Message } from "../../types/chat";
import type {
  LLMSettings,
  StreamingOptions,
  OpenAIModel,
  LLMModel,
} from "../../types/llm";
import type { StreamingResponse } from "../../types/streaming";
import { BaseClient } from "./clients/BaseClient";
import { LLMError, ErrorType } from "./LLMError";

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

/**
 * OpenAI client with efficient streaming implementation
 */
export class OpenAIStreamClient extends BaseClient {
  protected readonly providerName = "openai";
  protected readonly defaultModelName = "gpt-4o" as OpenAIModel;
  protected readonly availableModels: OpenAIModel[] = [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ];
  protected readonly capabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 8192,
    supportsFunctionCalling: true,
    supportsVision: true,
    supportsTool: true,
  };

  constructor(config: Record<string, unknown> = {}) {
    super({ ...config });
  }

  protected getDefaultBaseUrl(): string {
    return "https://api.openai.com/v1";
  }

  /**
   * Convert our app's message format to OpenAI's format
   */
  private convertToOpenAIMessages(messages: Message[]): OpenAIMessage[] {
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
   * Send a message to the LLM and get a response
   */
  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel = this.defaultModelName,
    settings?: LLMSettings,
    _streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal,
  ): Promise<string> {
    if (!apiKey) {
      throw new LLMError(
        ErrorType.MISSING_API_KEY,
        "OpenAI API key is required",
      );
    }

    const openAIMessages = this.convertToOpenAIMessages(messages);

    const requestBody: OpenAIRequest = {
      model,
      messages: openAIMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      frequency_penalty: settings?.frequencyPenalty,
      presence_penalty: settings?.presencePenalty,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new LLMError(
        ErrorType.API_ERROR,
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();

    if (!data.choices?.length) {
      throw new LLMError(ErrorType.API_ERROR, "No response from OpenAI");
    }

    return data.choices[0].message.content;
  }

  /**
   * Validate an API key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
      return false;
    }

    try {
      // Make a minimal API call to check if the key is valid
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      return response.ok;
    } catch (_error) {
      console.error("Error validating OpenAI API key:", _error);
      return false;
    }
  }

  /**
   * Stream a message to the LLM and get a response as an async iterable
   */
  async *streamMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel = this.defaultModelName,
    settings?: LLMSettings,
    abortSignal?: AbortSignal,
  ): AsyncIterable<StreamingResponse> {
    // Validate API key
    if (!apiKey) {
      yield {
        done: true,
        error: new LLMError(
          ErrorType.MISSING_API_KEY,
          "OpenAI API key is required",
        ),
      };
      return;
    }

    // Check if streaming is supported
    if (!this.isStreamingSupported()) {
      yield* this.fallbackToRegularSendMessage(
        messages,
        apiKey,
        model,
        settings,
      );
      return;
    }

    try {
      // Prepare request
      const request = this.prepareStreamRequest(
        messages,
        apiKey,
        model,
        settings,
        abortSignal,
      );
      const response = await this.makeStreamRequest(request);

      // Process the stream
      yield* this.processStream(response);
    } catch (error) {
      yield {
        done: true,
        error: this.handleStreamError(error),
      };
    }
  }

  /**
   * Check if streaming is supported in the current environment
   */
  private isStreamingSupported(): boolean {
    return (
      typeof ReadableStream !== "undefined" &&
      typeof TextDecoder !== "undefined"
    );
  }

  /**
   * Fallback to regular sendMessage when streaming is not supported
   */
  private async *fallbackToRegularSendMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
  ): AsyncIterable<StreamingResponse> {
    const response = await this.sendMessage(messages, apiKey, model, settings);
    yield { done: false, token: response };
    yield { done: true };
  }

  /**
   * Prepare the request for streaming
   */
  private prepareStreamRequest(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    abortSignal?: AbortSignal,
  ): {
    url: string;
    options: RequestInit;
    body: OpenAIRequest;
  } {
    const openAIMessages = this.convertToOpenAIMessages(messages);

    const requestBody: OpenAIRequest = {
      model: model as string,
      messages: openAIMessages,
      stream: true,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      frequency_penalty: settings?.frequencyPenalty,
      presence_penalty: settings?.presencePenalty,
    };

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: abortSignal,
    };

    return {
      url: `${this.baseUrl}/chat/completions`,
      options,
      body: requestBody,
    };
  }

  /**
   * Make the streaming request
   */
  private async makeStreamRequest(request: {
    url: string;
    options: RequestInit;
  }): Promise<Response> {
    const response = await fetch(request.url, request.options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new LLMError(
        ErrorType.API_ERROR,
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
      );
    }

    if (!response.body) {
      throw new LLMError(ErrorType.API_ERROR, "Response body is null");
    }

    return response;
  }

  /**
   * Process the streaming response
   */
  private async *processStream(
    response: Response,
  ): AsyncIterable<StreamingResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          yield { done: true };
          break;
        }

        const chunk = decoder.decode(value);
        yield* this.processChunk(chunk);
      }
    } catch (error) {
      yield {
        done: true,
        error: this.handleStreamError(error),
      };
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process a chunk of the streaming response
   */
  private *processChunk(chunk: string): Iterable<StreamingResponse> {
    const lines = chunk
      .split("\n")
      .filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const jsonStr = line.slice(6); // Remove 'data: ' prefix
          const json = JSON.parse(jsonStr);

          if (json.choices?.[0]?.delta?.content) {
            yield {
              done: false,
              token: json.choices[0].delta.content,
            };
          }
        } catch (e) {
          console.warn("Error parsing JSON from stream:", e);
        }
      }
    }
  }

  /**
   * Handle errors from streaming
   */
  private handleStreamError(error: unknown): LLMError {
    console.error("Error in OpenAI stream:", error);

    if (error instanceof LLMError) {
      return error;
    }

    return new LLMError(
      ErrorType.API_ERROR,
      error instanceof Error ? error.message : "Unknown streaming error",
    );
  }

  async chat(
    messages: import("./types").LLMChatMessage[],
    config?: Partial<import("./types").LLMConfig>,
  ): Promise<import("./types").LLMResponse> {
    const apiKey = (config?.apiKey as string) || this.apiKey;
    const model = (config?.model as LLMModel) || this.defaultModelName;
    const settings = config as import("../../types/llm").LLMSettings;
    const abortSignal = undefined;

    const content = await this.sendMessage(
      this.convertToMessages(messages),
      apiKey,
      model,
      settings,
      undefined,
      abortSignal,
    );

    return {
      content,
      model: model as string,
      provider: this.providerName,
    };
  }

  async chatStream(
    messages: import("./types").LLMChatMessage[],
    onChunk: (chunk: string) => void,
    config?: Partial<import("./types").LLMConfig>,
  ): Promise<import("./types").LLMResponse> {
    const apiKey = (config?.apiKey as string) || this.apiKey;
    const model = (config?.model as LLMModel) || this.defaultModelName;
    const settings = config as import("../../types/llm").LLMSettings;
    const abortSignal = undefined;

    let fullContent = "";

    const streamingOptions: import("../../types/llm").StreamingOptions = {
      onToken: (token) => {
        onChunk(token);
        fullContent += token;
      },
    };

    await this.sendMessage(
      this.convertToMessages(messages),
      apiKey,
      model,
      settings,
      streamingOptions,
      abortSignal,
    );

    return {
      content: fullContent,
      model,
      provider: this.providerName,
    };
  }

  // Helper method to convert LLMChatMessage[] to Message[]
  private convertToMessages(
    messages: import("./types").LLMChatMessage[],
  ): import("../../types/chat").Message[] {
    return messages.map((msg, index) => ({
      id: `msg-${index}`,
      senderId: msg.role,
      text: msg.content,
      timestamp: Date.now(),
      role: msg.role,
    }));
  }
}
