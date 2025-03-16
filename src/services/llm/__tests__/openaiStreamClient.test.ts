import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenAIStreamClient } from "../openaiStreamClient";
import { LLMError, ErrorType } from "../LLMError";
import type { Message } from "../../../types/chat";
import type { LLMSettings } from "../../../types/llm";
import type { StreamingResponse } from "../../../types/streaming";

// Mock fetch
global.fetch = vi.fn();

describe("OpenAIStreamClient", () => {
  let client: OpenAIStreamClient;

  beforeEach(() => {
    client = new OpenAIStreamClient();
    vi.resetAllMocks();

    // Mock console methods to prevent them from cluttering the test output
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the correct provider name", () => {
    expect(client.getProviderName()).toBe("openai");
  });

  it("returns the correct available models", () => {
    const models = client.getAvailableModels();
    expect(models).toContain("gpt-4o");
    expect(models).toContain("gpt-4-turbo");
    expect(models).toContain("gpt-3.5-turbo");
  });

  it("returns the correct default model", () => {
    expect(client.getDefaultModel()).toBe("gpt-4o");
  });

  it("indicates that streaming is supported", () => {
    expect(client.supportsStreaming()).toBe(true);
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
      "OpenAI API key is required",
    );
  });

  it("converts messages to OpenAI format correctly", async () => {
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
        choices: [{ message: { content: "Hello from OpenAI" } }],
      }),
    } as Response);

    await client.sendMessage(messages, "test-key");

    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
        body: expect.stringContaining(
          '"messages":[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there"}]',
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
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
    };

    // Mock a successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: "Hello from OpenAI" } }],
      }),
    } as Response);

    await client.sendMessage(messages, "test-key", "gpt-4o", settings);

    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          '"temperature":0.7,"max_tokens":100,"top_p":0.9,"frequency_penalty":0.5,"presence_penalty":0.5',
        ),
      }),
    );
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
        choices: [{ message: { content: "Hello from OpenAI" } }],
      }),
    } as Response);

    const response = await client.sendMessage(messages, "test-key");

    expect(response).toBe("Hello from OpenAI");
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

    // Create a spy to capture the error
    const errorSpy = vi.fn();

    try {
      await client.sendMessage(messages, "test-key");
    } catch (error) {
      errorSpy(error);
    }

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("OpenAI API error"),
      }),
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
        choices: [],
      }),
    } as Response);

    // Create a spy to capture the error
    const errorSpy = vi.fn();

    try {
      await client.sendMessage(messages, "test-key");
    } catch (error) {
      errorSpy(error);
    }

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("No response from OpenAI"),
      }),
    );
  });

  it("validates API key correctly", async () => {
    // Mock a successful response for valid API key
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    const isValid = await client.validateApiKey("valid-key");
    expect(isValid).toBe(true);

    // Mock an error response for invalid API key
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    const isInvalid = await client.validateApiKey("invalid-key");
    expect(isInvalid).toBe(false);

    // Test with empty API key
    const isEmptyInvalid = await client.validateApiKey("");
    expect(isEmptyInvalid).toBe(false);
  });

  it("handles network errors during API key validation", async () => {
    // Mock a network error
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const isValid = await client.validateApiKey("test-key");
    expect(isValid).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  // Tests for streamMessage method
  describe("streamMessage", () => {
    it("yields error for empty API key", async () => {
      const messages: Message[] = [
        {
          id: "1",
          senderId: "user",
          text: "Hello",
          timestamp: Date.now(),
        },
      ];

      const stream = client.streamMessage(messages, "");

      // Create an async iterator and get the first result
      let firstResult: StreamingResponse | undefined;
      for await (const chunk of stream) {
        firstResult = chunk;
        break;
      }

      expect(firstResult).toBeDefined();
      expect(firstResult?.done).toBe(true);
      expect(firstResult?.error).toBeInstanceOf(LLMError);

      const error = firstResult?.error as LLMError;
      expect(error.type).toBe(ErrorType.MISSING_API_KEY);
      expect(error.message).toBe("OpenAI API key is required");
    });

    it("falls back to regular sendMessage if streaming is not supported", async () => {
      // Mock ReadableStream and TextDecoder to be undefined
      const originalReadableStream = global.ReadableStream;
      const originalTextDecoder = global.TextDecoder;

      // @ts-expect-error - Intentionally setting to undefined for testing
      global.ReadableStream = undefined;
      // @ts-expect-error - Intentionally setting to undefined for testing
      global.TextDecoder = undefined;

      try {
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
            choices: [{ message: { content: "Hello from OpenAI" } }],
          }),
        } as Response);

        const iterable = client.streamMessage(messages, "test-key");
        const iterator = iterable[Symbol.asyncIterator]();

        const firstResult = await iterator.next();
        expect(firstResult.value).toEqual({
          done: false,
          token: "Hello from OpenAI",
        });

        const secondResult = await iterator.next();
        expect(secondResult.value).toEqual({
          done: true,
        });
      } finally {
        // Restore the original values
        global.ReadableStream = originalReadableStream;
        global.TextDecoder = originalTextDecoder;
      }
    });

    // Skip streaming tests if not in a browser environment
    if (
      typeof ReadableStream !== "undefined" &&
      typeof TextDecoder !== "undefined"
    ) {
      it("streams tokens correctly", async () => {
        const messages: Message[] = [
          {
            id: "1",
            senderId: "user",
            text: "Hello",
            timestamp: Date.now(),
          },
        ];

        // Create a mock readable stream
        const mockReader = {
          read: vi.fn(),
          releaseLock: vi.fn(),
        };

        // Set up the reader to return chunks of data
        let callCount = 0;
        const chunks = [
          { choices: [{ delta: { content: "Hello" } }] },
          { choices: [{ delta: { content: " from" } }] },
          { choices: [{ delta: { content: " OpenAI" } }] },
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

        const iterable = client.streamMessage(messages, "test-key");
        const iterator = iterable[Symbol.asyncIterator]();

        // Collect all tokens
        const tokens: string[] = [];
        let result: StreamingResponse | undefined;

        do {
          const next = await iterator.next();
          result = next.value;

          if (result && !result.done && result.token) {
            tokens.push(result.token);
          }
        } while (result && !result.done);

        // Check that the tokens were streamed correctly
        expect(tokens).toEqual(["Hello", " from", " OpenAI"]);
        expect(result).toEqual({ done: true });
      });

      it("handles API errors during streaming", async () => {
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

        const stream = client.streamMessage(messages, "test-key");

        // Create an async iterator and get the first result
        let result: StreamingResponse | undefined;
        for await (const chunk of stream) {
          result = chunk;
          break;
        }

        expect(result).toBeDefined();
        expect(result?.done).toBe(true);
        expect(result?.error).toBeInstanceOf(LLMError);

        const error = result?.error as LLMError;
        expect(error.type).toBe(ErrorType.API_ERROR);
        expect(error.message).toContain("OpenAI API error");
      });

      it("handles null response body", async () => {
        const messages: Message[] = [
          {
            id: "1",
            senderId: "user",
            text: "Hello",
            timestamp: Date.now(),
          },
        ];

        // Mock a response with null body
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: null,
        } as unknown as Response);

        const stream = client.streamMessage(messages, "test-key");

        // Create an async iterator and get the first result
        let result: StreamingResponse | undefined;
        for await (const chunk of stream) {
          result = chunk;
          break;
        }

        expect(result).toBeDefined();
        expect(result?.done).toBe(true);
        expect(result?.error).toBeInstanceOf(LLMError);

        const error = result?.error as LLMError;
        expect(error.type).toBe(ErrorType.API_ERROR);
        expect(error.message).toBe("Response body is null");
      });

      it("handles JSON parsing errors during streaming", async () => {
        const messages: Message[] = [
          {
            id: "1",
            senderId: "user",
            text: "Hello",
            timestamp: Date.now(),
          },
        ];

        // Create a mock readable stream
        const mockReader = {
          read: vi.fn(),
          releaseLock: vi.fn(),
        };

        // Set up the reader to return invalid JSON
        mockReader.read
          .mockImplementationOnce(() => {
            return Promise.resolve({
              done: false,
              value: new TextEncoder().encode("data: {invalid json}\n\n"),
            });
          })
          .mockImplementationOnce(() => {
            return Promise.resolve({ done: true });
          });

        // Mock a streaming response
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: {
            getReader: () => mockReader,
          },
        } as unknown as Response);

        const stream = client.streamMessage(messages, "test-key");

        // Create an async iterator and get the first result
        let result: StreamingResponse | undefined;
        for await (const chunk of stream) {
          result = chunk;
          break;
        }

        // Should complete without tokens
        expect(result).toBeDefined();
        expect(result?.done).toBe(true);

        // Check that console.warn was called for the JSON parsing error
        expect(console.warn).toHaveBeenCalled();
      });

      it("handles abort signal", async () => {
        const messages: Message[] = [
          {
            id: "1",
            senderId: "user",
            text: "Hello",
            timestamp: Date.now(),
          },
        ];

        // Create an AbortController
        const controller = new AbortController();
        const signal = controller.signal;

        // Mock a streaming response
        vi.mocked(fetch).mockImplementationOnce(() => {
          // Abort the request
          controller.abort();

          // Simulate an AbortError
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          throw error;
        });

        const stream = client.streamMessage(
          messages,
          "test-key",
          "gpt-4o",
          undefined,
          signal,
        );

        // Create an async iterator and get the first result
        let result: StreamingResponse | undefined;
        for await (const chunk of stream) {
          result = chunk;
          break;
        }

        expect(result).toBeDefined();
        expect(result?.done).toBe(true);
        expect(result?.error).toBeInstanceOf(LLMError);

        const error = result?.error as LLMError;
        expect(error.type).toBe(ErrorType.API_ERROR);
        expect(error.message).toBe("The operation was aborted");
      });
    }
  });

  // Tests for chat and chatStream methods
  describe("chat and chatStream", () => {
    it("chat method calls sendMessage with correct parameters", async () => {
      // Spy on sendMessage
      const sendMessageSpy = vi
        .spyOn(client, "sendMessage")
        .mockResolvedValue("Hello from OpenAI");

      const messages = [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: "Hello" },
      ];

      const config = {
        apiKey: "test-key",
        model: "gpt-4o",
        temperature: 0.7,
      };

      const response = await client.chat(messages, config);

      expect(response).toEqual({
        content: "Hello from OpenAI",
        model: "gpt-4o",
        provider: "openai",
      });

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            senderId: "system",
            text: "You are a helpful assistant",
          }),
          expect.objectContaining({
            senderId: "user",
            text: "Hello",
          }),
        ]),
        "test-key",
        "gpt-4o",
        expect.objectContaining({
          temperature: 0.7,
        }),
        undefined,
        undefined,
      );
    });

    it("chatStream method calls sendMessage with streaming options", async () => {
      // Spy on sendMessage
      const sendMessageSpy = vi
        .spyOn(client, "sendMessage")
        .mockImplementation(
          async (_messages, _apiKey, _model, _settings, streamingOptions) => {
            if (streamingOptions?.onToken) {
              streamingOptions.onToken("Hello");
              streamingOptions.onToken(" from");
              streamingOptions.onToken(" OpenAI");
            }
            return "Hello from OpenAI";
          },
        );

      const messages = [{ role: "user", content: "Hello" }];

      const onChunk = vi.fn();

      const response = await client.chatStream(messages, onChunk);

      expect(response).toEqual({
        content: "Hello from OpenAI",
        model: "gpt-4o",
        provider: "openai",
      });

      // Verify that sendMessage was called with the correct parameters
      expect(sendMessageSpy).toHaveBeenCalled();

      // Check the first argument (messages)
      const messagesArg = sendMessageSpy.mock.calls[0][0];
      expect(messagesArg).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            senderId: "user",
            text: "Hello",
          }),
        ]),
      );

      // Check the streaming options
      const streamingOptions = sendMessageSpy.mock.calls[0][4];
      expect(streamingOptions).toBeDefined();
      expect(streamingOptions).toHaveProperty("onToken");
      expect(typeof streamingOptions?.onToken).toBe("function");

      expect(onChunk).toHaveBeenCalledWith("Hello");
      expect(onChunk).toHaveBeenCalledWith(" from");
      expect(onChunk).toHaveBeenCalledWith(" OpenAI");
    });
  });
});
