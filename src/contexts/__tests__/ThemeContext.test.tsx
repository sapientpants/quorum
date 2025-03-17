import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../ThemeContext";
import { useThemeContext } from "../../hooks/useThemeContext";
import type { Theme } from "../../types/preferences";

// Mock the useTheme hook
vi.mock("../../hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "light" as Theme,
    effectiveTheme: "light" as Theme,
    systemPreference: "light" as "light" | "dark",
    isDark: false,
    isLight: true,
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

// Mock the useThemeContext hook
vi.mock("../../hooks/useThemeContext", () => ({
  useThemeContext: vi.fn(),
}));

// Test component that uses the theme context
function TestComponent() {
  const themeContext = useThemeContext();

  return (
    <div>
      <div data-testid="theme">{themeContext.theme}</div>
      <div data-testid="effective-theme">{themeContext.effectiveTheme}</div>
      <div data-testid="system-preference">{themeContext.systemPreference}</div>
      <div data-testid="is-dark">{themeContext.isDark.toString()}</div>
      <div data-testid="is-light">{themeContext.isLight.toString()}</div>
      <button data-testid="toggle-theme-btn" onClick={themeContext.toggleTheme}>
        Toggle Theme
      </button>
      <button
        data-testid="set-theme-btn"
        onClick={() => themeContext.setTheme("dark")}
      >
        Set Dark Theme
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  it("provides theme context to children", () => {
    // Setup the mock implementation for useThemeContext
    const mockThemeContext = {
      theme: "light" as Theme,
      effectiveTheme: "light" as Theme,
      systemPreference: "light" as "light" | "dark",
      isDark: false,
      isLight: true,
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    };

    vi.mocked(useThemeContext).mockReturnValue(mockThemeContext);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    // Check that the context values are passed to the children
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("effective-theme")).toHaveTextContent("light");
    expect(screen.getByTestId("system-preference")).toHaveTextContent("light");
    expect(screen.getByTestId("is-dark")).toHaveTextContent("false");
    expect(screen.getByTestId("is-light")).toHaveTextContent("true");
  });

  it("provides dark theme context when theme is dark", () => {
    // Setup the mock implementation for useThemeContext with dark theme
    const mockThemeContext = {
      theme: "dark" as Theme,
      effectiveTheme: "dark" as Theme,
      systemPreference: "light" as "light" | "dark",
      isDark: true,
      isLight: false,
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    };

    vi.mocked(useThemeContext).mockReturnValue(mockThemeContext);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    // Check that the context values are passed to the children
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("effective-theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("is-dark")).toHaveTextContent("true");
    expect(screen.getByTestId("is-light")).toHaveTextContent("false");
  });

  it("provides system theme that resolves to dark when system preference is dark", () => {
    // Setup the mock implementation for useThemeContext with system theme and dark system preference
    const mockThemeContext = {
      theme: "system" as Theme,
      effectiveTheme: "dark" as Theme,
      systemPreference: "dark" as "light" | "dark",
      isDark: true,
      isLight: false,
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    };

    vi.mocked(useThemeContext).mockReturnValue(mockThemeContext);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    // Check that the context values are passed to the children
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("effective-theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("system-preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("is-dark")).toHaveTextContent("true");
    expect(screen.getByTestId("is-light")).toHaveTextContent("false");
  });
});
