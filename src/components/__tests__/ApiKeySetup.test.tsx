import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApiKeySetup } from "../ApiKeySetup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApiKey } from "../../types/api";
import { createTranslationMock } from "../../../vitest.setup";

// Set up translations for tests
beforeEach(() => {
  createTranslationMock({
    "apiKeys.openai.placeholder": "sk-...",
    "apiKeys.anthropic.placeholder": "sk-ant-...",
    "apiKeys.grok.placeholder": "grok-...",
    "apiKeys.google.placeholder": "Enter your Google AI API key",
    "apiKeys.openai.getKey": "How to get an OpenAI API key",
    "apiKeys.anthropic.getKey": "How to get an Anthropic API key",
    "apiKeys.grok.getKey": "How to get a Grok API key",
    "apiKeys.google.getKey": "How to get a Google AI API key",
    "common.buttons.continue": "Continue",
    "common.buttons.testing": "Testing...",
    "apiKeys.validation.invalid": "Invalid API key",
  });
});

describe("ApiKeySetup", () => {
  it("renders correctly", () => {
    render(
      <ApiKeySetup
        onComplete={() => {}}
        initialKeys={[]}
        storageType="local"
      />,
    );

    // Check that provider inputs are present
    expect(screen.getByPlaceholderText("sk-...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("sk-ant-...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("grok-...")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your Google AI API key"),
    ).toBeInTheDocument();

    // Check that help links are present
    expect(
      screen.getByText("How to get an OpenAI API key"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How to get an Anthropic API key"),
    ).toBeInTheDocument();
    expect(screen.getByText("How to get a Grok API key")).toBeInTheDocument();
    expect(
      screen.getByText("How to get a Google AI API key"),
    ).toBeInTheDocument();
  });

  it("loads initial keys if provided", () => {
    const initialKeys: ApiKey[] = [
      { id: "1", provider: "openai", key: "test-openai-key" },
      { id: "2", provider: "anthropic", key: "test-anthropic-key" },
    ];

    render(
      <ApiKeySetup
        onComplete={() => {}}
        initialKeys={initialKeys}
        storageType="local"
      />,
    );

    expect(screen.getByPlaceholderText("sk-...")).toHaveValue(
      "test-openai-key",
    );
    expect(screen.getByPlaceholderText("sk-ant-...")).toHaveValue(
      "test-anthropic-key",
    );
  });

  it("validates that at least one key is provided", async () => {
    const onComplete = vi.fn();
    render(
      <ApiKeySetup
        onComplete={onComplete}
        initialKeys={[]}
        storageType="local"
      />,
    );

    // Try to submit without any keys
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  it("validates key format for each provider", async () => {
    render(
      <ApiKeySetup
        onComplete={() => {}}
        initialKeys={[]}
        storageType="local"
      />,
    );

    // Test OpenAI key validation
    fireEvent.change(screen.getByPlaceholderText("sk-..."), {
      target: { value: "invalid-key" },
    });
    fireEvent.blur(screen.getByPlaceholderText("sk-..."));
    await waitFor(() => {
      expect(screen.getByTestId("openai-error")).toBeInTheDocument();
      expect(screen.getByTestId("openai-error")).toHaveTextContent(
        "Invalid API key",
      );
    });

    // Test Anthropic key validation
    fireEvent.change(screen.getByPlaceholderText("sk-ant-..."), {
      target: { value: "invalid-key" },
    });
    fireEvent.blur(screen.getByPlaceholderText("sk-ant-..."));
    await waitFor(() => {
      expect(screen.getByTestId("anthropic-error")).toBeInTheDocument();
      expect(screen.getByTestId("anthropic-error")).toHaveTextContent(
        "Invalid API key",
      );
    });
  });

  it("shows loading state during submission", async () => {
    const onComplete = () => new Promise<void>(() => {});
    render(
      <ApiKeySetup
        onComplete={onComplete}
        initialKeys={[]}
        storageType="local"
      />,
    );

    // Enter a valid OpenAI key
    fireEvent.change(screen.getByPlaceholderText("sk-..."), {
      target: { value: "sk-1234567890abcdef1234567890abcdef1234567890abcdef" },
    });

    const submitButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent("Testing...");
    });
  });

  it("clears errors when user starts typing", async () => {
    render(
      <ApiKeySetup
        onComplete={() => {}}
        initialKeys={[]}
        storageType="local"
      />,
    );

    // First trigger an error
    fireEvent.change(screen.getByPlaceholderText("sk-..."), {
      target: { value: "invalid-key" },
    });
    fireEvent.blur(screen.getByPlaceholderText("sk-..."));
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Invalid")),
      ).toBeInTheDocument();
    });

    // Then start typing again
    fireEvent.change(screen.getByPlaceholderText("sk-..."), {
      target: { value: "sk-" },
    });
    fireEvent.blur(screen.getByPlaceholderText("sk-..."));
    await waitFor(() => {
      expect(
        screen.queryByText((content) => content.includes("Invalid")),
      ).toBeNull();
    });
  });
});
