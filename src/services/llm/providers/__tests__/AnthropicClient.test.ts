import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  AnthropicClient,
  AnthropicError,
  AnthropicResponse,
  AnthropicStreamChunk,
} from "../AnthropicClient";
import { LLMError, LLMErrorType } from "../../errors";
import type { Message } from "../../../../types/chat";
import type {
  AnthropicModel,
  LLMModel,
  LLMSettings,
} from "../../../../types/llm";

// Create a test version of the client that exposes protected methods for testing
class TestableAnthropicClient extends AnthropicClient {
  // Make protected methods public for testing
  public isAnthropicResponse(value: unknown): value is AnthropicResponse {
    return super.isAnthropicResponse(value);
  }

  public isAnthropicStreamChunk(value: unknown): value is AnthropicStreamChunk {
    return super.isAnthropicStreamChunk(value);
  }

  public extractContentFromResponse(responseData: unknown): string {
    return super.extractContentFromResponse(responseData);
  }

  public extractTokenFromStreamChunk(chunk: unknown): string | null {
    return super.extractTokenFromStreamChunk(chunk);
  }

  public isProviderSpecificError(error: unknown): boolean {
    return super.isProviderSpecificError(error);
  }

  public convertToStandardError(error: unknown): LLMError {
    return super.convertToStandardError(error);
  }

  public convertMessages(messages: Message[]): {
    messages: { role: "user" | "assistant"; content: string }[];
    system?: string;
  } {
    return super.convertMessages(messages);
  }

  public createRequestBody(
    messages: Message[],
    model: LLMModel,
    settings?: LLMSettings,
    streaming?: boolean,
  ): {
    model: string;
    messages: { role: "user" | "assistant"; content: string }[];
    system?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    stream?: boolean;
  } {
    return super.createRequestBody(messages, model, settings, streaming);
  }

  public getRequestHeaders(apiKey: string): HeadersInit {
    return super.getRequestHeaders(apiKey);
  }
}

// Mock fetch
global.fetch = vi.fn();

describe("AnthropicClient (Provider)", () => {
  let client: TestableAnthropicClient;

  beforeEach(() => {
    client = new TestableAnthropicClient();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Type guards", () => {
    it("correctly identifies valid Anthropic responses", () => {
      const validResponse = {
        id: "resp_123",
        type: "message",
        model: "claude-3.7-sonnet",
        content: [
          {
            type: "text",
            text: "Hello from Claude",
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 5,
        },
      };

      expect(client.isAnthropicResponse(validResponse)).toBe(true);
    });

    it("correctly rejects invalid Anthropic responses", () => {
      const invalidResponses = [
        null,
        undefined,
        {},
        { content: null },
        { content: [] },
        { content: [{ type: "text" }] },
        { content: [{ text: "Hello" }] },
      ];

      for (const response of invalidResponses) {
        expect(client.isAnthropicResponse(response)).toBe(false);
      }
    });

    it("correctly identifies valid stream chunks", () => {
      const validChunk = {
        delta: {
          text: "Hello",
        },
      };

      expect(client.isAnthropicStreamChunk(validChunk)).toBe(true);
    });

    it("correctly rejects invalid stream chunks", () => {
      const invalidChunks = [
        null,
        undefined,
        {},
        { delta: null },
        { delta: {} },
        { delta: { content: "Hello" } },
      ];

      for (const chunk of invalidChunks) {
        expect(client.isAnthropicStreamChunk(chunk)).toBe(false);
      }
    });
  });

  describe("Response handling", () => {
    it("extracts content correctly from valid response", () => {
      const validResponse = {
        id: "resp_123",
        model: "claude-3-haiku-20240307",
        content: [
          {
            type: "text",
            text: "Hello from Claude",
          },
        ],
      };

      expect(client.extractContentFromResponse(validResponse)).toBe(
        "Hello from Claude",
      );
    });

    it("throws error for invalid response format", () => {
      const invalidResponse = {
        // Valid content array but with wrong structure
        content: [
          {
            wrong_type: "text",
            wrong_text: "Hello from Claude",
          },
        ],
      };

      expect(() => client.extractContentFromResponse(invalidResponse)).toThrow(
        "Invalid response format from Anthropic",
      );
    });

    it("throws error for completely invalid response structure", () => {
      const invalidResponse = {
        invalid: "structure",
        no_content: true,
      };

      expect(() => client.extractContentFromResponse(invalidResponse)).toThrow(
        "Invalid response format from Anthropic",
      );
    });
  });

  describe("Stream chunks", () => {
    it("extracts token correctly from valid stream chunk", () => {
      const validChunk = {
        delta: {
          text: "Hello",
        },
      };

      expect(client.extractTokenFromStreamChunk(validChunk)).toBe("Hello");
    });

    it("returns null for invalid stream chunk", () => {
      const invalidChunk = {
        invalid: "structure",
      };

      expect(client.extractTokenFromStreamChunk(invalidChunk)).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("identifies Anthropic errors correctly", () => {
      const anthropicError = new AnthropicError("Test error");
      expect(client.isProviderSpecificError(anthropicError)).toBe(true);
    });

    it("converts Anthropic errors to LLM errors correctly", () => {
      const authError = new AnthropicError("Auth failed", "auth_error");
      const rateError = new AnthropicError("Rate limited", "rate_limit_error");
      const modelError = new AnthropicError("Model not found", "model_error");
      const generalError = new AnthropicError("General error", "unknown_code");

      const convertedAuth = client.convertToStandardError(authError);
      expect(convertedAuth).toBeInstanceOf(LLMError);
      expect(convertedAuth.type).toBe(LLMErrorType.AUTHENTICATION);

      const convertedRate = client.convertToStandardError(rateError);
      expect(convertedRate).toBeInstanceOf(LLMError);
      expect(convertedRate.type).toBe(LLMErrorType.RATE_LIMIT);

      const convertedModel = client.convertToStandardError(modelError);
      expect(convertedModel).toBeInstanceOf(LLMError);
      expect(convertedModel.type).toBe(LLMErrorType.INVALID_MODEL);

      const convertedGeneral = client.convertToStandardError(generalError);
      expect(convertedGeneral).toBeInstanceOf(LLMError);
      expect(convertedGeneral.type).toBe(LLMErrorType.API_ERROR);
    });
  });

  describe("Message conversion", () => {
    it("converts messages to Anthropic format correctly", () => {
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

      const result = client.convertMessages(messages);

      expect(result.system).toBe("You are a helpful assistant");
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0]).toEqual({
        role: "user",
        content: "Hello",
      });
      expect(result.messages[1]).toEqual({
        role: "assistant",
        content: "Hi there",
      });
    });
  });

  describe("Request creation", () => {
    it("creates request body correctly", () => {
      const messages: Message[] = [
        {
          id: "1",
          senderId: "system",
          text: "System prompt",
          timestamp: Date.now(),
        },
        {
          id: "2",
          senderId: "user",
          text: "User message",
          timestamp: Date.now(),
        },
      ];

      const settings = {
        temperature: 0.7,
        maxTokens: 500,
        topP: 0.9,
      };

      const requestBody = client.createRequestBody(
        messages,
        "claude-3.7-sonnet" as AnthropicModel,
        settings,
        true,
      );

      expect(requestBody).toEqual({
        model: "claude-3.7-sonnet",
        messages: [{ role: "user", content: "User message" }],
        system: "System prompt",
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        stream: true,
      });
    });

    it("uses default values when settings are not provided", () => {
      const messages: Message[] = [
        {
          id: "1",
          senderId: "user",
          text: "User message",
          timestamp: Date.now(),
        },
      ];

      const requestBody = client.createRequestBody(
        messages,
        "claude-3.7-sonnet",
      );

      expect(requestBody).toEqual({
        model: "claude-3.7-sonnet",
        messages: [{ role: "user", content: "User message" }],
        system: undefined,
        max_tokens: 1000,
        temperature: undefined,
        top_p: undefined,
        stream: false,
      });
    });
  });

  describe("Header creation", () => {
    it("creates request headers correctly", () => {
      const headers = client.getRequestHeaders("test-api-key");

      expect(headers).toEqual({
        "Content-Type": "application/json",
        "x-api-key": "test-api-key",
        "anthropic-version": "2023-06-01",
      });
    });
  });
});
