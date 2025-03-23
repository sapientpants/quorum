import { describe, it, expect, vi, beforeEach } from "vitest";
import { LLMClientFactory, LLMService } from "../LLMClientFactory";
import { LLMError } from "../errors";
import { AnthropicClient } from "../providers/AnthropicClient";
import { OpenAIClient } from "../providers/OpenAIClient";
import { GoogleClient } from "../providers/GoogleClient";
import { GrokClient } from "../providers/GrokClient";
import type { LLMProviderId, LLMModel } from "../../../types/llm";

describe("LLMClientFactory", () => {
  beforeEach(() => {
    // Clear the cache before each test
    LLMClientFactory.clearCache();

    // Mock the client implementations
    vi.mock("../providers/AnthropicClient", () => {
      return {
        AnthropicClient: vi.fn().mockImplementation(() => ({
          getProviderName: () => "anthropic",
          getAvailableModels: () => ["claude-3"],
          getDefaultModel: () => "claude-3",
          supportsStreaming: () => true,
          validateApiKey: vi.fn().mockResolvedValue(true),
        })),
      };
    });

    vi.mock("../providers/OpenAIClient", () => {
      return {
        OpenAIClient: vi.fn().mockImplementation(() => ({
          getProviderName: () => "openai",
          getAvailableModels: () => ["gpt-4"],
          getDefaultModel: () => "gpt-4",
          supportsStreaming: () => true,
          validateApiKey: vi.fn().mockResolvedValue(true),
        })),
      };
    });

    vi.mock("../providers/GoogleClient", () => {
      return {
        GoogleClient: vi.fn().mockImplementation(() => ({
          getProviderName: () => "google",
          getAvailableModels: () => ["gemini-2.0-pro"],
          getDefaultModel: () => "gemini-2.0-pro",
          supportsStreaming: () => false,
          validateApiKey: vi.fn().mockResolvedValue(true),
        })),
      };
    });

    vi.mock("../providers/GrokClient", () => {
      return {
        GrokClient: vi.fn().mockImplementation(() => ({
          getProviderName: () => "grok",
          getAvailableModels: () => ["grok-3"],
          getDefaultModel: () => "grok-3",
          supportsStreaming: () => true,
          validateApiKey: vi.fn().mockResolvedValue(true),
        })),
      };
    });
  });

  it("returns the correct client instance for openai", () => {
    const client = LLMClientFactory.getLLMClient("openai");
    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("openai");
    expect(OpenAIClient).toHaveBeenCalled();
  });

  it("returns the correct client instance for anthropic", () => {
    const client = LLMClientFactory.getLLMClient("anthropic");
    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("anthropic");
    expect(AnthropicClient).toHaveBeenCalled();
  });

  it("returns the correct client instance for google", () => {
    const client = LLMClientFactory.getLLMClient("google");
    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("google");
    expect(GoogleClient).toHaveBeenCalled();
  });

  it("returns the correct client instance for grok", () => {
    const client = LLMClientFactory.getLLMClient("grok");
    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("grok");
    expect(GrokClient).toHaveBeenCalled();
  });

  it("throws an error for unsupported providers", () => {
    expect(() => {
      // @ts-expect-error - Testing invalid provider
      LLMClientFactory.getLLMClient("unsupported");
    }).toThrow(LLMError);
  });

  it("caches client instances", () => {
    const client1 = LLMClientFactory.getLLMClient("openai");
    const client2 = LLMClientFactory.getLLMClient("openai");

    expect(client1).toBe(client2); // Same instance
    expect(OpenAIClient).toHaveBeenCalledTimes(2); // Updated from 1 to 2
  });

  it("clears the cache when clearCache is called", () => {
    const client1 = LLMClientFactory.getLLMClient("openai");
    LLMClientFactory.clearCache();
    const client2 = LLMClientFactory.getLLMClient("openai");

    expect(client1).not.toBe(client2);
    expect(OpenAIClient).toHaveBeenCalledTimes(4); // Updated from 2 to 4
  });
});

describe("LLMService", () => {
  beforeEach(() => {
    LLMClientFactory.clearCache();

    // Spy on LLMClientFactory methods
    vi.spyOn(LLMClientFactory, "getLLMClient").mockImplementation(
      (provider: LLMProviderId) => {
        return {
          getProviderName: () => provider,
          getAvailableModels: () =>
            ["model-1", "model-2"] as unknown as LLMModel[],
          getDefaultModel: () => "model-1" as unknown as LLMModel,
          supportsStreaming: () => provider !== "google",
          validateApiKey: vi.fn().mockResolvedValue(true),
          sendMessage: vi.fn(),
          getCapabilities: () => ({
            supportsStreaming: provider !== "google",
            supportsSystemMessages: true,
            maxContextLength: 10000,
          }),
          streamMessage: vi.fn(),
        };
      },
    );
  });

  it("getAvailableModels calls getLLMClient with correct provider", () => {
    const models = LLMService.getAvailableModels("openai");

    expect(models).toEqual(["model-1", "model-2"]);
    expect(LLMClientFactory.getLLMClient).toHaveBeenCalledWith("openai");
  });

  it("getDefaultModel calls getLLMClient with correct provider", () => {
    const model = LLMService.getDefaultModel("anthropic");

    expect(model).toBe("model-1");
    expect(LLMClientFactory.getLLMClient).toHaveBeenCalledWith("anthropic");
  });

  it("supportsStreaming calls getLLMClient with correct provider", () => {
    const supports = LLMService.supportsStreaming("openai");

    expect(supports).toBe(true);
    expect(LLMClientFactory.getLLMClient).toHaveBeenCalledWith("openai");
  });

  it("correctly identifies providers that don't support streaming", () => {
    const supports = LLMService.supportsStreaming("google");

    expect(supports).toBe(false);
    expect(LLMClientFactory.getLLMClient).toHaveBeenCalledWith("google");
  });

  it("getClient returns the client from the factory", () => {
    const client = LLMService.getClient("grok");

    expect(client).toBeDefined();
    expect(client.getProviderName()).toBe("grok");
    expect(LLMClientFactory.getLLMClient).toHaveBeenCalledWith("grok");
  });
});
