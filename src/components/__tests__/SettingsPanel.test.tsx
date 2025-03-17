import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPanel from "../SettingsPanel";
import type { LLMSettings } from "../../types/llm";

describe("SettingsPanel", () => {
  const defaultSettings: LLMSettings = {
    temperature: 0.7,
    maxTokens: 1000,
  };

  const mockOnSettingsChange = vi.fn();
  const mockOnStreamingChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the settings panel with correct values", () => {
    render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        useStreaming={true}
        onStreamingChange={mockOnStreamingChange}
        isStreamingSupported={true}
      />,
    );

    // Check that the title is rendered
    expect(screen.getByText("Advanced Settings")).toBeInTheDocument();

    // Check that temperature settings are rendered
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("0.7")).toBeInTheDocument(); // Temperature value
    expect(screen.getByText("Precise")).toBeInTheDocument();
    expect(screen.getByText("Creative")).toBeInTheDocument();

    // Check that max tokens settings are rendered
    expect(screen.getByText("Maximum Length")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument(); // Max tokens value
    expect(screen.getByText("Short")).toBeInTheDocument();
    expect(screen.getByText("Long")).toBeInTheDocument();

    // Check that streaming toggle is rendered
    expect(screen.getByText("Enable streaming")).toBeInTheDocument();
    expect(
      screen.getByText("Streaming shows responses as they are generated"),
    ).toBeInTheDocument();

    // Check that the streaming toggle is checked
    const streamingToggle = screen.getByRole("checkbox", {
      name: "Enable streaming",
    });
    expect(streamingToggle).toBeChecked();
  });

  it("does not render streaming toggle when streaming is not supported", () => {
    render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        useStreaming={true}
        onStreamingChange={mockOnStreamingChange}
        isStreamingSupported={false}
      />,
    );

    // Check that streaming toggle is not rendered
    expect(screen.queryByText("Enable streaming")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Streaming shows responses as they are generated"),
    ).not.toBeInTheDocument();
  });

  it("calls onSettingsChange when temperature is changed", () => {
    render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        useStreaming={true}
        onStreamingChange={mockOnStreamingChange}
        isStreamingSupported={true}
      />,
    );

    // Find the temperature slider
    const temperatureSlider = screen.getAllByRole("slider")[0];

    // Change the temperature to 0.5
    fireEvent.change(temperatureSlider, { target: { value: "0.5" } });

    // Check that onSettingsChange was called with the correct settings
    expect(mockOnSettingsChange).toHaveBeenCalledTimes(1);
    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      temperature: 0.5,
    });
  });

  it("calls onSettingsChange when max tokens is changed", () => {
    render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        useStreaming={true}
        onStreamingChange={mockOnStreamingChange}
        isStreamingSupported={true}
      />,
    );

    // Find the max tokens slider
    const maxTokensSlider = screen.getAllByRole("slider")[1];

    // Change the max tokens to 2000
    fireEvent.change(maxTokensSlider, { target: { value: "2000" } });

    // Check that onSettingsChange was called with the correct settings
    expect(mockOnSettingsChange).toHaveBeenCalledTimes(1);
    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      maxTokens: 2000,
    });
  });

  it("calls onStreamingChange when streaming toggle is changed", () => {
    render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        useStreaming={true}
        onStreamingChange={mockOnStreamingChange}
        isStreamingSupported={true}
      />,
    );

    // Find the streaming toggle
    const streamingToggle = screen.getByRole("checkbox", {
      name: "Enable streaming",
    });

    // Uncheck the toggle
    fireEvent.click(streamingToggle);

    // Check that onStreamingChange was called with false
    expect(mockOnStreamingChange).toHaveBeenCalledTimes(1);
    expect(mockOnStreamingChange).toHaveBeenCalledWith(false);
  });
});
