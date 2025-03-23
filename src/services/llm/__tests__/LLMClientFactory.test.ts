import { describe, it, expect, vi, beforeEach } from "vitest";
import { LLMClientFactory, LLMService } from "../LLMClientFactory";
import { OpenAIClient } from "../providers/OpenAIClient";
import { AnthropicClient } from "../providers/AnthropicClient";
import { GoogleClient } from "../providers/GoogleClient";
import { GrokClient } from "../providers/GrokClient";

// Mocking provider implementations
vi.mock("../providers/OpenAIClient");
vi.mock("../providers/AnthropicClient");
vi.mock("../providers/GoogleClient");
vi.mock("../providers/GrokClient");

describe("LLMClientFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    LLMClientFactory.clearCache();
  });

  it("should create and return OpenAI client", () => {
    const client = LLMService.getClient("openai");
    expect(client).toBeInstanceOf(OpenAIClient);
    expect(OpenAIClient).toHaveBeenCalledTimes(1);
  });

  it("should create and return Anthropic client", () => {
    const client = LLMService.getClient("anthropic");
    expect(client).toBeInstanceOf(AnthropicClient);
    expect(AnthropicClient).toHaveBeenCalledTimes(1);
  });

  it("should create and return Google client", () => {
    const client = LLMService.getClient("google");
    expect(client).toBeInstanceOf(GoogleClient);
    expect(GoogleClient).toHaveBeenCalledTimes(1);
  });

  it("should create and return Grok client", () => {
    const client = LLMService.getClient("grok");
    expect(client).toBeInstanceOf(GrokClient);
    expect(GrokClient).toHaveBeenCalledTimes(1);
  });

  it("should cache clients", () => {
    const client1 = LLMService.getClient("openai");
    const client2 = LLMService.getClient("openai");

    expect(client1).toBe(client2);
    expect(OpenAIClient).toHaveBeenCalledTimes(1);
  });

  it("should clear the cache", () => {
    LLMService.getClient("openai");
    LLMClientFactory.clearCache();
    LLMService.getClient("openai");

    expect(OpenAIClient).toHaveBeenCalledTimes(2);
  });

  it("should handle multiple providers", () => {
    LLMService.getClient("openai");
    LLMService.getClient("anthropic");
    LLMService.getClient("google");
    LLMService.getClient("grok");

    expect(OpenAIClient).toHaveBeenCalledTimes(1);
    expect(AnthropicClient).toHaveBeenCalledTimes(1);
    expect(GoogleClient).toHaveBeenCalledTimes(1);
    expect(GrokClient).toHaveBeenCalledTimes(1);
  });

  it("should throw for unsupported providers", () => {
    // @ts-expect-error: Testing invalid provider
    expect(() => LLMService.getClient("unsupported")).toThrow();
  });
});
