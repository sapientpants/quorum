import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProviderSelector from "../ProviderSelector";
import type { LLMProvider, LLMModel } from "../../types/llm";
import { createTranslationMock } from "../../../vitest.setup";

describe("ProviderSelector", () => {
  // Mock providers for testing
  const mockProviders: LLMProvider[] = [
    { id: "openai", displayName: "OpenAI", models: ["gpt-4o", "gpt-3.5-turbo"] as LLMModel[] },
    {
      id: "anthropic",
      displayName: "Anthropic",
      models: ["claude-3-opus", "claude-3-sonnet"] as LLMModel[],
    },
    { id: "google", displayName: "Google", models: ["gemini-pro"] as LLMModel[] },
  ];

  const mockOnSelect = vi.fn();
  const mockApiKeys: Record<string, string> = {
    openai: "test-openai-key",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    createTranslationMock({
      "providerSelector.selectProvider": "Select Provider",
      "providerSelector.configureApiKey": "Configure API Key",
    });
  });

  it("renders all providers as buttons", () => {
    const apiKeys = { openai: "key1", anthropic: "key2", google: "key3" };

    render(
      <ProviderSelector
        providers={mockProviders}
        activeProvider={null}
        onSelect={mockOnSelect}
        apiKeys={apiKeys}
      />,
    );

    // Check that the label is rendered
    expect(screen.getByText("Select Provider")).toBeInTheDocument();

    // Check that all provider buttons are rendered
    mockProviders.forEach((provider) => {
      expect(screen.getByText(provider.displayName)).toBeInTheDocument();
    });

    // Check that no buttons are disabled
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it("highlights the active provider", () => {
    const apiKeys = { openai: "key1", anthropic: "key2", google: "key3" };

    render(
      <ProviderSelector
        providers={mockProviders}
        activeProvider={mockProviders[1]} // Anthropic
        onSelect={mockOnSelect}
        apiKeys={apiKeys}
      />,
    );

    // Get all buttons
    const buttons = screen.getAllByRole("button");
  
    // Find the Anthropic button (should be active)
    const anthropicButton = screen.getByText("Anthropic").closest("button");
    expect(anthropicButton).toHaveClass("btn-primary");
  
    // Check that other buttons are not active
    const openaiButton = screen.getByText("OpenAI").closest("button");
    expect(openaiButton).not.toHaveClass("btn-primary");
  });

  it("disables providers without API keys", () => {
    // Only OpenAI has an API key
    const apiKeys = { openai: "key1" };

    render(
      <ProviderSelector
        providers={mockProviders}
        activeProvider={null}
        onSelect={mockOnSelect}
        apiKeys={apiKeys}
      />,
    );

    // Check that OpenAI button is enabled
    const openaiButton = screen.getByText("OpenAI");
    expect(openaiButton).not.toBeDisabled();

    // Check that other buttons are disabled and show "No API Key" text
    expect(screen.getByText("Anthropic (No API Key)")).toBeDisabled();
    expect(screen.getByText("Google (No API Key)")).toBeDisabled();
  });

  it("calls onSelect when a provider is clicked", () => {
    const apiKeys = { openai: "key1", anthropic: "key2", google: "key3" };

    render(
      <ProviderSelector
        providers={mockProviders}
        activeProvider={null}
        onSelect={mockOnSelect}
        apiKeys={apiKeys}
      />,
    );

    // Click on the Anthropic button
    const anthropicButton = screen.getByText("Anthropic");
    fireEvent.click(anthropicButton);

    // Check that onSelect was called with the correct provider
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockProviders[1]);
  });

  it("does not call onSelect when a disabled provider is clicked", () => {
    // Only OpenAI has an API key
    const apiKeys = { openai: "key1" };

    render(
      <ProviderSelector
        providers={mockProviders}
        activeProvider={null}
        onSelect={mockOnSelect}
        apiKeys={apiKeys}
      />,
    );

    // Try to click on the disabled Anthropic button
    const anthropicButton = screen.getByText("Anthropic (No API Key)");
    fireEvent.click(anthropicButton);

    // Check that onSelect was not called
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
