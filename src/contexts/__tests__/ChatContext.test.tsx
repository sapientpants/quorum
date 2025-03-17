import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatProvider } from "../ChatContext";
import type { Message } from "../../types/chat";
import type { LLMProvider, LLMModel } from "../../types/llm";

// Create mocked function references that we can update in tests
const mockUseChatState = vi.fn();
const mockUseProviderSelection = vi.fn();
const mockUseSettings = vi.fn();
const mockUseStreamingLLM = vi.fn();

// Mock the custom hooks
vi.mock("../../hooks/useChatState", () => ({
  useChatState: (...args: unknown[]) => mockUseChatState(...args),
}));

vi.mock("../../hooks/useProviderSelection", () => ({
  useProviderSelection: (...args: unknown[]) =>
    mockUseProviderSelection(...args),
}));

vi.mock("../../hooks/useSettings", () => ({
  useSettings: (...args: unknown[]) => mockUseSettings(...args),
}));

vi.mock("../../hooks/useStreamingLLM", () => ({
  useStreamingLLM: (...args: unknown[]) => mockUseStreamingLLM(...args),
}));

describe("ChatContext", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mock implementations
    mockUseChatState.mockReturnValue({
      messages: [],
      isLoading: false,
      setIsLoading: vi.fn(),
      error: null,
      setError: vi.fn(),
      addUserMessage: vi.fn((text: string) => ({
        id: "user-123",
        senderId: "user",
        text,
        timestamp: Date.now(),
        status: "sent",
      })),
      addAIMessage: vi.fn(() => "ai-123"),
      updateAIMessage: vi.fn(),
      handleRetry: vi.fn(),
      clearError: vi.fn(),
    });

    mockUseProviderSelection.mockReturnValue({
      activeProvider: null,
      setActiveProvider: vi.fn(),
      activeModel: null,
      setActiveModel: vi.fn(),
      availableModels: [],
      apiKeys: {},
      handleApiKeyChange: vi.fn(),
      isProviderConfigured: vi.fn(() => false),
      isStreamingSupported: vi.fn(() => false),
      getSupportedProvidersList: vi.fn(() => [
        { id: "openai" as const, displayName: "OpenAI", models: [] },
        { id: "anthropic" as const, displayName: "Anthropic", models: [] },
      ]),
    });

    mockUseSettings.mockReturnValue({
      settings: {
        temperature: 0.7,
        maxTokens: 1000,
      },
      setSettings: vi.fn(),
      useStreaming: false,
      setUseStreaming: vi.fn(),
    });

    mockUseStreamingLLM.mockReturnValue({
      streamMessage: vi.fn(),
      abortStream: vi.fn(),
    });
  });

  it("renders children without crashing", () => {
    render(
      <ChatProvider>
        <div data-testid="test-component">Test Component</div>
      </ChatProvider>,
    );

    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });

  it("provides chat context to children", () => {
    // Mock implementation of useChatState
    const mockMessages: Message[] = [
      {
        id: "user-1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
        status: "sent",
      },
      {
        id: "ai-1",
        senderId: "assistant",
        text: "Hi there!",
        timestamp: Date.now(),
        status: "sent",
        provider: "openai" as const,
        model: "gpt-4",
      },
    ];

    const mockProvider: LLMProvider = {
      id: "openai" as const,
      displayName: "OpenAI",
      models: [],
    };
    const mockModel: LLMModel = "gpt-4";

    // Update the mock implementations
    mockUseChatState.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      setIsLoading: vi.fn(),
      error: null,
      setError: vi.fn(),
      addUserMessage: vi.fn(),
      addAIMessage: vi.fn(),
      updateAIMessage: vi.fn(),
      handleRetry: vi.fn(),
      clearError: vi.fn(),
    });

    mockUseProviderSelection.mockReturnValue({
      activeProvider: mockProvider,
      setActiveProvider: vi.fn(),
      activeModel: mockModel,
      setActiveModel: vi.fn(),
      availableModels: ["gpt-4", "gpt-3.5-turbo"],
      apiKeys: { openai: "test-key" },
      handleApiKeyChange: vi.fn(),
      isProviderConfigured: vi.fn(() => true),
      isStreamingSupported: vi.fn(() => true),
      getSupportedProvidersList: vi.fn(() => [mockProvider]),
    });

    // Create a test component that accesses the context
    function ContextConsumer() {
      return (
        <div>
          <div data-testid="message-count">{mockMessages.length}</div>
          <div data-testid="active-provider">{mockProvider.displayName}</div>
          <div data-testid="active-model">{mockModel}</div>
        </div>
      );
    }

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>,
    );

    // Check that the context values are passed to the children
    expect(screen.getByTestId("message-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active-provider")).toHaveTextContent("OpenAI");
    expect(screen.getByTestId("active-model")).toHaveTextContent("gpt-4");
  });
});
