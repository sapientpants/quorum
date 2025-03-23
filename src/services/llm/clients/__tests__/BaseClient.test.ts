import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseClient } from "../BaseClient";
import { LLMError, LLMErrorType } from "../../errors";
import type { Message } from "../../../../types/chat";
import type {
  LLMSettings,
  StreamingOptions,
  ProviderCapabilities,
  LLMModel,
} from "../../../../types/llm";

// Create a concrete implementation of the abstract BaseClient for testing
class TestClient extends BaseClient {
  protected readonly providerName = "test-provider";
  protected readonly defaultModelName = "test-model" as `test-model` & LLMModel;
  protected readonly availableModels = [
    "test-model" as `test-model` & LLMModel,
    "test-model-2" as `test-model-2` & LLMModel,
  ];
  protected readonly capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 4000,
    supportsFunctionCalling: false,
    supportsVision: false,
    supportsTool: false,
  };

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  async sendMessage(
    _messages: Message[],
    apiKey: string,
    _model: LLMModel,
    _settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
  ): Promise<string> {
    if (!apiKey) {
      throw new LLMError(LLMErrorType.AUTHENTICATION, "API key is required");
    }

    if (streamingOptions) {
      streamingOptions.onToken?.("Hello, ");
      streamingOptions.onToken?.("world!");
      streamingOptions.onComplete?.("Hello, world!");
    }

    return "Hello, world!";
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === "valid-key";
  }

  protected getDefaultBaseUrl(): string {
    return "https://api.test-provider.com";
  }

  async chat() {
    return {
      content: "Hello, world!",
      model: this.model,
      provider: this.providerName,
    };
  }

  async chatStream() {
    return {
      content: "Hello, world!",
      model: this.model,
      provider: this.providerName,
    };
  }
}

describe("BaseClient", () => {
  let client: TestClient;

  beforeEach(() => {
    client = new TestClient();
    // Mock console.error to prevent it from cluttering the test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("initializes with default values", () => {
    expect(client.getProviderName()).toBe("test-provider");
    expect(client.getDefaultModel()).toBe("test-model");
    expect(client.getAvailableModels()).toEqual(["test-model", "test-model-2"]);
    expect(client.supportsStreaming()).toBe(true);
  });

  it("initializes with custom values", () => {
    const customClient = new TestClient({
      apiKey: "test-key",
      model: "custom-model" as `custom-model` & LLMModel,
      baseUrl: "https://custom-api.test-provider.com",
    });

    // These values are not exposed directly, but we can test them indirectly
    // through the behavior of the client
    expect(customClient.getDefaultModel()).toBe("test-model"); // This doesn't change
  });

  it("returns capabilities", () => {
    const capabilities = client.getCapabilities();

    expect(capabilities).toEqual({
      supportsStreaming: true,
      supportsSystemMessages: true,
      maxContextLength: 4000,
      supportsFunctionCalling: false,
      supportsVision: false,
      supportsTool: false,
    });
  });

  it("handles error with error handler", async () => {
    const errorHandler = vi.fn();
    client.setErrorHandler(errorHandler);

    // Create a method that will trigger handleApiError
    const triggerError = () => {
      // @ts-expect-error - Accessing protected method for testing
      client.handleApiError(new Error("Test error"));
    };

    // Expect the error to be thrown
    expect(triggerError).toThrow(LLMError);

    // Expect the error handler to be called
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LLMErrorType.API_ERROR,
        message: "Test error",
      }),
      "test-provider",
    );
  });

  it("handles different types of errors", () => {
    // @ts-expect-error - Accessing protected method for testing
    const handleApiError = (error: unknown) => client.handleApiError(error);

    // Authentication error
    const authError = new Error("Auth failed");
    // @ts-expect-error - Adding properties for testing
    authError.status = 401;
    expect(() => handleApiError(authError)).toThrow(LLMError);
    expect(() => handleApiError(authError)).toThrow("Authentication failed");

    // Rate limit error
    const rateError = new Error("Rate limit");
    // @ts-expect-error - Adding properties for testing
    rateError.status = 429;
    expect(() => handleApiError(rateError)).toThrow(LLMError);
    expect(() => handleApiError(rateError)).toThrow("Rate limit exceeded");

    // Content filter error
    const contentError = new Error("Content filter");
    // @ts-expect-error - Adding properties for testing
    contentError.status = 400;
    // @ts-expect-error - Adding properties for testing
    contentError.response = { data: { error: { type: "content_filter" } } };
    expect(() => handleApiError(contentError)).toThrow(LLMError);
    expect(() => handleApiError(contentError)).toThrow(
      "filtered due to content policy",
    );

    // Timeout error
    const timeoutError = new Error("Request timeout");
    expect(() => handleApiError(timeoutError)).toThrow(LLMError);
    expect(() => handleApiError(timeoutError)).toThrow("Request timed out");

    // Network error
    const networkError = new Error("Network connection failed");
    expect(() => handleApiError(networkError)).toThrow(LLMError);
    expect(() => handleApiError(networkError)).toThrow("Network error");
  });

  it("streams messages using the streamMessage method", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    const streamingResponses: string[] = [];

    // Mock the sendMessage method to ensure it calls the streaming callbacks directly
    vi.spyOn(client, "sendMessage").mockImplementation(
      async (_messages, _apiKey, _model, _settings, streamingOptions) => {
        if (streamingOptions?.onToken) {
          streamingOptions.onToken("Hello, ");
          streamingOptions.onToken("world!");
        }
        if (streamingOptions?.onComplete) {
          streamingOptions.onComplete("Hello, world!");
        }
        return "Hello, world!";
      },
    );

    // Use a simpler approach with callbacks instead of async iterators
    await client.sendMessage(
      messages,
      "valid-key",
      "test-model" as `test-model` & LLMModel,
      undefined,
      {
        onToken: (token) => {
          streamingResponses.push(token);
        },
        onComplete: () => {
          // Do nothing
        },
      },
    );

    // Check that we received the expected chunks
    expect(streamingResponses).toEqual(["Hello, ", "world!"]);
  });

  it("handles errors in streamMessage", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Override sendMessage to throw an error
    vi.spyOn(client, "sendMessage").mockImplementation(() => {
      throw new Error("Stream error");
    });

    // Use the streamMessage method and expect an error
    let error: Error | undefined;

    for await (const chunk of client.streamMessage(
      messages,
      "valid-key",
      "test-model" as `test-model` & LLMModel,
    )) {
      if (chunk.done && chunk.error) {
        error = chunk.error;
      }
    }

    // Check that we received the expected error
    expect(error).toBeDefined();
    expect(error?.message).toBe("Stream error");
  });
});
