import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { usePreferencesStore } from "../../store/preferencesStore";

// Mock the language context
vi.mock("../../hooks/useLanguageContext", () => ({
  useLanguageContext: () => ({
    language: "en",
    changeLanguage: vi.fn(),
    t: (key: string) => key,
    availableLanguages: [
      { code: "en", name: "English" },
      { code: "de", name: "Deutsch" },
    ],
  }),
}));

// Mock the error context
vi.mock("../../hooks/useErrorContext", () => ({
  useErrorContext: () => ({
    error: null,
    setError: vi.fn(),
    clearError: vi.fn(),
    isOffline: false,
    isLowBandwidth: false,
  }),
}));

// Mock the NetworkStatusIndicator component
vi.mock("../../components/NetworkStatusIndicator", () => ({
  NetworkStatusIndicator: () => (
    <div data-testid="network-status">Network Status</div>
  ),
}));

// Mock React.lazy
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lazy: (_factory: () => Promise<{ default: unknown }>) => {
      const Component = () => <div>Mocked Lazy Component</div>;
      Component.displayName = "MockedLazyComponent";
      return Component;
    },
  };
});

// Mock the lazy-loaded components
vi.mock("../../pages/Welcome", () => ({
  Welcome: () => <div data-testid="welcome-page">Welcome Page</div>,
}));

vi.mock("../../pages/SecurityPage", () => ({
  SecurityPage: () => <div data-testid="security-page">Security Page</div>,
}));

vi.mock("../../pages/ApiKeysPage", () => ({
  ApiKeysPage: () => <div data-testid="api-keys-page">API Keys Page</div>,
}));

vi.mock("../../pages/ParticipantsPage", () => ({
  ParticipantsPage: () => (
    <div data-testid="participants-page">Participants Page</div>
  ),
}));

vi.mock("../../pages/RoundTablePage", () => ({
  RoundTablePage: () => (
    <div data-testid="round-table-page">Round Table Page</div>
  ),
}));

vi.mock("../../pages/Settings", () => ({
  Settings: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock("../../pages/Templates", () => ({
  Templates: () => <div data-testid="templates-page">Templates Page</div>,
}));

vi.mock("../../pages/NotFound", () => ({
  NotFound: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock react-router-dom Navigate component
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid={`navigate-to-${to}`}>Navigate to {to}</div>
    ),
  };
});

// Mock the preferences store
vi.mock("../../store/preferencesStore", () => ({
  usePreferencesStore: vi.fn(),
}));

// Mock the language provider
vi.mock("../../contexts/LanguageContext", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the theme provider
vi.mock("../../contexts/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the error provider
vi.mock("../../contexts/ErrorContext", () => ({
  ErrorProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the theme context
vi.mock("../../hooks/useThemeContext", () => ({
  useThemeContext: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
    isDark: false,
  }),
}));

// Mock the AppLayout component
vi.mock("../../components/layouts/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Import the actual AppRoutes
import { AppRoutes } from "../../routes/index";

// Helper function to render AppRoutes with necessary providers
const renderAppRoutes = (initialEntries: string[] = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppRoutes />
    </MemoryRouter>,
  );
};

describe("AppRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for usePreferencesStore
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        wizardStep: 3,
        wizardCompleted: true,
      },
    } as unknown as ReturnType<typeof usePreferencesStore>);
  });

  it("renders the routes", () => {
    const { container } = renderAppRoutes();

    // Since we're on the root path by default, we should see the welcome page
    // The lazy component is mocked, so we should see the app-layout
    expect(container.innerHTML).toContain("Mocked Lazy Component");
  });

  it("redirects from API keys page when wizard step is too low", () => {
    // Mock wizard step as 0
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        wizardStep: 0,
        wizardCompleted: false,
      },
    } as unknown as ReturnType<typeof usePreferencesStore>);

    const { container } = renderAppRoutes(["/apiKeys"]);

    // Check that it redirects to the security page
    expect(container.innerHTML).toContain("navigate-to-/security");
  });

  it("redirects from participants page when wizard step is too low", () => {
    // Mock wizard step as 1
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        wizardStep: 1,
        wizardCompleted: false,
      },
    } as unknown as ReturnType<typeof usePreferencesStore>);

    const { container } = renderAppRoutes(["/participants"]);

    // Check that it redirects to the API keys page
    expect(container.innerHTML).toContain("navigate-to-/apiKeys");
  });

  it.skip("redirects from main app routes when wizard is not completed", () => {
    // Mock wizard as not completed
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        wizardStep: 3,
        wizardCompleted: false,
      },
    } as unknown as ReturnType<typeof usePreferencesStore>);

    const { container } = renderAppRoutes(["/roundtable"]);

    // Since the Navigate component is rendered inside the CompletedWizardGuard
    // which is inside the AppLayout, we need to check if the Navigate component
    // is rendered anywhere in the container
    expect(container.textContent).toContain("Navigate to /");
  });

  it("allows access to API keys page when wizard step is high enough", () => {
    // Mock wizard step as 1
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        wizardStep: 1,
        wizardCompleted: false,
      },
    } as unknown as ReturnType<typeof usePreferencesStore>);

    const { container } = renderAppRoutes(["/apiKeys"]);

    // Check that the API keys page is rendered (mocked as lazy component)
    expect(container.innerHTML).toContain("Mocked Lazy Component");
  });

  it("allows access to main app routes when wizard is completed", () => {
    // Mock wizard as completed
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        wizardStep: 3,
        wizardCompleted: true,
      },
    } as unknown as ReturnType<typeof usePreferencesStore>);

    const { container } = renderAppRoutes(["/roundtable"]);

    // Check that the round table page is rendered (mocked as lazy component)
    expect(container.innerHTML).toContain("app-layout");
  });
});
