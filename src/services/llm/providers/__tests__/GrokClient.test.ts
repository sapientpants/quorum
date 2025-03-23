import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GrokClient, GrokError } from "../GrokClient";
import { LLMError, LLMErrorType } from "../../errors";
import type { Message } from "../../../../types/chat";
import type {
  GrokResponse,
  GrokStreamChunk,
  GrokMessage,
  GrokRequest,
} from "../types";

// Define a type for accessing protected methods on GrokClient
type GrokClientWithProtectedAccess = {
  convertMessages(messages: Message[]): GrokMessage[];
  createRequestBody(
    messages: Message[],
    model: string,
    settings?: Record<string, unknown>,
    streaming?: boolean,
  ): GrokRequest;
  isGrokResponse(value: unknown): value is GrokResponse;
  isGrokStreamChunk(value: unknown): value is GrokStreamChunk;
  extractContentFromResponse(responseData: unknown): string;
  extractTokenFromStreamChunk(chunk: unknown): string | null;
  getRequestHeaders(apiKey: string): HeadersInit;
  isProviderSpecificError(error: unknown): boolean;
  convertToStandardError(error: unknown): LLMError;
  providerName: string;
  apiBaseUrl: string;
  supportedModels: string[];
  defaultModel: string;
  capabilities: Record<string, unknown>;
};

// Mock fetch
global.fetch = vi.fn();

describe("GrokClient (Provider)", () => {
  let client: GrokClient;
  let clientWithAccess: GrokClientWithProtectedAccess;

  beforeEach(() => {
    client = new GrokClient();
    clientWithAccess = client as unknown as GrokClientWithProtectedAccess;
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Message conversion", () => {
    it("converts messages to Grok format correctly", () => {
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

      const result = clientWithAccess.convertMessages(messages);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        role: "system",
        content: "You are a helpful assistant",
      });
      expect(result[1]).toEqual({ role: "user", content: "Hello" });
      expect(result[2]).toEqual({ role: "assistant", content: "Hi there" });
    });
  });

  describe("Request creation", () => {
    it("creates request body correctly with all settings", () => {
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

      const requestBody = clientWithAccess.createRequestBody(
        messages,
        "grok-3",
        settings,
        true,
      );

      expect(requestBody).toEqual({
        model: "grok-3",
        messages: [
          { role: "system", content: "System prompt" },
          { role: "user", content: "User message" },
        ],
        temperature: 0.7,
        max_tokens: 500,
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

      const requestBody = clientWithAccess.createRequestBody(
        messages,
        "grok-3",
      );

      expect(requestBody).toEqual({
        model: "grok-3",
        messages: [{ role: "user", content: "User message" }],
        temperature: undefined,
        max_tokens: undefined,
        top_p: undefined,
        stream: false,
      });
    });
  });

  describe("Type guards", () => {
    it("correctly identifies valid Grok responses", () => {
      const validResponse = {
        id: "resp_123",
        model: "grok-3",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Hello from Grok",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 3,
          total_tokens: 13,
        },
      };

      expect(clientWithAccess.isGrokResponse(validResponse)).toBe(true);
    });

    it("correctly rejects invalid Grok responses", () => {
      const invalidResponses = [
        null,
        undefined,
        {},
        { choices: null },
        { choices: [] },
        { choices: [{ index: 0 }] },
        { choices: [{ message: {} }] },
      ];

      for (const response of invalidResponses) {
        expect(clientWithAccess.isGrokResponse(response)).toBe(false);
      }
    });

    it("correctly identifies valid stream chunks", () => {
      const validChunk = {
        choices: [
          {
            delta: {
              content: "Hello",
            },
          },
        ],
      };

      expect(clientWithAccess.isGrokStreamChunk(validChunk)).toBe(true);
    });

    it("correctly rejects invalid stream chunks", () => {
      const invalidChunks = [
        null,
        undefined,
        {},
        { choices: null },
        { choices: [] },
        { choices: [{}] },
        { choices: [{ delta: {} }] },
        { choices: [{ delta: { text: "wrong-key" } }] },
      ];

      for (const chunk of invalidChunks) {
        expect(clientWithAccess.isGrokStreamChunk(chunk)).toBe(false);
      }
    });
  });

  describe("Response handling", () => {
    it("extracts content correctly from valid response", () => {
      const validResponse = {
        id: "resp_123",
        model: "grok-3",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Hello from Grok",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 3,
          total_tokens: 13,
        },
      };

      expect(clientWithAccess.extractContentFromResponse(validResponse)).toBe(
        "Hello from Grok",
      );
    });

    it("throws error for invalid response format", () => {
      const invalidResponse = {
        invalid: "structure",
      };

      expect(() =>
        clientWithAccess.extractContentFromResponse(invalidResponse),
      ).toThrow("Invalid response format from Grok");

      const emptyChoicesResponse = {
        choices: [],
      };

      expect(() =>
        clientWithAccess.extractContentFromResponse(emptyChoicesResponse),
      ).toThrow("Invalid response format from Grok");
    });
  });

  describe("Stream chunks", () => {
    it("extracts token correctly from valid stream chunk", () => {
      const validChunk = {
        choices: [
          {
            delta: {
              content: "Hello",
            },
          },
        ],
      };

      expect(clientWithAccess.extractTokenFromStreamChunk(validChunk)).toBe(
        "Hello",
      );
    });

    it("returns null for invalid stream chunk", () => {
      const invalidChunks = [
        null,
        undefined,
        {},
        { choices: [] },
        { choices: [{}] },
        { choices: [{ delta: {} }] },
      ];

      for (const chunk of invalidChunks) {
        expect(clientWithAccess.extractTokenFromStreamChunk(chunk)).toBeNull();
      }
    });
  });

  describe("Header creation", () => {
    it("creates request headers correctly", () => {
      const headers = clientWithAccess.getRequestHeaders("test-api-key");

      expect(headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer test-api-key",
      });
    });
  });

  describe("Error handling", () => {
    it("identifies Grok errors correctly", () => {
      const grokError = new GrokError("Test error");
      expect(clientWithAccess.isProviderSpecificError(grokError)).toBe(true);
    });

    it("converts Grok errors to LLM errors correctly", () => {
      const authError = new GrokError("Auth failed", "auth_error");
      const rateError = new GrokError("Rate limited", "rate_limit_error");
      const modelError = new GrokError("Model not found", "model_error");
      const generalError = new GrokError("General error", "unknown_code");

      const convertedAuth = clientWithAccess.convertToStandardError(authError);
      expect(convertedAuth).toBeInstanceOf(LLMError);
      expect(convertedAuth.type).toBe(LLMErrorType.AUTHENTICATION);

      const convertedRate = clientWithAccess.convertToStandardError(rateError);
      expect(convertedRate).toBeInstanceOf(LLMError);
      expect(convertedRate.type).toBe(LLMErrorType.RATE_LIMIT);

      const convertedModel =
        clientWithAccess.convertToStandardError(modelError);
      expect(convertedModel).toBeInstanceOf(LLMError);
      expect(convertedModel.type).toBe(LLMErrorType.INVALID_MODEL);

      const convertedGeneral =
        clientWithAccess.convertToStandardError(generalError);
      expect(convertedGeneral).toBeInstanceOf(LLMError);
      expect(convertedGeneral.type).toBe(LLMErrorType.API_ERROR);
    });
  });

  describe("Provider properties", () => {
    it("returns the correct provider name", () => {
      expect(clientWithAccess.providerName).toBe("grok");
    });

    it("has the correct API base URL", () => {
      expect(clientWithAccess.apiBaseUrl).toBe(
        "https://api.grok.x/v1/chat/completions",
      );
    });

    it("supports the correct models", () => {
      expect(clientWithAccess.supportedModels).toContain("grok-3");
      expect(clientWithAccess.supportedModels).toContain("grok-2");
    });

    it("has the correct default model", () => {
      expect(clientWithAccess.defaultModel).toBe("grok-3");
    });

    it("has the correct capabilities", () => {
      expect(clientWithAccess.capabilities).toEqual({
        supportsStreaming: true,
        supportsSystemMessages: true,
        maxContextLength: 16384,
      });
    });
  });
});
