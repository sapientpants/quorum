import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApiKeyStep } from "../ApiKeyStep";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "wizard.apiKeys.title": "Add API Keys",
        "wizard.apiKeys.description":
          "Add your API keys to use the application",
        "wizard.navigation.back": "Back",
        "wizard.navigation.next": "Next",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("../../../store/preferencesStore", () => ({
  usePreferencesStore: () => ({
    preferences: {
      keyStoragePreference: "session",
    },
  }),
}));

vi.mock("../../ApiKeyManager", () => ({
  default: vi.fn(({ onApiKeyChange, storageOption }) => (
    <div data-testid="api-key-manager">
      <button
        data-testid="add-openai-key"
        onClick={() => onApiKeyChange("openai", "test-key")}
      >
        Add OpenAI Key
      </button>
      <button
        data-testid="remove-openai-key"
        onClick={() => onApiKeyChange("openai", "")}
      >
        Remove OpenAI Key
      </button>
      <div data-testid="storage-option">{storageOption.storage}</div>
    </div>
  )),
}));

vi.mock("@iconify/react", () => ({
  Icon: vi.fn(({ icon, className }) => (
    <span data-testid="icon" data-icon={icon} className={className}>
      Icon
    </span>
  )),
}));

describe("ApiKeyStep", () => {
  const onNext = vi.fn();
  const onBack = vi.fn();

  // Mock localStorage and sessionStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    Object.defineProperty(window, "sessionStorage", {
      value: sessionStorageMock,
    });

    // Clear mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the component with title and description", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    expect(screen.getByText("Add API Keys")).toBeInTheDocument();
    expect(
      screen.getByText("Add your API keys to use the application"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("api-key-manager")).toBeInTheDocument();
  });

  it("shows warning when no API keys are present", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    expect(screen.getByText(/wizard.apiKeys.noKeyWarning/)).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("disables next button when no API keys are present", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it("enables next button when API key is added", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    // Initially next button should be disabled
    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();

    // Add an API key
    fireEvent.click(screen.getByTestId("add-openai-key"));

    // Now next button should be enabled
    expect(nextButton).not.toBeDisabled();
  });

  it("stores API key in sessionStorage when preference is session", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    // Add an API key
    fireEvent.click(screen.getByTestId("add-openai-key"));

    // Check that key was stored in sessionStorage
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      "openai_api_key",
      "test-key",
    );
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("removes API key from storage when key is removed", () => {
    // Setup: Add a key first
    sessionStorageMock.setItem("openai_api_key", "test-key");

    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    // Remove the API key
    fireEvent.click(screen.getByTestId("remove-openai-key"));

    // Check that key was removed from sessionStorage
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
      "openai_api_key",
    );
  });

  it("calls onBack when back button is clicked", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    fireEvent.click(screen.getByText("Back"));

    expect(onBack).toHaveBeenCalled();
  });

  it("calls onNext when next button is clicked and API key is present", () => {
    // Setup: Add a key first
    sessionStorageMock.setItem("openai_api_key", "test-key");

    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    fireEvent.click(screen.getByText("Next"));

    expect(onNext).toHaveBeenCalled();
  });

  it("passes correct storage option to ApiKeyManager", () => {
    render(<ApiKeyStep onNext={onNext} onBack={onBack} />);

    expect(screen.getByTestId("storage-option")).toHaveTextContent("session");
  });
});
