import { act } from "@testing-library/react";
import { vi } from "vitest";
import { usePreferencesStore } from "../preferencesStore";
import type { Theme, UserPreferences } from "../../types/preferences";

// Mock console.log to avoid noise in tests
vi.spyOn(console, "log").mockImplementation(() => {});

describe("preferencesStore", () => {
  // Get a reference to the store
  const store = usePreferencesStore.getState();

  // Default preferences for comparison
  const defaultPreferences: UserPreferences = {
    theme: "system",
    accentColor: "purple",
    autoAdvance: true,
    showThinkingIndicators: true,
    autoSummarize: false,
    keyStoragePreference: "session",
    language: "en",
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
    defaultSystemPrompt: "",
    wizardCompleted: false,
  };

  beforeEach(() => {
    // Reset the store state before each test
    act(() => {
      store.resetPreferences();
    });
  });

  test("should initialize with default preferences", () => {
    const state = usePreferencesStore.getState();
    expect(state.preferences).toEqual(defaultPreferences);
    expect(state.hasConsented).toBe(false);
  });

  test("should update preferences", () => {
    act(() => {
      store.updatePreferences({
        theme: "dark",
        accentColor: "blue",
        language: "de",
      });
    });

    const state = usePreferencesStore.getState();
    expect(state.preferences).toEqual({
      ...defaultPreferences,
      theme: "dark",
      accentColor: "blue",
      language: "de",
    });
  });

  test("should set theme", () => {
    const newTheme: Theme = "dark";

    act(() => {
      store.setTheme(newTheme);
    });

    const state = usePreferencesStore.getState();
    expect(state.preferences.theme).toBe(newTheme);
    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith(
      "PreferencesStore: Setting theme to",
      newTheme,
    );
  });

  test("should set hasConsented", () => {
    act(() => {
      store.setHasConsented(true);
    });

    const state = usePreferencesStore.getState();
    expect(state.hasConsented).toBe(true);
  });

  test("should set wizardCompleted", () => {
    act(() => {
      store.setWizardCompleted(true);
    });

    const state = usePreferencesStore.getState();
    expect(state.preferences.wizardCompleted).toBe(true);
  });

  test("should set wizardStep", () => {
    const step = 3;

    act(() => {
      store.setWizardStep(step);
    });

    const state = usePreferencesStore.getState();
    expect(state.preferences.wizardStep).toBe(step);
  });

  test("should reset preferences", () => {
    // First update some preferences
    act(() => {
      store.updatePreferences({
        theme: "dark",
        accentColor: "blue",
        language: "de",
      });
      store.setHasConsented(true);
    });

    // Verify the updates were applied
    let state = usePreferencesStore.getState();
    expect(state.preferences.theme).toBe("dark");
    expect(state.hasConsented).toBe(true);

    // Then reset
    act(() => {
      store.resetPreferences();
    });

    // Verify the reset
    state = usePreferencesStore.getState();
    expect(state.preferences).toEqual(defaultPreferences);
    expect(state.hasConsented).toBe(false);
  });

  test("should preserve other preferences when updating", () => {
    // First set some initial preferences
    act(() => {
      store.updatePreferences({
        theme: "dark",
        accentColor: "blue",
        language: "de",
      });
    });

    // Then update just one preference
    act(() => {
      store.updatePreferences({
        theme: "light",
      });
    });

    // Verify only the specified preference was updated
    const state = usePreferencesStore.getState();
    expect(state.preferences).toEqual({
      ...defaultPreferences,
      theme: "light",
      accentColor: "blue",
      language: "de",
    });
  });
});
