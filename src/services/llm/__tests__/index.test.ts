import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAvailableModels,
  getDefaultModel,
  supportsStreaming,
} from "../index";
import { getLLMClient } from "../LLMClientFactory";

// Mock the LLMClientFactory
vi.mock("../LLMClientFactory", () => ({
  getLLMClient: vi.fn(),
}));

describe("LLM Service Index", () => {
  const mockClient = {
    getAvailableModels: vi.fn().mockReturnValue(["model1", "model2"]),
    getDefaultModel: vi.fn().mockReturnValue("model1"),
    supportsStreaming: vi.fn().mockReturnValue(true),
    sendMessage: vi.fn(),
    getProviderName: vi.fn(),
    validateApiKey: vi.fn(),
    getCapabilities: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLLMClient).mockReturnValue(mockClient);
  });

  it("getAvailableModels calls getLLMClient with the correct provider", () => {
    const models = getAvailableModels("openai");

    expect(getLLMClient).toHaveBeenCalledWith("openai");
    expect(mockClient.getAvailableModels).toHaveBeenCalled();
    expect(models).toEqual(["model1", "model2"]);
  });

  it("getDefaultModel calls getLLMClient with the correct provider", () => {
    const model = getDefaultModel("anthropic");

    expect(getLLMClient).toHaveBeenCalledWith("anthropic");
    expect(mockClient.getDefaultModel).toHaveBeenCalled();
    expect(model).toBe("model1");
  });

  it("supportsStreaming calls getLLMClient with the correct provider", () => {
    const streaming = supportsStreaming("grok");

    expect(getLLMClient).toHaveBeenCalledWith("grok");
    expect(mockClient.supportsStreaming).toHaveBeenCalled();
    expect(streaming).toBe(true);
  });

  it("handles different providers correctly", () => {
    getAvailableModels("openai");
    expect(getLLMClient).toHaveBeenCalledWith("openai");

    getAvailableModels("anthropic");
    expect(getLLMClient).toHaveBeenCalledWith("anthropic");

    getAvailableModels("grok");
    expect(getLLMClient).toHaveBeenCalledWith("grok");

    getAvailableModels("google");
    expect(getLLMClient).toHaveBeenCalledWith("google");
  });

  it("passes through return values from the client", () => {
    // Mock different return values
    mockClient.getAvailableModels.mockReturnValueOnce([
      "gpt-4",
      "gpt-3.5-turbo",
    ]);
    mockClient.getDefaultModel.mockReturnValueOnce("gpt-3.5-turbo");
    mockClient.supportsStreaming.mockReturnValueOnce(false);

    const models = getAvailableModels("openai");
    expect(models).toEqual(["gpt-4", "gpt-3.5-turbo"]);

    const model = getDefaultModel("openai");
    expect(model).toBe("gpt-3.5-turbo");

    const streaming = supportsStreaming("openai");
    expect(streaming).toBe(false);
  });
});
