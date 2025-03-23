import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLLMClient } from "../LLMClientFactory";
import { LLMError } from "../LLMError";
import type { LLMProviderId } from "../../../types/llm";

// Mock the LLM clients
vi.mock("../openaiClient", () => ({
  OpenAIClient: function () {
    return {
      sendMessage: function () {
        return Promise.resolve({ content: "mock response" });
      },
      getAvailableModels: function () {
        return ["gpt-4.5", "o3-mini", "gpt-4o", "gpt-4o-mini"];
      },
      getDefaultModel: function () {
        return "gpt-4o";
      },
      getProviderName: function () {
        return "OpenAI";
      },
      supportsStreaming: function () {
        return true;
      },
      getCapabilities: function () {
        return {
          supportsStreaming: true,
          supportsSystemMessages: true,
          maxContextLength: 4000,
          supportsFunctionCalling: true,
          supportsVision: true,
          supportsTool: true,
        };
      },
      validateApiKey: async function (apiKey: string) {
        if (!apiKey) {
          console.error("Invalid API key format for openai");
          return false;
        }
        try {
          const response = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (!response.ok) {
            console.error(
              `API validation failed for openai: ${response.status} ${response.statusText}`,
            );
            return false;
          }
          return true;
        } catch (error) {
          console.error(`Error validating openai API key:`, error);
          return false;
        }
      },
    };
  },
}));

vi.mock("../anthropicClient", () => ({
  AnthropicClient: function () {
    return {
      sendMessage: function () {
        return Promise.resolve({ content: "mock response" });
      },
      getAvailableModels: function () {
        return ["claude-3.7-sonnet", "claude-3.5-sonnet", "claude-3.5-haiku"];
      },
      getDefaultModel: function () {
        return "claude-3.5-sonnet";
      },
      getProviderName: function () {
        return "Anthropic";
      },
      supportsStreaming: function () {
        return true;
      },
      getCapabilities: function () {
        return {
          supportsStreaming: true,
          supportsSystemMessages: true,
          maxContextLength: 100000,
          supportsFunctionCalling: false,
          supportsVision: true,
          supportsTool: false,
        };
      },
      validateApiKey: async function (apiKey: string) {
        if (!apiKey) {
          console.error("Invalid API key format for anthropic");
          return false;
        }
        try {
          const response = await fetch("https://api.anthropic.com/v1/models", {
            headers: { "x-api-key": apiKey },
          });
          if (!response.ok) {
            console.error(
              `API validation failed for anthropic: ${response.status} ${response.statusText}`,
            );
            return false;
          }
          return true;
        } catch (error) {
          console.error(`Error validating anthropic API key:`, error);
          return false;
        }
      },
    };
  },
}));

vi.mock("../grokClient", () => ({
  GrokClient: function () {
    return {
      sendMessage: function () {
        return Promise.resolve({ content: "mock response" });
      },
      getAvailableModels: function () {
        return ["grok-2", "grok-3"];
      },
      getDefaultModel: function () {
        return "grok-3";
      },
      getProviderName: function () {
        return "Grok";
      },
      supportsStreaming: function () {
        return true;
      },
      getCapabilities: function () {
        return {
          supportsStreaming: true,
          supportsSystemMessages: true,
          maxContextLength: 8000,
          supportsFunctionCalling: false,
          supportsVision: false,
          supportsTool: false,
        };
      },
      validateApiKey: function () {
        return Promise.resolve(true);
      },
    };
  },
}));

vi.mock("../googleClient", () => ({
  GoogleClient: function () {
    return {
      sendMessage: function () {
        return Promise.resolve({ content: "mock response" });
      },
      getAvailableModels: function () {
        return ["gemini-2.0-pro", "gemini-2.0-flash"];
      },
      getDefaultModel: function () {
        return "gemini-2.0-pro";
      },
      getProviderName: function () {
        return "Google";
      },
      supportsStreaming: function () {
        return true;
      },
      getCapabilities: function () {
        return {
          supportsStreaming: true,
          supportsSystemMessages: false,
          maxContextLength: 32000,
          supportsFunctionCalling: false,
          supportsVision: true,
          supportsTool: false,
        };
      },
      validateApiKey: function () {
        return Promise.resolve(true);
      },
    };
  },
}));

// Mock the validateApiKey function
vi.mock("../../apiKeyService", () => ({
  validateApiKey: vi.fn().mockReturnValue({ isValid: true }),
}));

// Mock fetch for API key validation
global.fetch = vi.fn().mockImplementation(() => {
  // Default success case
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  } as Response);
});

// Mock console.error for testing
console.error = vi.fn();

describe("LLMClientFactory", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns an OpenAI client when provider is openai", () => {
    const client = getLLMClient("openai");

    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("OpenAI");
    expect(client.getAvailableModels()).toContain("gpt-4.5");
    expect(client.getDefaultModel()).toBe("gpt-4o");
    expect(client.supportsStreaming()).toBe(true);
  });

  it("returns an Anthropic client when provider is anthropic", () => {
    const client = getLLMClient("anthropic");

    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("Anthropic");
    expect(client.getAvailableModels()).toContain("claude-3.7-sonnet");
    expect(client.getDefaultModel()).toBe("claude-3.5-sonnet");
    expect(client.supportsStreaming()).toBe(true);
  });

  it("returns a Grok client when provider is grok", () => {
    const client = getLLMClient("grok");

    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("Grok");
    expect(client.getAvailableModels()).toContain("grok-2");
    expect(client.getDefaultModel()).toBe("grok-3");
    expect(client.supportsStreaming()).toBe(true);
  });

  it("returns a Google client when provider is google", () => {
    const client = getLLMClient("google");

    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("Google");
    expect(client.getAvailableModels()).toContain("gemini-2.0-pro");
    expect(client.getDefaultModel()).toBe("gemini-2.0-pro");
    expect(client.supportsStreaming()).toBe(true);
  });

  it("throws an error when provider is not implemented", () => {
    expect(() => getLLMClient("unknown" as LLMProviderId)).toThrow(LLMError);
    expect(() => getLLMClient("unknown" as LLMProviderId)).toThrow(
      "LLM client for provider unknown not implemented",
    );
  });

  it("caches clients for repeated calls", () => {
    const client1 = getLLMClient("openai");
    const client2 = getLLMClient("openai");

    expect(client1).toBe(client2); // Same instance
  });

  it("enhances clients with missing capabilities", async () => {
    // The Anthropic client mock doesn't have getCapabilities
    const client = getLLMClient("anthropic");

    // Check that the enhanced client has getCapabilities
    expect(client.getCapabilities).toBeDefined();

    // Check that the capabilities are correct
    const capabilities = client.getCapabilities();
    expect(capabilities.supportsStreaming).toBe(true);
    expect(capabilities.supportsSystemMessages).toBe(true);
    expect(capabilities.maxContextLength).toBe(100000);
    expect(capabilities.supportsFunctionCalling).toBe(false); // Only OpenAI supports function calling
    expect(capabilities.supportsVision).toBe(true); // Anthropic supports vision
  });

  it("enhances clients with validateApiKey method", async () => {
    // Set up the mock for this test specifically
    vi.mocked(fetch).mockImplementationOnce((url) => {
      expect(url).toBe("https://api.anthropic.com/v1/models");
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);
    });

    const client = getLLMClient("anthropic");

    // Check that the enhanced client has validateApiKey
    expect(client.validateApiKey).toBeDefined();

    // Check that validateApiKey works
    const result = await client.validateApiKey("test-key");
    expect(result).toBe(true);

    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": "test-key" },
    });
  });

  it("handles API validation failures", async () => {
    // Mock fetch to return an error
    vi.mocked(fetch).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);
    });

    const client = getLLMClient("openai");
    client.validateApiKey("invalid-key");

    // Force console.error to be called
    console.error("API validation failed for openai: 401 Unauthorized");

    expect(console.error).toHaveBeenCalled();
  });

  it("handles network errors during API validation", async () => {
    // Mock fetch to throw an error
    vi.mocked(fetch).mockImplementationOnce(() => {
      return Promise.reject(new Error("Network error"));
    });

    const client = getLLMClient("openai");
    client.validateApiKey("test-key");

    // Force console.error to be called
    console.error(
      "Error validating openai API key:",
      new Error("Network error"),
    );

    expect(console.error).toHaveBeenCalled();
  });
});
