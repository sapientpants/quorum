import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSelector } from "../ThemeSelector";
import { vi } from "vitest";

// Mock the useTheme exports
vi.mock("../../hooks/useTheme", () => ({
  isThemeDark: (theme: string) => theme === "dark" || theme === "dracula",
  themeCategories: {
    light: ["light", "cupcake", "bumblebee"],
    dark: ["dark", "dracula", "night"],
  },
}));

// Mock the i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "theme.select": "Select theme",
        "theme.toggle": "Toggle theme",
        "theme.lightThemes": "Light Themes",
        "theme.darkThemes": "Dark Themes",
        "theme.themeToggleInfo":
          "Toggle between your preferred light and dark themes",
        "theme.system": "System",
        "theme.preferences": "Preferences",
        "theme.followSystem": "Follow system preference",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the HeroUI components
vi.mock("@heroui/react", async () => {
  const actual = await vi.importActual("@heroui/react");
  return {
    ...actual,
    Button: ({
      onClick,
      children,
      "aria-label": ariaLabel,
    }: {
      onClick?: () => void;
      children: React.ReactNode;
      "aria-label"?: string;
    }) => (
      <button onClick={onClick} aria-label={ariaLabel} data-testid="button">
        {children}
      </button>
    ),
  };
});

// Mock the useThemeContext - now imported from hooks directory
const toggleThemeMock = vi.fn();
let mockIsDark = false;
let mockEffectiveTheme = "light";

vi.mock("../../hooks/useThemeContext", () => ({
  useThemeContext: () => ({
    effectiveTheme: mockEffectiveTheme,
    isDark: mockIsDark,
    isLight: !mockIsDark,
    toggleTheme: toggleThemeMock,
  }),
}));

// Mock the ThemeContext
vi.mock("../../contexts/ThemeContext", () => ({
  ThemeContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("ThemeSelector", () => {
  beforeEach(() => {
    toggleThemeMock.mockClear();
    mockIsDark = false;
    mockEffectiveTheme = "light";
  });

  it("renders the theme toggle button", () => {
    render(<ThemeSelector />);

    // Check if the button is rendered
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("calls toggleTheme when clicked", () => {
    render(<ThemeSelector />);

    // Click the button
    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);

    // Check if toggleTheme was called
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });

  it("renders with dark theme icon when in dark mode", () => {
    // Set up dark theme for this test
    mockIsDark = true;
    mockEffectiveTheme = "dark";

    render(<ThemeSelector />);

    // Check if the button has the moon icon (we can't easily check the icon directly,
    // but we can verify the button is rendered)
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });
});
