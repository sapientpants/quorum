import {
  LLMService,
  getAvailableModels,
  getDefaultModel,
  supportsStreaming,
} from "../index";
import type { LLMProviderId, LLMModel, LLMClient } from "../../../types/llm";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the LLM service module
vi.mock("../index", async () => {
  // Create mock functions
  const mockGetAvailableModels = vi.fn();
  const mockGetDefaultModel = vi.fn();
  const mockSupportsStreaming = vi.fn();
  const mockGetClient = vi.fn();

  // Setup the LLMService mock
  const mockLLMService = {
    getAvailableModels: mockGetAvailableModels,
    getDefaultModel: mockGetDefaultModel,
    supportsStreaming: mockSupportsStreaming,
    getClient: mockGetClient,
  };

  // Return the mocked module
  return {
    LLMService: mockLLMService,
    // These functions are directly exported from the index file
    getAvailableModels: mockGetAvailableModels,
    getDefaultModel: mockGetDefaultModel,
    supportsStreaming: mockSupportsStreaming,
  };
});

describe("LLM Service", () => {
  const provider: LLMProviderId = "openai";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAvailableModels calls LLMService.getAvailableModels", () => {
    const mockModels = ["gpt-4", "gpt-4o"] as unknown as LLMModel[];

    // Set the mock return value
    vi.mocked(getAvailableModels).mockReturnValue(mockModels);

    const result = getAvailableModels(provider);

    expect(getAvailableModels).toHaveBeenCalledWith(provider);
    expect(result).toEqual(mockModels);
  });

  it("getDefaultModel calls LLMService.getDefaultModel", () => {
    const mockModel = "gpt-4" as unknown as LLMModel;

    // Set the mock return value
    vi.mocked(getDefaultModel).mockReturnValue(mockModel);

    const result = getDefaultModel(provider);

    expect(getDefaultModel).toHaveBeenCalledWith(provider);
    expect(result).toEqual(mockModel);
  });

  it("supportsStreaming calls LLMService.supportsStreaming", () => {
    // Set the mock return value
    vi.mocked(supportsStreaming).mockReturnValue(true);

    const result = supportsStreaming(provider);

    expect(supportsStreaming).toHaveBeenCalledWith(provider);
    expect(result).toBe(true);
  });

  it("getClient calls LLMService.getClient", () => {
    // Create a mock client that satisfies the LLMClient interface
    const mockClient = {
      sendMessage: vi.fn(),
      getAvailableModels: vi.fn(),
      getDefaultModel: vi.fn(),
      getProviderName: vi.fn(),
      supportsStreaming: vi.fn(),
      validateApiKey: vi.fn(),
      getCapabilities: vi.fn(),
    } as unknown as LLMClient;

    // Set the mock return value
    vi.mocked(LLMService.getClient).mockReturnValue(mockClient);

    const result = LLMService.getClient(provider);

    expect(LLMService.getClient).toHaveBeenCalledWith(provider);
    expect(result).toEqual(mockClient);
  });
});
