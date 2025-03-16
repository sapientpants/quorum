import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

// Mock the withTranslation HOC from react-i18next directly in this file
vi.mock("react-i18next", () => ({
  withTranslation:
    () => (Component: React.ComponentType<{ t: (key: string) => string }>) => {
      Component.displayName = `withTranslation(${Component.displayName || Component.name || "Component"})`;
      const TranslatedComponent = (props: Record<string, unknown>) => {
        return (
          <Component
            {...props}
            t={(key: string) =>
              key === "errorBoundary.title"
                ? "Something went wrong"
                : "Unknown error"
            }
          />
        );
      };
      return TranslatedComponent;
    },
}));

// A component that throws an error on purpose
const BuggyComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Working component</div>;
};

describe("ErrorBoundary", () => {
  // Create a custom console.error mock to prevent test output pollution
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders default fallback UI when an error occurs", () => {
    // Error boundary catches the error and renders fallback
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom error state</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error state")).toBeInTheDocument();
  });

  it("calls onError when an error occurs", () => {
    const handleError = vi.fn();

    render(
      <ErrorBoundary onError={handleError}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(handleError.mock.calls[0][0].message).toBe("Test error");
  });

  it("logs the error to console.error", () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });

  // This test is skipped because it's not compatible with React 18+
  it.skip("recovers when the error is resolved", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Rerender with fixed component
    rerender(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    // This doesn't actually work in React 18+ as error boundaries don't recover
    // from errors in children dynamically, but we test it for completeness
    expect(screen.getByText("Working component")).toBeInTheDocument();
  });
});
