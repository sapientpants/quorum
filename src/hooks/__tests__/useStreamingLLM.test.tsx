/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStreamingLLM } from "../useStreamingLLM";
import { LLMService, LLMError, LLMErrorType } from "../../services/llm";
import type { Message } from "../../types/chat";
import type { LLMModel } from "../../types/llm";

// Mock the LLMService
vi.mock("../../services/llm", () => {
  const mockClient = {
    streamMessage: vi.fn(),
    getProviderName: () => "openai",
    getDefaultModel: () => "gpt-4" as LLMModel,
    getAvailableModels: () => ["gpt-4", "gpt-3.5-turbo"] as LLMModel[],
    supportsStreaming: () => true,
    getCapabilities: () => ({
      supportsStreaming: true,
      supportsSystemMessages: true,
      maxContextLength: 10000,
    }),
    sendMessage: vi.fn(),
    validateApiKey: vi.fn().mockResolvedValue(true),
  };

  return {
    LLMService: {
      getClient: vi.fn().mockReturnValue(mockClient),
      getAvailableModels: vi.fn(),
      getDefaultModel: vi.fn(),
      supportsStreaming: vi.fn().mockReturnValue(true),
    },
    LLMError: class LLMError extends Error {
      constructor(
        public type: any,
        message: string,
        public options: any = {},
      ) {
        super(message);
        this.name = "LLMError";
      }
    },
    LLMErrorType: {
      AUTHENTICATION: "authentication",
      INVALID_MODEL: "invalid_model",
      API_ERROR: "api_error",
      UNSUPPORTED_OPERATION: "unsupported_operation",
    },
  };
});

describe("useStreamingLLM", () => {
  const mockMessages: Message[] = [
    {
      id: "1",
      senderId: "user",
      text: "Hello",
      timestamp: 1000,
    },
  ];

  const mockProvider = "openai";
  const mockApiKey = "test-api-key";
  const mockModel = "gpt-4";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useStreamingLLM());

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.streamMessage).toBe("function");
    expect(typeof result.current.abortStream).toBe("function");
  });

  it("handles missing provider error", async () => {
    const { result } = renderHook(() => useStreamingLLM());

    const onErrorMock = vi.fn();

    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        "" as any, // Empty provider - cast to any to bypass type checking for test
        mockApiKey,
        mockModel,
        undefined,
        { onError: onErrorMock },
      );

      expect(response).toBeNull();
    });

    expect(result.current.error).toBeInstanceOf(LLMError);
    expect(result.current.error?.type).toBe(LLMErrorType.INVALID_MODEL);
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError));
  });

  it("handles missing API key error", async () => {
    const { result } = renderHook(() => useStreamingLLM());

    const onErrorMock = vi.fn();

    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        mockProvider,
        "", // Empty API key
        mockModel,
        undefined,
        { onError: onErrorMock },
      );

      expect(response).toBeNull();
    });

    expect(result.current.error).toBeInstanceOf(LLMError);
    expect(result.current.error?.type).toBe(LLMErrorType.AUTHENTICATION);
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError));
  });

  it("handles unsupported provider error", async () => {
    const { result } = renderHook(() => useStreamingLLM());

    const onErrorMock = vi.fn();

    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        "anthropic", // Unsupported provider
        mockApiKey,
        mockModel,
        undefined,
        { onError: onErrorMock },
      );

      expect(response).toBeNull();
    });

    expect(result.current.error).toBeInstanceOf(LLMError);
    expect(result.current.error?.type).toBe(LLMErrorType.API_ERROR);
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError));
  });

  it("streams messages successfully", async () => {
    // Mock the streamMessage function to return an async iterable
    const mockStreamMessage = vi.fn().mockImplementation(() => {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { token: "Hello", done: false };
          yield { token: " world", done: false };
          yield { token: "!", done: true };
        },
      };
    });

    // Set up the mock implementation
    const mockClient = {
      streamMessage: mockStreamMessage,
      getProviderName: () => "openai",
      getDefaultModel: () => "gpt-4" as LLMModel,
      getAvailableModels: () => ["gpt-4", "gpt-3.5-turbo"] as LLMModel[],
      supportsStreaming: () => true,
      getCapabilities: () => ({
        supportsStreaming: true,
        supportsSystemMessages: true,
        maxContextLength: 10000,
      }),
      sendMessage: vi.fn(),
      validateApiKey: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(LLMService.getClient).mockReturnValue(mockClient);

    const { result } = renderHook(() => useStreamingLLM());

    const onTokenMock = vi.fn();
    const onCompleteMock = vi.fn();

    await act(async () => {
      // During streaming, isStreaming should be true
      expect(result.current.isStreaming).toBe(false);

      const response = await result.current.streamMessage(
        mockMessages,
        mockProvider,
        mockApiKey,
        mockModel,
        undefined,
        {
          onToken: onTokenMock,
          onComplete: onCompleteMock,
        },
      );

      // After streaming, isStreaming should be false
      expect(result.current.isStreaming).toBe(false);

      // Check the response
      expect(response).toBe("Hello world!");
    });

    // Check that the client was retrieved for the correct provider
    expect(LLMService.getClient).toHaveBeenCalledWith(mockProvider);

    // Check that streamMessage was called with the correct arguments
    expect(mockStreamMessage).toHaveBeenCalledWith(
      mockMessages,
      mockApiKey,
      mockModel,
      undefined,
      expect.any(AbortSignal),
    );

    // Check that the callbacks were called
    expect(onTokenMock).toHaveBeenCalledTimes(3);
    expect(onTokenMock).toHaveBeenNthCalledWith(1, "Hello");
    expect(onTokenMock).toHaveBeenNthCalledWith(2, " world");
    expect(onTokenMock).toHaveBeenNthCalledWith(3, "!");

    expect(onCompleteMock).toHaveBeenCalledWith("Hello world!");
  });

  it("handles stream errors", async () => {
    // Mock the streamMessage function to throw an error
    const mockError = new Error("Stream error");
    const mockStreamMessage = vi.fn().mockImplementation(() => {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { token: "Hello", done: false };
          yield { error: mockError };
        },
      };
    });

    // Set up the mock implementation
    const mockClient = {
      streamMessage: mockStreamMessage,
      getProviderName: () => "openai",
      getDefaultModel: () => "gpt-4" as LLMModel,
      getAvailableModels: () => ["gpt-4", "gpt-3.5-turbo"] as LLMModel[],
      supportsStreaming: () => true,
      getCapabilities: () => ({
        supportsStreaming: true,
        supportsSystemMessages: true,
        maxContextLength: 10000,
      }),
      sendMessage: vi.fn(),
      validateApiKey: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(LLMService.getClient).mockReturnValue(mockClient);

    const { result } = renderHook(() => useStreamingLLM());

    const onTokenMock = vi.fn();
    const onErrorMock = vi.fn();

    await act(async () => {
      const response = await result.current.streamMessage(
        mockMessages,
        mockProvider,
        mockApiKey,
        mockModel,
        undefined,
        {
          onToken: onTokenMock,
          onError: onErrorMock,
        },
      );

      expect(response).toBeNull();
    });

    // Check that the error was set
    expect(result.current.error).toBeInstanceOf(LLMError);
    expect(result.current.error?.message).toBe("Stream error");

    // Check that the callbacks were called
    expect(onTokenMock).toHaveBeenCalledWith("Hello");
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(LLMError));
  });

  it("aborts the stream", async () => {
    // Create a mock abort controller
    const mockAbort = vi.fn();
    global.AbortController = vi.fn().mockImplementation(() => ({
      signal: {},
      abort: mockAbort,
    }));

    const { result } = renderHook(() => useStreamingLLM());

    // Start streaming (but don't await it)
    act(() => {
      result.current.streamMessage(
        mockMessages,
        mockProvider,
        mockApiKey,
        mockModel,
      );
    });

    // Abort the stream
    act(() => {
      result.current.abortStream();
    });

    // Check that abort was called
    expect(mockAbort).toHaveBeenCalled();

    // Check that isStreaming was set to false
    expect(result.current.isStreaming).toBe(false);
  });
});
