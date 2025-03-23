import { GoogleClient, GoogleError } from "../GoogleClient";
import { LLMError, LLMErrorType } from "../../errors";
import { Message } from "../../../../types/chat";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("GoogleClient (Provider)", () => {
  let client: GoogleClient;
  let mockFetch: ReturnType<typeof vi.spyOn>;

  const sampleMessages: Message[] = [
    { id: "1", senderId: "user", text: "Hello", timestamp: 123 },
    { id: "2", senderId: "assistant", text: "Hi there", timestamp: 124 },
    { id: "3", senderId: "system", text: "System message", timestamp: 125 },
  ];

  beforeEach(() => {
    client = new GoogleClient();
    // Using any type to avoid TypeScript errors with the mock implementation
    mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "AI response" }],
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
    it("converts messages to Google format correctly", () => {
      // Using TypeScript's private method access workaround
      const convertMessages = (client as any).convertMessages.bind(client);

      const googleMessages = convertMessages(sampleMessages);

      expect(googleMessages).toEqual([
        { role: "user", parts: [{ text: "Hello" }] },
        { role: "model", parts: [{ text: "Hi there" }] },
        { role: "system", parts: [{ text: "System message" }] },
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
      };

      const requestBody = createRequestBody(
        sampleMessages,
        "gemini-2.0-pro",
        settings,
      );

      expect(requestBody).toEqual({
        contents: expect.any(Array),
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40,
        },
      });
    });

    it("uses default values when settings are not provided", () => {
      // Using TypeScript's private method access workaround
      const createRequestBody = (client as any).createRequestBody.bind(client);

      const requestBody = createRequestBody(sampleMessages, "gemini-2.0-pro");

      expect(requestBody).toEqual({
        contents: expect.any(Array),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40,
        },
      });
    });
  });

  describe("Type guards", () => {
    it("correctly identifies Google-specific errors", () => {
      // Using TypeScript's private method access workaround
      const isProviderSpecificError = (
        client as any
      ).isProviderSpecificError.bind(client);

      expect(isProviderSpecificError(new GoogleError("Test error"))).toBe(true);
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
        candidates: [
          {
            content: {
              parts: [{ text: "This is " }, { text: "a response" }],
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
    it("returns null for stream chunks while pending implementation", () => {
      // Using TypeScript's private method access workaround
      const extractTokenFromStreamChunk = (
        client as any
      ).extractTokenFromStreamChunk.bind(client);

      const result = extractTokenFromStreamChunk({ any: "data" });
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
      });
    });
  });

  describe("Error handling", () => {
    it("converts Google errors to LLM errors correctly", () => {
      // Using TypeScript's private method access workaround
      const convertToStandardError = (
        client as any
      ).convertToStandardError.bind(client);

      const googleError = new GoogleError("Test error", "PERMISSION_DENIED", {
        detail: "some details",
      });
      const result = convertToStandardError(googleError);

      expect(result).toBeInstanceOf(LLMError);
      expect(result.type).toBe(LLMErrorType.API_ERROR);
      expect(result.message).toBe("Test error");
      expect(result.originalError).toBe(googleError);
      expect(result.provider).toBe("google");
    });
  });

  describe("Request URL", () => {
    it("constructs the correct request URL", () => {
      // Using TypeScript's private method access workaround
      const getRequestUrl = (client as any).getRequestUrl.bind(client);

      const url = getRequestUrl("gemini-2.0-pro", "fake-api-key");
      expect(url).toBe(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-pro:generateContent?key=fake-api-key",
      );
    });
  });

  describe("Provider properties", () => {
    it("returns the correct provider name", () => {
      expect((client as any).providerName).toBe("google");
    });

    it("supports the correct models", () => {
      expect((client as any).supportedModels).toContain("gemini-2.0-pro");
      expect((client as any).supportedModels).toContain("gemini-2.0-flash");
    });

    it("has the correct default model", () => {
      expect((client as any).defaultModel).toBe("gemini-2.0-pro");
    });

    it("has the correct capabilities", () => {
      expect((client as any).capabilities).toEqual({
        supportsStreaming: true,
        supportsSystemMessages: true,
        maxContextLength: 32768,
      });
    });
  });

  describe("Send message", () => {
    it("sends a message and returns the response", async () => {
      const result = await client.sendMessage(
        sampleMessages,
        "fake-api-key",
        "gemini-2.0-pro",
      );

      expect(result).toBe("AI response");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-pro:generateContent",
        ),
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: expect.any(String),
        }),
      );
    });

    it("handles API errors correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ error: "Permission denied" }),
      } as Response);

      await expect(
        client.sendMessage(sampleMessages, "fake-api-key", "gemini-2.0-pro"),
      ).rejects.toThrow(LLMError);
    });
  });

  describe("Stream message", () => {
    it("implements streaming through fallback", async () => {
      const generator = client.streamMessage(
        sampleMessages,
        "fake-api-key",
        "gemini-2.0-pro",
      );

      const result = [];
      for await (const chunk of generator) {
        result.push(chunk);
      }

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].done).toBe(false);
      expect(result[0].token).toBe("AI response");
      expect(result[1].done).toBe(true);
    });

    it("handles streaming errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const generator = client.streamMessage(
        sampleMessages,
        "fake-api-key",
        "gemini-2.0-pro",
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
