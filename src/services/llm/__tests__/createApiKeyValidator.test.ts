import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiKeyValidator } from "../createApiKeyValidator";
import { LLMService } from "../LLMClientFactory";
import type { LLMClient, LLMProviderId } from "../../../types/llm";

// Mock LLMService
vi.mock("../LLMClientFactory", () => ({
  LLMService: {
    getClient: vi.fn(),
  },
}));

// Mock console.error to prevent it from cluttering the test output
vi.spyOn(console, "error").mockImplementation(() => {});

describe("createApiKeyValidator", () => {
  let mockClient: Partial<LLMClient>;
  const apiKeyValidator = createApiKeyValidator();

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Create a mock client
    mockClient = {
      validateApiKey: vi.fn(),
    };

    // Setup the mock implementation
    vi.mocked(LLMService.getClient).mockReturnValue(mockClient as LLMClient);
  });

  it("returns false when provider is missing", async () => {
    const result = await apiKeyValidator.validateKey(
      "" as LLMProviderId,
      "test-key",
    );
    expect(result.success).toBe(true);
    expect(result.success && result.data).toBe(false);
  });

  it("returns false when API key is missing", async () => {
    const result = await apiKeyValidator.validateKey("openai", "");
    expect(result.success).toBe(true);
    expect(result.success && result.data).toBe(false);
  });

  it("calls validateApiKey on the client with the right parameters", async () => {
    vi.mocked(mockClient.validateApiKey!).mockResolvedValue(true);

    const result = await apiKeyValidator.validateKey("openai", "test-key");

    expect(LLMService.getClient).toHaveBeenCalledWith("openai");
    expect(mockClient.validateApiKey).toHaveBeenCalledWith("test-key");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(true);
    }
  });

  it("returns false when validation fails", async () => {
    vi.mocked(mockClient.validateApiKey!).mockResolvedValue(false);

    const result = await apiKeyValidator.validateKey("openai", "invalid-key");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(false);
    }
  });

  it("handles errors from the client", async () => {
    vi.mocked(mockClient.validateApiKey!).mockRejectedValue(
      new Error("API Error"),
    );

    const result = await apiKeyValidator.validateKey("openai", "test-key");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(false);
    }
  });

  it("works with different providers", async () => {
    const validator = createApiKeyValidator();

    // For each provider, mock and test
    const testProvider = async (provider: string) => {
      // Reset mocks for each provider
      vi.resetAllMocks();

      // Create new mock client for this provider
      const mockClientForProvider = {
        validateApiKey: vi.fn().mockResolvedValue(true),
      };

      // Mock the service to return our mock client
      vi.mocked(LLMService.getClient).mockReturnValue(
        mockClientForProvider as unknown as LLMClient,
      );

      // Call the validator
      await validator.validateKey(provider as LLMProviderId, "test-key");

      // Verify the service was called correctly
      expect(LLMService.getClient).toHaveBeenCalledWith(provider);
    };

    // Test each provider
    await testProvider("openai");
    await testProvider("anthropic");
    await testProvider("grok");
    await testProvider("google");
  });
});
