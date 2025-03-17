import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useThemeContext } from "../useThemeContext";
import { ThemeContext } from "../../contexts/contexts/ThemeContextDefinition";
import { ReactNode } from "react";
import type { Theme } from "../../types/preferences";

// Mock wrapper component
function Wrapper({ children }: { children: ReactNode }) {
  const mockThemeContext = {
    theme: "light" as Theme,
    effectiveTheme: "light" as Theme,
    systemPreference: "light" as "light" | "dark",
    isDark: false,
    isLight: true,
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  };

  return (
    <ThemeContext.Provider value={mockThemeContext}>
      {children}
    </ThemeContext.Provider>
  );
}

// Mock wrapper without context
function EmptyWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

describe("useThemeContext", () => {
  it("returns the theme context when used within a ThemeProvider", () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: Wrapper,
    });

    // Check that the hook returns the context
    expect(result.current).toBeDefined();
    expect(result.current.theme).toBe("light");
    expect(result.current.effectiveTheme).toBe("light");
    expect(result.current.systemPreference).toBe("light");
    expect(result.current.isDark).toBe(false);
    expect(result.current.isLight).toBe(true);
    expect(typeof result.current.toggleTheme).toBe("function");
    expect(typeof result.current.setTheme).toBe("function");
  });

  it("throws an error when used outside of a ThemeProvider", () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect the hook to throw an error
    expect(() => {
      renderHook(() => useThemeContext(), {
        wrapper: EmptyWrapper,
      });
    }).toThrow("useThemeContext must be used within a ThemeProvider");

    // Restore console.error
    console.error = originalConsoleError;
  });

  it("allows toggling the theme", () => {
    const toggleThemeMock = vi.fn();

    // Create a custom wrapper with a mock toggleTheme function
    function CustomWrapper({ children }: { children: ReactNode }) {
      const mockThemeContext = {
        theme: "light" as Theme,
        effectiveTheme: "light" as Theme,
        systemPreference: "light" as "light" | "dark",
        isDark: false,
        isLight: true,
        toggleTheme: toggleThemeMock,
        setTheme: vi.fn(),
      };

      return (
        <ThemeContext.Provider value={mockThemeContext}>
          {children}
        </ThemeContext.Provider>
      );
    }

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: CustomWrapper,
    });

    // Call the toggleTheme function
    result.current.toggleTheme();

    // Check that the mock function was called
    expect(toggleThemeMock).toHaveBeenCalled();
  });

  it("allows setting a specific theme", () => {
    const setThemeMock = vi.fn();

    // Create a custom wrapper with a mock setTheme function
    function CustomWrapper({ children }: { children: ReactNode }) {
      const mockThemeContext = {
        theme: "light" as Theme,
        effectiveTheme: "light" as Theme,
        systemPreference: "light" as "light" | "dark",
        isDark: false,
        isLight: true,
        toggleTheme: vi.fn(),
        setTheme: setThemeMock,
      };

      return (
        <ThemeContext.Provider value={mockThemeContext}>
          {children}
        </ThemeContext.Provider>
      );
    }

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: CustomWrapper,
    });

    // Call the setTheme function
    result.current.setTheme("dark");

    // Check that the mock function was called with the correct argument
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });
});
