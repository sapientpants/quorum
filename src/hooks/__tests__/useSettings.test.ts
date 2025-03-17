import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettings } from "../useSettings";
import type { LLMSettings } from "../../types/llm";

describe("useSettings", () => {
  it("should initialize with default settings when no initial settings are provided", () => {
    const { result } = renderHook(() => useSettings());

    // Check default values
    expect(result.current.settings).toEqual({
      temperature: 0.7,
      maxTokens: 1000,
      topP: undefined,
      frequencyPenalty: undefined,
      presencePenalty: undefined,
    });

    // Check streaming is enabled by default
    expect(result.current.useStreaming).toBe(true);
  });

  it("should initialize with provided initial settings", () => {
    const initialSettings: Partial<LLMSettings> = {
      temperature: 0.5,
      maxTokens: 2000,
      topP: 0.9,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    };

    const { result } = renderHook(() => useSettings(initialSettings));

    // Check that initial values are used
    expect(result.current.settings).toEqual(initialSettings);
  });

  it("should update temperature correctly", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateTemperature(0.3);
    });

    expect(result.current.settings.temperature).toBe(0.3);
  });

  it("should update maxTokens correctly", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateMaxTokens(3000);
    });

    expect(result.current.settings.maxTokens).toBe(3000);
  });

  it("should update topP correctly", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateTopP(0.8);
    });

    expect(result.current.settings.topP).toBe(0.8);
  });

  it("should update frequencyPenalty correctly", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateFrequencyPenalty(0.5);
    });

    expect(result.current.settings.frequencyPenalty).toBe(0.5);
  });

  it("should update presencePenalty correctly", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updatePresencePenalty(0.7);
    });

    expect(result.current.settings.presencePenalty).toBe(0.7);
  });

  it("should toggle streaming correctly", () => {
    const { result } = renderHook(() => useSettings());

    // Default is true
    expect(result.current.useStreaming).toBe(true);

    // Toggle to false
    act(() => {
      result.current.setUseStreaming(false);
    });

    expect(result.current.useStreaming).toBe(false);

    // Toggle back to true
    act(() => {
      result.current.setUseStreaming(true);
    });

    expect(result.current.useStreaming).toBe(true);
  });

  it("should update all settings at once with setSettings", () => {
    const { result } = renderHook(() => useSettings());

    const newSettings: LLMSettings = {
      temperature: 0.4,
      maxTokens: 4000,
      topP: 0.95,
      frequencyPenalty: 0.1,
      presencePenalty: 0.2,
    };

    act(() => {
      result.current.setSettings(newSettings);
    });

    expect(result.current.settings).toEqual(newSettings);
  });

  it("should preserve other settings when updating individual settings", () => {
    const initialSettings: Partial<LLMSettings> = {
      temperature: 0.5,
      maxTokens: 2000,
      topP: 0.9,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    };

    const { result } = renderHook(() => useSettings(initialSettings));

    // Update just temperature
    act(() => {
      result.current.updateTemperature(0.8);
    });

    // Check that only temperature changed
    expect(result.current.settings).toEqual({
      ...initialSettings,
      temperature: 0.8,
    });
  });
});
