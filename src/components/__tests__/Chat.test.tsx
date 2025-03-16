import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Chat from "../Chat";
import { useChat } from "../../hooks/useChat";
import type { ChatContextValue } from "../../contexts/ChatContextValue";
import type { LLMProvider } from "../../types/llm";

// Mock the hooks
vi.mock("../../hooks/useChat");

// Mock the child components
vi.mock("../ChatList", () => ({
  ChatList: () => <div data-testid="chat-list">ChatList Component</div>,
}));

vi.mock("../ChatInput", () => ({
  ChatInput: () => <div data-testid="chat-input">ChatInput Component</div>,
}));

vi.mock("../ProviderSelector", () => ({
  default: () => (
    <div data-testid="provider-selector">ProviderSelector Component</div>
  ),
}));

vi.mock("../ModelSelector", () => ({
  default: () => (
    <div data-testid="model-selector">ModelSelector Component</div>
  ),
}));

vi.mock("../SettingsPanel", () => ({
  default: () => (
    <div data-testid="settings-panel">SettingsPanel Component</div>
  ),
}));

vi.mock("../ErrorDisplay", () => ({
  default: () => <div data-testid="error-display">ErrorDisplay Component</div>,
}));

describe("Chat", () => {
  const mockChatContext: ChatContextValue = {
    messages: [],
    isLoading: false,
    error: null,
    activeProvider: null,
    setActiveProvider: vi.fn(),
    activeModel: null,
    setActiveModel: vi.fn(),
    availableModels: [],
    apiKeys: {},
    handleApiKeyChange: vi.fn(),
    isProviderConfigured: vi.fn(),
    isStreamingSupported: vi.fn().mockReturnValue(true),
    supportedProviders: [],
    settings: { temperature: 0.7, maxTokens: 2000 },
    setSettings: vi.fn(),
    useStreaming: true,
    setUseStreaming: vi.fn(),
    addUserMessage: vi.fn(),
    sendMessage: vi.fn(),
    handleRetry: vi.fn(),
    clearError: vi.fn(),
    abortStream: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChat).mockReturnValue(mockChatContext);
  });

  it("renders all components correctly", () => {
    render(<Chat />);

    // Check that all child components are rendered
    expect(screen.getByTestId("provider-selector")).toBeInTheDocument();
    expect(screen.getByTestId("settings-panel")).toBeInTheDocument();
    expect(screen.getByTestId("chat-list")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();

    // ModelSelector should not be rendered when activeProvider is null
    expect(screen.queryByTestId("model-selector")).not.toBeInTheDocument();

    // ErrorDisplay should not be rendered when error is null
    expect(screen.queryByTestId("error-display")).not.toBeInTheDocument();
  });

  it("renders ModelSelector when a provider is selected", () => {
    const mockProvider: LLMProvider = {
      id: "openai",
      displayName: "OpenAI",
      models: [],
    };

    vi.mocked(useChat).mockReturnValue({
      ...mockChatContext,
      activeProvider: mockProvider,
    });

    render(<Chat />);

    // ModelSelector should be rendered when activeProvider is set
    expect(screen.getByTestId("model-selector")).toBeInTheDocument();
  });

  it("renders ErrorDisplay when there is an error", () => {
    vi.mocked(useChat).mockReturnValue({
      ...mockChatContext,
      error: "Test error message",
    });

    render(<Chat />);

    // ErrorDisplay should be rendered when error is not null
    expect(screen.getByTestId("error-display")).toBeInTheDocument();
  });
});
