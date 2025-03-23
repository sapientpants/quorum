import { OpenAIClient, OpenAIError } from "../OpenAIClient";
import { LLMError, LLMErrorType } from "../../errors";
import { Message } from "../../../../types/chat";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("OpenAIClient (Provider)", () => {
  let client: OpenAIClient;
  let mockFetch: ReturnType<typeof vi.spyOn>;

  const sampleMessages: Message[] = [
    { id: "1", senderId: "user", text: "Hello", timestamp: 123 },
    { id: "2", senderId: "assistant", text: "Hi there", timestamp: 124 },
    { id: "3", senderId: "system", text: "System message", timestamp: 125 },
  ];

  beforeEach(() => {
    client = new OpenAIClient();
    // Using any type to avoid TypeScript errors with the mock implementation
    mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: "assistant",
              content: "AI response",
            },
          },
        ],
      }),
    } as Response) as any;
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  describe("Message conversion", () => {
    it("converts messages to OpenAI format correctly", () => {
      // Using TypeScript's private method access workaround
      const convertMessages = (client as any).convertMessages.bind(client);

      const openAIMessages = convertMessages(sampleMessages);

      expect(openAIMessages).toEqual([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
        { role: "system", content: "System message" },
      ]);
    });
  });

  describe("Request creation", () => {
    it("creates request body correctly with all settings", () => {
      // Using TypeScript's private method access workaround
      const createRequestBody = (client as any).createRequestBody.bind(client);

      const settings = {
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.8,
        frequencyPenalty: 0.3,
        presencePenalty: 0.1,
      };

      const requestBody = createRequestBody(sampleMessages, "gpt-4o", settings);

      expect(requestBody).toEqual({
        model: "gpt-4o",
        messages: expect.any(Array),
        temperature: 0.5,
        max_tokens: 1000,
        top_p: 0.8,
        frequency_penalty: 0.3,
        presence_penalty: 0.1,
        stream: false,
      });
    });

    it("creates request body with streaming flag when specified", () => {
      // Using TypeScript's private method access workaround
      const createRequestBody = (client as any).createRequestBody.bind(client);

      const requestBody = createRequestBody(
        sampleMessages,
        "gpt-4o",
        undefined,
        true,
      );

      expect(requestBody.stream).toBe(true);
    });
  });

  describe("Type guards", () => {
    it("correctly identifies OpenAI-specific errors", () => {
      // Using TypeScript's private method access workaround
      const isProviderSpecificError = (
        client as any
      ).isProviderSpecificError.bind(client);

      expect(isProviderSpecificError(new OpenAIError("Test error"))).toBe(true);
      expect(isProviderSpecificError(new Error("Generic error"))).toBe(false);
      expect(isProviderSpecificError("Not an error")).toBe(false);
    });
  });

  describe("Response handling", () => {
    it("extracts content correctly from valid response", () => {
      // Using TypeScript's private method access workaround
      const extractContentFromResponse = (
        client as any
      ).extractContentFromResponse.bind(client);

      const responseData = {
        choices: [
          {
            message: {
              role: "assistant",
              content: "This is a response",
            },
          },
        ],
      };

      const result = extractContentFromResponse(responseData);
      expect(result).toBe("This is a response");
    });

    it("throws error for invalid response format", () => {
      // Using TypeScript's private method access workaround
      const extractContentFromResponse = (
        client as any
      ).extractContentFromResponse.bind(client);

      const invalidData = { different: "format" };

      expect(() => extractContentFromResponse(invalidData)).toThrow(LLMError);
    });
  });

  describe("Stream chunks", () => {
    it("extracts token correctly from valid stream chunk", () => {
      // Using TypeScript's private method access workaround
      const extractTokenFromStreamChunk = (
        client as any
      ).extractTokenFromStreamChunk.bind(client);

      const chunk = {
        choices: [
          {
            delta: {
              content: "token",
            },
            finish_reason: null,
          },
        ],
      };

      const result = extractTokenFromStreamChunk(chunk);
      expect(result).toBe("token");
    });

    it("returns null for invalid stream chunk", () => {
      // Using TypeScript's private method access workaround
      const extractTokenFromStreamChunk = (
        client as any
      ).extractTokenFromStreamChunk.bind(client);

      const invalidChunk = {
        choices: [
          {
            delta: {},
            finish_reason: "stop",
          },
        ],
      };

      const result = extractTokenFromStreamChunk(invalidChunk);
      expect(result).toBeNull();
    });
  });

  describe("Header creation", () => {
    it("creates request headers correctly", () => {
      // Using TypeScript's private method access workaround
      const getRequestHeaders = (client as any).getRequestHeaders.bind(client);

      const headers = getRequestHeaders("fake-api-key");
      expect(headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer fake-api-key",
      });
    });
  });

  describe("Error handling", () => {
    it("maps different error types correctly", () => {
      // Using TypeScript's private method access workaround
      const convertToStandardError = (
        client as any
      ).convertToStandardError.bind(client);

      // Test authentication errors
      let openAIError = new OpenAIError("Auth error", 401);
      let result = convertToStandardError(openAIError);
      expect(result.type).toBe(LLMErrorType.AUTHENTICATION);

      // Test rate limit errors
      openAIError = new OpenAIError("Rate limit", 429);
      result = convertToStandardError(openAIError);
      expect(result.type).toBe(LLMErrorType.RATE_LIMIT);

      // Test invalid model errors
      openAIError = new OpenAIError("Not found", 404);
      result = convertToStandardError(openAIError);
      expect(result.type).toBe(LLMErrorType.INVALID_MODEL);

      // Test generic API errors
      openAIError = new OpenAIError("Generic error", 500);
      result = convertToStandardError(openAIError);
      expect(result.type).toBe(LLMErrorType.API_ERROR);
    });
  });

  describe("Provider properties", () => {
    it("returns the correct provider name", () => {
      expect((client as any).providerName).toBe("openai");
    });

    it("returns the correct API base URL", () => {
      expect((client as any).apiBaseUrl).toBe(
        "https://api.openai.com/v1/chat/completions",
      );
    });

    it("supports the correct models", () => {
      expect((client as any).supportedModels).toContain("gpt-4o");
      expect((client as any).supportedModels).toContain("gpt-4-turbo");
      expect((client as any).supportedModels).toContain("gpt-3.5-turbo");
    });

    it("has the correct default model", () => {
      expect((client as any).defaultModel).toBe("gpt-4o");
    });

    it("has the correct capabilities", () => {
      expect((client as any).capabilities).toEqual({
        supportsStreaming: true,
        supportsSystemMessages: true,
        maxContextLength: 128000,
      });
    });
  });

  describe("Send message", () => {
    it("sends a message and returns the response", async () => {
      const result = await client.sendMessage(
        sampleMessages,
        "fake-api-key",
        "gpt-4o",
      );

      expect(result).toBe("AI response");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-api-key",
          }),
          body: expect.any(String),
        }),
      );
    });

    it("handles API errors correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ error: { message: "Invalid auth" } }),
      } as Response);

      await expect(
        client.sendMessage(sampleMessages, "fake-api-key", "gpt-4o"),
      ).rejects.toThrow(LLMError);
    });
  });

  describe("Stream message", () => {
    it("implements streaming correctly", async () => {
      // Mock the ReadableStream for testing streaming
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            'data: {"choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
          );
          controller.enqueue(
            'data: {"choices":[{"delta":{"content":" world"},"finish_reason":null}]}\n\n',
          );
          controller.enqueue("data: [DONE]\n\n");
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream,
        headers: new Headers({ "content-type": "text/event-stream" }),
      } as Response);

      const generator = client.streamMessage(
        sampleMessages,
        "fake-api-key",
        "gpt-4o",
      );

      const result = [];
      for await (const chunk of generator) {
        result.push(chunk);
      }

      // Results should have tokens and a final done chunk
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles streaming errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const generator = client.streamMessage(
        sampleMessages,
        "fake-api-key",
        "gpt-4o",
      );

      const result = [];
      for await (const chunk of generator) {
        result.push(chunk);
      }

      expect(result.length).toBe(1);
      expect(result[0].done).toBe(true);
      expect(result[0].error).toBeInstanceOf(LLMError);
    });
  });
});
