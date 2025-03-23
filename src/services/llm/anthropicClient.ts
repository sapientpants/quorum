import type { Message } from "../../types/chat";
import type {
  LLMClient,
  LLMSettings,
  StreamingOptions,
  ProviderCapabilities,
  AnthropicModel,
  LLMModel,
} from "../../types/llm";
import type { StreamingResponse } from "../../types/streaming";

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

class AnthropicAuthError extends AnthropicError {
  constructor(message = "Invalid or missing API key") {
    super(message, "auth_error");
    this.name = "AnthropicAuthError";
  }
}

class AnthropicRateLimitError extends AnthropicError {
  constructor(message = "Rate limit exceeded") {
    super(message, "rate_limit_error");
    this.name = "AnthropicRateLimitError";
  }
}

class AnthropicModelError extends AnthropicError {
  constructor(message = "Invalid model or model not available") {
    super(message, "model_error");
    this.name = "AnthropicModelError";
  }
}

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

interface AnthropicResponse {
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

export class AnthropicClient implements LLMClient {
  private readonly supportedModels: AnthropicModel[] = [
    "claude-3.7-sonnet",
    "claude-3.5-sonnet",
    "claude-3.5-haiku",
  ];

  private readonly defaultModel: AnthropicModel = "claude-3.7-sonnet";

  // Convert our app's message format to Anthropic's format
  private convertToAnthropicMessages(messages: Message[]): {
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
          role: role as "user" | "assistant",
          content: message.text,
        };
      });

    return {
      messages: anthropicMessages,
      system: systemPrompt,
    };
  }

  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel = this.defaultModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
  ): Promise<string> {
    if (!apiKey) {
      throw new AnthropicAuthError();
    }

    if (!this.supportedModels.includes(model)) {
      throw new AnthropicModelError(
        `Model ${model} is not available. Available models: ${this.supportedModels.join(", ")}`,
      );
    }

    const { messages: anthropicMessages, system } =
      this.convertToAnthropicMessages(messages);

    const requestBody: AnthropicRequest = {
      model,
      messages: anthropicMessages,
      system,
      max_tokens: settings?.maxTokens ?? 1000,
      temperature: settings?.temperature,
      top_p: settings?.topP,
      stream: !!streamingOptions,
    };

    try {
      if (this.supportsStreaming() && streamingOptions) {
        return await this.streamResponse(requestBody, apiKey, streamingOptions);
      } else {
        return await this.standardResponse(requestBody, apiKey);
      }
    } catch (error) {
      // Convert generic errors to Anthropic-specific errors
      const anthropicError = this.handleError(error);

      if (streamingOptions?.onError) {
        streamingOptions.onError(anthropicError);
      }

      throw anthropicError;
    }
  }

  private handleError(error: unknown): AnthropicError {
    if (error instanceof AnthropicError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle common error cases
    if (errorMessage.includes("401") || errorMessage.includes("403")) {
      return new AnthropicAuthError("Invalid or expired API key");
    }
    if (errorMessage.includes("429")) {
      return new AnthropicRateLimitError(
        "Too many requests. Please try again later",
      );
    }
    if (errorMessage.includes("404")) {
      return new AnthropicModelError("The requested model is not available");
    }

    // Generic error case
    return new AnthropicError(
      "An error occurred while calling the Anthropic API: " + errorMessage,
      "unknown_error",
      error,
    );
  }

  private async streamResponse(
    requestBody: AnthropicRequest,
    apiKey: string,
    streamingOptions: StreamingOptions,
  ): Promise<string> {
    // Helper function to make the API request
    const makeStreamRequest = async (): Promise<Response> => {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({ ...requestBody, stream: true }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw this.handleError(
            new Error(
              `${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
            ),
          );
        }

        if (!response.body) {
          throw new AnthropicError("No response body from Anthropic");
        }

        return response;
      } catch (error) {
        throw this.handleError(error);
      }
    };

    // Helper function to process a streaming line
    const processStreamLine = (
      line: string,
      fullText: string,
    ): { fullText: string; shouldContinue: boolean } => {
      if (!line.startsWith("data:") || line.includes("[DONE]")) {
        return { fullText, shouldContinue: true };
      }

      try {
        const data = JSON.parse(line.slice(5));
        const content = data.delta?.text ?? "";

        if (content) {
          const newFullText = fullText + content;
          if (streamingOptions.onToken) {
            streamingOptions.onToken(content);
          }
          return { fullText: newFullText, shouldContinue: true };
        }
      } catch (e) {
        console.warn("Error parsing streaming response line:", e);
      }

      return { fullText, shouldContinue: true };
    };

    // Main streaming logic
    let fullText = "";
    const response = await makeStreamRequest();

    if (!response.body) {
      throw new AnthropicError("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          const result = processStreamLine(line, fullText);
          fullText = result.fullText;
          if (!result.shouldContinue) break;
        }
      }
    } catch (error) {
      throw this.handleError(error);
    } finally {
      reader.releaseLock();
    }

    if (streamingOptions.onComplete) {
      streamingOptions.onComplete(fullText);
    }

    return fullText;
  }

  private async standardResponse(
    requestBody: AnthropicRequest,
    apiKey: string,
  ): Promise<string> {
    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      throw this.handleError(error);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw this.handleError(
        new Error(
          `${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
        ),
      );
    }

    const data: AnthropicResponse = await response.json();

    if (!data.content?.length) {
      throw new AnthropicError("No response from Anthropic");
    }

    return data.content[0].text;
  }

  getAvailableModels(): LLMModel[] {
    return this.supportedModels;
  }

  getDefaultModel(): LLMModel {
    return this.defaultModel;
  }

  getProviderName(): string {
    return "anthropic";
  }

  supportsStreaming(): boolean {
    return (
      typeof ReadableStream !== "undefined" &&
      typeof TextDecoder !== "undefined"
    );
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsSystemMessages: true,
      maxContextLength: 100000,
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Simple validation check - try to get models list
      await this.standardResponse(
        {
          model: this.defaultModel,
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1,
        },
        apiKey,
      );
      return true;
    } catch (_error) {
      return false;
    }
  }

  async *streamMessage?(
    _messages: Message[],
    _apiKey: string,
    _model: LLMModel,
    _settings?: LLMSettings,
    _abortSignal?: AbortSignal,
  ): AsyncIterable<StreamingResponse> {
    // Yield an error response with proper explanation
    yield {
      done: true,
      error: new Error("Direct streaming not implemented for Anthropic"),
    };
  }
}
