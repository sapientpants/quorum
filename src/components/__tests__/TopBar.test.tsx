import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "../TopBar";
import { BrowserRouter } from "react-router-dom";

// Mock the LanguageToggle component
vi.mock("../LanguageToggle", () => ({
  LanguageToggle: () => (
    <div data-testid="language-toggle">Language Toggle</div>
  ),
}));

// Mock the ThemeSelectorWithErrorBoundary component
vi.mock("../ThemeSelectorWithErrorBoundary", () => ({
  ThemeSelectorWithErrorBoundary: () => (
    <div data-testid="theme-selector">Theme Selector</div>
  ),
}));

// Mock the Iconify Icon component
vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: { icon: string }) => (
    <div data-testid="icon" data-icon={icon}></div>
  ),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "app.name": "Quorum",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock HeroUI components
vi.mock("@heroui/react", () => ({
  Navbar: ({
    children,
    isMenuOpen,
    onMenuOpenChange,
    className,
  }: {
    children: React.ReactNode;
    isMenuOpen: boolean;
    onMenuOpenChange: (isOpen: boolean) => void;
    className: string;
  }) => (
    <nav
      data-testid="navbar"
      data-is-menu-open={isMenuOpen}
      className={className}
      onClick={() => onMenuOpenChange(!isMenuOpen)}
    >
      {children}
    </nav>
  ),
  NavbarBrand: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navbar-brand">{children}</div>
  ),
  NavbarContent: ({
    children,
    justify,
  }: {
    children: React.ReactNode;
    justify?: string;
  }) => (
    <div data-testid="navbar-content" data-justify={justify}>
      {children}
    </div>
  ),
  NavbarItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navbar-item">{children}</div>
  ),
  NavbarMenuToggle: ({
    "aria-label": ariaLabel,
    className,
  }: {
    "aria-label": string;
    className: string;
  }) => (
    <button
      data-testid="navbar-menu-toggle"
      aria-label={ariaLabel}
      className={className}
    >
      Toggle Menu
    </button>
  ),
}));

describe("TopBar", () => {
  it("renders the navbar with correct components", () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>,
    );

    // Check that the navbar is rendered
    expect(screen.getByTestId("navbar")).toBeInTheDocument();

    // Check that the navbar brand is rendered with app name
    expect(screen.getByTestId("navbar-brand")).toBeInTheDocument();
    expect(screen.getByText("Quorum")).toBeInTheDocument();

    // Check that the app icon is rendered
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-icon", "solar:chat-round-dots-bold");

    // Check that the language toggle is rendered
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();

    // Check that the theme selector is rendered
    expect(screen.getByTestId("theme-selector")).toBeInTheDocument();
  });

  it("has a link to the home page in the navbar brand", () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>,
    );

    // Check that there's a link to the home page
    const homeLink = screen.getByRole("link");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("has the correct layout with content justified at the ends", () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>,
    );

    // Get all navbar content elements
    const navbarContents = screen.getAllByTestId("navbar-content");

    // The first one should have no justify attribute (default is start)
    expect(navbarContents[0]).not.toHaveAttribute("data-justify");

    // The second one should be justified at the end
    expect(navbarContents[1]).toHaveAttribute("data-justify", "end");
  });
});
