import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnthropicClient } from "../anthropicClient";
import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  StreamingOptions,
  LLMModel,
} from "../../../types/llm";

// Mock fetch
global.fetch = vi.fn();

describe("AnthropicClient", () => {
  let client: AnthropicClient;

  beforeEach(() => {
    client = new AnthropicClient();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the correct provider name", () => {
    expect(client.getProviderName()).toBe("anthropic");
  });

  it("returns the correct available models", () => {
    const models = client.getAvailableModels();
    expect(models).toContain("claude-3.7-sonnet");
    expect(models).toContain("claude-3.5-sonnet");
    expect(models).toContain("claude-3.5-haiku");
  });

  it("returns the correct default model", () => {
    expect(client.getDefaultModel()).toBe("claude-3.7-sonnet");
  });

  it("indicates if streaming is supported", () => {
    // This depends on the environment, but we can at least verify it returns a boolean
    expect(typeof client.supportsStreaming()).toBe("boolean");
  });

  it("throws an error when sending a message without an API key", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    await expect(client.sendMessage(messages, "")).rejects.toThrow(
      "Invalid or missing API key",
    );
  });

  it("throws an error when using an unsupported model", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    await expect(
      client.sendMessage(
        messages,
        "test-key",
        "unsupported-model" as unknown as LLMModel,
      ),
    ).rejects.toThrow("Model unsupported-model is not available");
  });

  it("converts messages to Anthropic format correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "system",
        text: "You are a helpful assistant",
        timestamp: Date.now(),
      },
      {
        id: "2",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
      {
        id: "3",
        senderId: "assistant",
        text: "Hi there",
        timestamp: Date.now(),
      },
    ];

    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        content: [{ type: "text", text: "Hello from Claude" }],
      }),
    } as Response);

    await client.sendMessage(messages, "test-key");

    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "test-key",
          "anthropic-version": "2023-06-01",
        }),
        body: expect.stringContaining('"system":"You are a helpful assistant"'),
      }),
    );

    // Check that the messages were converted correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining(
          '"messages":[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there"}]',
        ),
      }),
    );
  });

  it("sends settings correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    const settings: LLMSettings = {
      temperature: 0.7,
      maxTokens: 100,
      topP: 0.9,
    };

    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        content: [{ type: "text", text: "Hello from Claude" }],
      }),
    } as Response);

    await client.sendMessage(
      messages,
      "test-key",
      "claude-3.7-sonnet",
      settings,
    );

    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
      }),
    );

    // Parse the request body to check the settings
    const fetchCalls = vi.mocked(fetch).mock.calls;
    expect(fetchCalls.length).toBeGreaterThan(0);

    const requestBody = JSON.parse(fetchCalls[0][1]?.body as string);
    expect(requestBody).toMatchObject({
      temperature: 0.7,
      max_tokens: 100,
      top_p: 0.9,
    });
  });

  it("returns the response content from a standard request", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        content: [{ type: "text", text: "Hello from Claude" }],
      }),
    } as Response);

    const response = await client.sendMessage(messages, "test-key");

    expect(response).toBe("Hello from Claude");
  });

  it("handles API errors correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock an error response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({
        error: {
          message: "Invalid API key",
        },
      }),
    } as Response);

    await expect(client.sendMessage(messages, "test-key")).rejects.toThrow(
      "Invalid or expired API key",
    );
  });

  it("handles network errors correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock a network error
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    await expect(client.sendMessage(messages, "test-key")).rejects.toThrow(
      "An error occurred while calling the Anthropic API: Network error",
    );
  });

  it("handles rate limit errors correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock a rate limit error
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({
        error: {
          message: "Rate limit exceeded",
        },
      }),
    } as Response);

    await expect(client.sendMessage(messages, "test-key")).rejects.toThrow(
      "Too many requests",
    );
  });

  it("handles model not found errors correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock a model not found error
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({
        error: {
          message: "Model not found",
        },
      }),
    } as Response);

    await expect(client.sendMessage(messages, "test-key")).rejects.toThrow(
      "The requested model is not available",
    );
  });

  it("handles empty response errors correctly", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock an empty response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        content: [],
      }),
    } as Response);

    await expect(client.sendMessage(messages, "test-key")).rejects.toThrow(
      "No response from Anthropic",
    );
  });

  // Skip streaming tests if not in a browser environment
  if (
    typeof ReadableStream !== "undefined" &&
    typeof TextDecoder !== "undefined"
  ) {
    it("uses streaming when streamingOptions are provided", async () => {
      const messages: Message[] = [
        {
          id: "1",
          senderId: "user",
          text: "Hello",
          timestamp: Date.now(),
        },
      ];

      const streamingOptions: StreamingOptions = {
        onToken: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
      };

      // Create a mock readable stream
      const mockReader = {
        read: vi.fn(),
        releaseLock: vi.fn(),
      };

      // Set up the reader to return chunks of data
      let callCount = 0;
      const chunks = [
        { delta: { text: "Hello" } },
        { delta: { text: " from" } },
        { delta: { text: " Claude" } },
      ];

      mockReader.read.mockImplementation(() => {
        if (callCount < chunks.length) {
          const chunk = chunks[callCount];
          callCount++;
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode(
              `data: ${JSON.stringify(chunk)}\n\n`,
            ),
          });
        } else if (callCount === chunks.length) {
          callCount++;
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode("data: [DONE]\n\n"),
          });
        } else {
          return Promise.resolve({ done: true });
        }
      });

      // Mock a streaming response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response);

      const response = await client.sendMessage(
        messages,
        "test-key",
        "claude-3.7-sonnet",
        undefined,
        streamingOptions,
      );

      // Check that the response is correct
      expect(response).toBe("Hello from Claude");

      // Check that the streaming callbacks were called
      expect(streamingOptions.onToken).toHaveBeenCalledWith("Hello");
      expect(streamingOptions.onToken).toHaveBeenCalledWith(" from");
      expect(streamingOptions.onToken).toHaveBeenCalledWith(" Claude");
      expect(streamingOptions.onComplete).toHaveBeenCalledWith(
        "Hello from Claude",
      );
      expect(streamingOptions.onError).not.toHaveBeenCalled();
    });

    it("calls onError when streaming fails", async () => {
      const messages: Message[] = [
        {
          id: "1",
          senderId: "user",
          text: "Hello",
          timestamp: Date.now(),
        },
      ];

      const streamingOptions: StreamingOptions = {
        onToken: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
      };

      // Mock a streaming error
      vi.mocked(fetch).mockRejectedValueOnce(
        new Error("Network error during streaming"),
      );

      await expect(
        client.sendMessage(
          messages,
          "test-key",
          "claude-3.7-sonnet",
          undefined,
          streamingOptions,
        ),
      ).rejects.toThrow("An error occurred while calling the Anthropic API");

      // Check that the error callback was called
      expect(streamingOptions.onError).toHaveBeenCalled();
    });
  }
});
