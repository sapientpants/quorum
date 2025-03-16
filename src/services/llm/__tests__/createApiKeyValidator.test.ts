import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiKeyValidator } from "../createApiKeyValidator";
import { getLLMClient } from "../LLMClientFactory";
import type { LLMProviderId } from "../../../types/llm";

// Mock the LLMClientFactory
vi.mock("../LLMClientFactory", () => ({
  getLLMClient: vi.fn(),
}));

// Mock console.error to prevent it from cluttering the test output
vi.spyOn(console, "error").mockImplementation(() => {});

describe("createApiKeyValidator", () => {
  const mockClient = {
    validateApiKey: vi.fn(),
    getAvailableModels: vi.fn(),
    getDefaultModel: vi.fn(),
    supportsStreaming: vi.fn(),
    sendMessage: vi.fn(),
    getProviderName: vi.fn(),
    getCapabilities: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLLMClient).mockReturnValue(mockClient);
  });

  it("returns a validator object with a validateKey method", () => {
    const validator = createApiKeyValidator();

    expect(validator).toBeDefined();
    expect(typeof validator.validateKey).toBe("function");
  });

  it("returns false for empty provider or API key", async () => {
    const validator = createApiKeyValidator();

    const result1 = await validator.validateKey(
      "" as LLMProviderId,
      "test-key",
    );
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data).toBe(false);
    }

    const result2 = await validator.validateKey("openai", "");
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(false);
    }
  });

  it("calls getLLMClient with the correct provider", async () => {
    const validator = createApiKeyValidator();
    mockClient.validateApiKey.mockResolvedValue(true);

    await validator.validateKey("openai", "test-key");

    expect(getLLMClient).toHaveBeenCalledWith("openai");
  });

  it("calls validateApiKey on the client with the correct API key", async () => {
    const validator = createApiKeyValidator();
    mockClient.validateApiKey.mockResolvedValue(true);

    await validator.validateKey("openai", "test-key");

    expect(mockClient.validateApiKey).toHaveBeenCalledWith("test-key");
  });

  it("returns true when the client validates the API key", async () => {
    const validator = createApiKeyValidator();
    mockClient.validateApiKey.mockResolvedValue(true);

    const result = await validator.validateKey("openai", "test-key");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(true);
    }
  });

  it("returns false when the client invalidates the API key", async () => {
    const validator = createApiKeyValidator();
    mockClient.validateApiKey.mockResolvedValue(false);

    const result = await validator.validateKey("openai", "test-key");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(false);
    }
  });

  it("handles errors from the client", async () => {
    const validator = createApiKeyValidator();
    mockClient.validateApiKey.mockRejectedValue(new Error("Test error"));

    const result = await validator.validateKey("openai", "test-key");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(false);
    }
    expect(console.error).toHaveBeenCalled();
  });

  it("handles errors from getLLMClient", async () => {
    const validator = createApiKeyValidator();
    vi.mocked(getLLMClient).mockImplementation(() => {
      throw new Error("Test error");
    });

    const result = await validator.validateKey("openai", "test-key");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(false);
    }
    expect(console.error).toHaveBeenCalled();
  });

  it("works with different providers", async () => {
    const validator = createApiKeyValidator();
    mockClient.validateApiKey.mockResolvedValue(true);

    await validator.validateKey("openai", "test-key");
    expect(getLLMClient).toHaveBeenCalledWith("openai");

    await validator.validateKey("anthropic", "test-key");
    expect(getLLMClient).toHaveBeenCalledWith("anthropic");

    await validator.validateKey("grok", "test-key");
    expect(getLLMClient).toHaveBeenCalledWith("grok");

    await validator.validateKey("google", "test-key");
    expect(getLLMClient).toHaveBeenCalledWith("google");
  });
});
