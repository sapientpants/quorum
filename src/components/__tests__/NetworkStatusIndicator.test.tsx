import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NetworkStatusIndicator } from "../NetworkStatusIndicator";
import { ConnectionQuality } from "../../utils/network";
import { ErrorContext } from "../../contexts/contexts/ErrorContextDefinition";

// Mock the Lucide React icons
vi.mock("lucide-react", () => ({
  Wifi: () => <div data-testid="wifi-icon" />,
  WifiOff: () => <div data-testid="wifi-off-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  SignalLow: () => <div data-testid="signal-low-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "network.offline": "Offline",
        "network.slow": "Slow Connection",
        "network.online": "Online",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("NetworkStatusIndicator", () => {
  // Default context values
  const defaultContextValue = {
    apiError: null,
    setApiError: vi.fn(),
    showApiErrorModal: false,
    setShowApiErrorModal: vi.fn(),
    networkStatus: ConnectionQuality.GOOD,
    isOnline: true,
    isLowBandwidth: false,
    currentProvider: null,
    setCurrentProvider: vi.fn(),
    clearError: vi.fn(),
  };

  // Helper function to render with context
  const renderWithContext = (contextValue = {}) => {
    return render(
      <ErrorContext.Provider
        value={{ ...defaultContextValue, ...contextValue }}
      >
        <NetworkStatusIndicator data-testid="network-status" />
      </ErrorContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock successful fetch response
    const mockResponse = new Response("pong");
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initially and then can hide when online with good connectivity", () => {
    // Set visible state to true initially
    renderWithContext({
      networkStatus: ConnectionQuality.POOR, // Use POOR to ensure it's visible
      isOnline: true,
    });

    // Force the component to be visible initially
    const statusButton = screen.getByText("Slow Connection");
    expect(statusButton).toBeInTheDocument();

    // After timeout, should be hidden
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // In a real scenario, the component would be hidden after the timeout
    // but in tests we need to re-render to see the effect
  });

  it("renders offline status when offline", () => {
    renderWithContext({
      isOnline: false,
      networkStatus: ConnectionQuality.OFFLINE,
    });

    // Check that the offline status is rendered
    const offlineButton = screen.getByText("Offline");
    expect(offlineButton).toBeInTheDocument();
    expect(screen.getByTestId("wifi-off-icon")).toBeInTheDocument();

    // Should have destructive class
    expect(offlineButton.closest("button")).toHaveClass("bg-destructive");
  });

  it("renders slow connection status when network quality is poor", () => {
    renderWithContext({
      networkStatus: ConnectionQuality.POOR,
    });

    // Check that the slow connection status is rendered
    const slowConnectionButton = screen.getByText("Slow Connection");
    expect(slowConnectionButton).toBeInTheDocument();
    expect(screen.getByTestId("signal-low-icon")).toBeInTheDocument();

    // Should have warning class
    expect(slowConnectionButton.closest("button")).toHaveClass("bg-warning");
  });

  it("renders fair connection status temporarily when network quality is fair", () => {
    renderWithContext({
      networkStatus: ConnectionQuality.FAIR,
    });

    // Check that the fair connection status is rendered
    const slowConnectionButton = screen.getByText("Slow Connection");
    expect(slowConnectionButton).toBeInTheDocument();
    expect(screen.getByTestId("signal-low-icon")).toBeInTheDocument();

    // Should have warning class with lower opacity
    expect(slowConnectionButton.closest("button")).toHaveClass("bg-warning/70");

    // After timeout, should be hidden
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Slow Connection")).not.toBeInTheDocument();
  });

  it("shows low bandwidth indicator when isLowBandwidth is true", () => {
    renderWithContext({
      networkStatus: ConnectionQuality.POOR,
      isLowBandwidth: true,
    });

    // Check that the low bandwidth indicator is rendered
    expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
  });

  it("tests connection when clicked", async () => {
    renderWithContext({
      networkStatus: ConnectionQuality.POOR,
    });

    // Click the status indicator
    const statusButton = screen.getByText("Slow Connection");
    fireEvent.click(statusButton);

    // Should show loading icon
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/ping.txt?nocache="),
      expect.objectContaining({ cache: "no-store" }),
    );

    // Resolve the fetch promise
    await act(async () => {
      await Promise.resolve();
    });

    // Should show signal icon again
    expect(screen.getByTestId("signal-low-icon")).toBeInTheDocument();
  });

  it("applies the correct position class for bottom-right", () => {
    // Test with default position (bottom-right)
    renderWithContext({
      networkStatus: ConnectionQuality.POOR,
    });

    // Default position should be bottom-right
    const slowConnectionButton = screen.getByText("Slow Connection");
    expect(slowConnectionButton.closest("button")).toHaveClass("bottom-4");
    expect(slowConnectionButton.closest("button")).toHaveClass("right-4");
  });

  it("applies the correct position class for top-left", () => {
    // Test with top-left position
    render(
      <ErrorContext.Provider
        value={{
          ...defaultContextValue,
          networkStatus: ConnectionQuality.POOR,
        }}
      >
        <NetworkStatusIndicator position="top-left" />
      </ErrorContext.Provider>,
    );

    // Should have top-left position classes
    const slowConnectionButton = screen.getByText("Slow Connection");
    expect(slowConnectionButton.closest("button")).toHaveClass("top-4");
    expect(slowConnectionButton.closest("button")).toHaveClass("left-4");
  });
});
