import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseClient } from "../base/BaseClient";
import { LLMError, LLMErrorType } from "../errors";
import type { Message } from "../../../types/chat";
import type {
  LLMSettings,
  LLMModel,
  ProviderCapabilities,
} from "../../../types/llm";

// Define response and chunk interfaces for the mock client
interface MockResponse {
  content: string;
}

interface MockChunk {
  token?: string;
}

// Mock implementation of BaseClient for testing
class MockClient extends BaseClient {
  protected readonly providerName = "mock";
  protected readonly apiBaseUrl = "https://api.mock.com/v1";
  protected readonly supportedModels: LLMModel[] = [
    "model-1" as LLMModel,
    "model-2" as LLMModel,
  ];
  protected readonly defaultModel = "model-1" as LLMModel;
  protected readonly capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 10000,
  };

  // Mock implementations of abstract methods
  protected convertMessages(messages: Message[]): unknown {
    return messages.map((msg) => ({
      role: msg.senderId,
      content: msg.text,
    }));
  }

  protected createRequestBody(
    messages: Message[],
    model: LLMModel,
    settings?: LLMSettings,
    streaming?: boolean,
  ): unknown {
    return {
      model,
      messages: this.convertMessages(messages),
      temperature: settings?.temperature ?? 0.7,
      stream: streaming || false,
    };
  }

  protected extractContentFromResponse(responseData: unknown): string {
    return (responseData as MockResponse).content;
  }

  protected extractTokenFromStreamChunk(chunk: unknown): string | null {
    return (chunk as MockChunk).token || null;
  }

  protected getRequestHeaders(apiKey: string): HeadersInit {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  protected isProviderSpecificError(error: unknown): boolean {
    return error instanceof MockError;
  }

  protected convertToStandardError(error: unknown): LLMError {
    const mockError = error as MockError;
    return new LLMError(
      mockError.code === "auth"
        ? LLMErrorType.AUTHENTICATION
        : LLMErrorType.API_ERROR,
      mockError.message,
      { provider: this.providerName },
    );
  }
}

// Mock error for testing
class MockError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "MockError";
  }
}

describe("BaseClient", () => {
  let client: MockClient;
  let fetchMock: ReturnType<typeof vi.fn>;
  let mockApiKey: string;
  let mockMessages: Message[];

  beforeEach(() => {
    // Set up fetch mock
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    // Create mock client
    client = new MockClient();

    // Set up test data
    mockApiKey = "mock-api-key";
    mockMessages = [
      { id: "1", senderId: "user", text: "Hello", timestamp: Date.now() },
      {
        id: "2",
        senderId: "assistant",
        text: "Hi there",
        timestamp: Date.now(),
      },
    ];
  });

  it("returns the correct provider name", () => {
    expect(client.getProviderName()).toBe("mock");
  });

  it("returns the correct available models", () => {
    expect(client.getAvailableModels()).toEqual(["model-1", "model-2"]);
  });

  it("returns the correct default model", () => {
    expect(client.getDefaultModel()).toBe("model-1");
  });

  it("indicates if streaming is supported", () => {
    expect(client.supportsStreaming()).toBe(true);
  });

  it("returns the correct capabilities", () => {
    expect(client.getCapabilities()).toEqual({
      supportsStreaming: true,
      supportsSystemMessages: true,
      maxContextLength: 10000,
    });
  });

  it("throws an error when sending a message without an API key", async () => {
    await expect(
      client.sendMessage(mockMessages, "", "model-1" as unknown as LLMModel),
    ).rejects.toThrow(LLMError);
  });

  it("throws an error when using an unsupported model", async () => {
    await expect(
      client.sendMessage(
        mockMessages,
        mockApiKey,
        "unsupported-model" as LLMModel,
      ),
    ).rejects.toThrow(LLMError);
  });

  it("sends a standard request correctly", async () => {
    // Mock successful response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ content: "This is a test response" }),
    });

    const response = await client.sendMessage(
      mockMessages,
      mockApiKey,
      "model-1" as LLMModel,
    );

    // Verify response
    expect(response).toBe("This is a test response");

    // Verify fetch was called correctly
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.mock.com/v1");

    // Verify request headers
    const requestOptions = fetchMock.mock.calls[0][1];
    expect(requestOptions.headers).toEqual({
      Authorization: "Bearer mock-api-key",
      "Content-Type": "application/json",
    });
  });

  it("validates API key correctly", async () => {
    // Mock successful response for validation
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ content: "Valid" }),
    });

    const isValid = await client.validateApiKey(mockApiKey);
    expect(isValid).toBe(true);
  });

  it("handles API errors correctly", async () => {
    // Mock error response
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: () => Promise.resolve({ error: "Invalid API key" }),
    });

    await expect(
      client.sendMessage(mockMessages, mockApiKey, "model-1" as LLMModel),
    ).rejects.toThrow(LLMError);
  });

  it("converts provider-specific errors correctly", async () => {
    // Mock implementation that throws a provider-specific error
    fetchMock.mockImplementationOnce(() => {
      throw new MockError("Authentication failed", "auth");
    });

    try {
      await client.sendMessage(mockMessages, mockApiKey, "model-1" as LLMModel);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(LLMError);
      expect((error as LLMError).type).toBe(LLMErrorType.AUTHENTICATION);
    }
  });

  it("throws an error when sending a message with invalid model", async () => {
    await expect(
      client.sendMessage(mockMessages, "", "model-1" as unknown as LLMModel),
    ).rejects.toThrow(LLMError);
  });
});
