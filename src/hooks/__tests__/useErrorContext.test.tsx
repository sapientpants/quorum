import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useError } from "../useErrorContext";
import { ErrorContext } from "../../contexts/contexts/ErrorContextDefinition";
import { ReactNode } from "react";
import { ConnectionQuality } from "../../utils/network";

// Mock wrapper component
function Wrapper({ children }: { children: ReactNode }) {
  const mockErrorContext = {
    apiError: null,
    setApiError: vi.fn(),
    showApiErrorModal: false,
    setShowApiErrorModal: vi.fn(),
    networkStatus: ConnectionQuality.GOOD,
    isOnline: true,
    isLowBandwidth: false,
    currentProvider: "openai",
    setCurrentProvider: vi.fn(),
    clearError: vi.fn(),
  };

  return (
    <ErrorContext.Provider value={mockErrorContext}>
      {children}
    </ErrorContext.Provider>
  );
}

// Mock wrapper without context
function EmptyWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

describe("useErrorContext", () => {
  it("returns the error context when used within an ErrorProvider", () => {
    const { result } = renderHook(() => useError(), {
      wrapper: Wrapper,
    });

    // Check that the hook returns the context
    expect(result.current).toBeDefined();
    expect(result.current.apiError).toBeNull();
    expect(result.current.networkStatus).toBe(ConnectionQuality.GOOD);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isLowBandwidth).toBe(false);
    expect(result.current.currentProvider).toBe("openai");
    expect(typeof result.current.setApiError).toBe("function");
    expect(typeof result.current.setShowApiErrorModal).toBe("function");
    expect(typeof result.current.setCurrentProvider).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("throws an error when used outside of an ErrorProvider", () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect the hook to throw an error
    expect(() => {
      renderHook(() => useError(), {
        wrapper: EmptyWrapper,
      });
    }).toThrow("useError must be used within an ErrorProvider");

    // Restore console.error
    console.error = originalConsoleError;
  });
});
