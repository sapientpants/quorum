/** @jsxImportSource react */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Settings } from "../Settings";
import { MemoryRouter } from "react-router-dom";
import { usePreferencesStore } from "../../store/preferencesStore";
import userEvent from "@testing-library/user-event";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

// Mock the dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../store/preferencesStore", () => ({
  usePreferencesStore: vi.fn(),
}));

// Simplified mocks for components
vi.mock("../../components/ApiKeyManager", () => ({
  default: () => <div data-testid="api-key-manager">API Key Manager</div>,
}));

vi.mock("../../components/ParticipantList", () => ({
  ParticipantList: () => (
    <div data-testid="participant-list">Participant List</div>
  ),
}));

vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`} />,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    key: vi.fn((index: number) => {
      return Object.keys(store)[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Settings", () => {
  const user = userEvent.setup();
  const mockUpdatePreferences = vi.fn();
  const mockResetPreferences = vi.fn();
  const mockSetWizardCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage mock
    localStorageMock.clear();

    // Setup default mock implementation for usePreferencesStore
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {
        keyStoragePreference: "local",
        theme: "light",
        language: "en",
      },
      updatePreferences: mockUpdatePreferences,
      resetPreferences: mockResetPreferences,
      setWizardStep: vi.fn(),
      setWizardCompleted: mockSetWizardCompleted,
    });
  });

  it("renders the settings page with API keys tab by default", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Check if page title is rendered
    expect(screen.getByText("settings.title")).toBeInTheDocument();

    // Check if API key manager is rendered by default
    expect(screen.getByTestId("api-key-manager")).toBeInTheDocument();

    // Check for tab buttons - use role and containing text to be more specific
    const tabButtons = screen.getAllByRole("button");

    // Find buttons by their contained text and icon combination
    const apiKeysButton = tabButtons.find((button) =>
      button.textContent?.includes("settings.apiKeys"),
    );
    const participantsButton = tabButtons.find((button) =>
      button.textContent?.includes("settings.participants"),
    );
    const privacyButton = tabButtons.find((button) =>
      button.textContent?.includes("settings.privacy"),
    );
    const aboutButton = tabButtons.find((button) =>
      button.textContent?.includes("settings.about"),
    );

    expect(apiKeysButton).toBeInTheDocument();
    expect(participantsButton).toBeInTheDocument();
    expect(privacyButton).toBeInTheDocument();
    expect(aboutButton).toBeInTheDocument();
  });

  it("switches to participants tab when clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Click on Participants tab
    const participantsTab = screen.getByText("settings.participants");
    await user.click(participantsTab);

    // Participant list should now be shown
    expect(screen.getByTestId("participant-list")).toBeInTheDocument();

    // API Key manager should not be visible
    expect(screen.queryByTestId("api-key-manager")).not.toBeInTheDocument();
  });

  it("switches to privacy tab when clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Click on Privacy tab
    const privacyTab = screen.getByText("settings.privacy");
    await user.click(privacyTab);

    // Should show privacy settings
    expect(screen.getByText("settings.apiKeyStorage")).toBeInTheDocument();
    expect(screen.getByText("settings.dataManagement")).toBeInTheDocument();
    expect(
      screen.getByText("settings.dataSecurityDescription1"),
    ).toBeInTheDocument();
  });

  it("switches to about tab when clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Click on About tab
    const aboutTab = screen.getByText("settings.about");
    await user.click(aboutTab);

    // Should show about section
    expect(screen.getByText("Quorum")).toBeInTheDocument();
    expect(
      screen.getByText("A round-table conversation with AI participants"),
    ).toBeInTheDocument();
  });

  it("calls updatePreferences when changing key storage preference", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Go to privacy tab
    const privacyTab = screen.getByText("settings.privacy");
    await user.click(privacyTab);

    // Get the session storage radio input by its ID
    const sessionRadio =
      screen.getByLabelText("settings.sessionOnly", { exact: false }) ||
      document.getElementById("sessionOnly");

    // Click the radio button if found
    if (sessionRadio) {
      await user.click(sessionRadio);

      // Check that updatePreferences was called with correct params
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        keyStoragePreference: "session",
      });
    }
  });

  it("calls setWizardCompleted when restarting wizard", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Go to privacy tab to find the restart wizard button
    const privacyTab = screen.getByText("settings.privacy");
    await user.click(privacyTab);

    // Find the restart wizard button
    const restartButton = screen.getByText("settings.restartWizard");
    await user.click(restartButton);

    // Check that setWizardCompleted was called
    expect(mockSetWizardCompleted).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("calls resetPreferences and clears localStorage when clearing data", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Go to privacy tab
    const privacyTab = screen.getByText("settings.privacy");
    await user.click(privacyTab);

    // Find and click the clear data button
    const clearDataButton = screen.getByText("settings.clearAllData");
    await user.click(clearDataButton);

    // Check that localStorage.clear and resetPreferences were called
    expect(localStorageMock.clear).toHaveBeenCalled();
    expect(mockResetPreferences).toHaveBeenCalled();
  });
});
