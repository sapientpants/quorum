import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppLayout } from "../AppLayout";

// Mock the dependencies
vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

vi.mock("../../NetworkStatusIndicator", () => ({
  NetworkStatusIndicator: () => (
    <div data-testid="network-status">Network Status</div>
  ),
}));

vi.mock("../../ApiErrorModal", () => ({
  ApiErrorModal: () => <div data-testid="api-error-modal">API Error Modal</div>,
}));

vi.mock("../../TopBar", () => ({
  TopBar: () => <div data-testid="top-bar">Top Bar</div>,
}));

describe("AppLayout", () => {
  it("renders all components correctly", () => {
    render(<AppLayout />);

    // Check that all child components are rendered
    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(screen.getByTestId("network-status")).toBeInTheDocument();
    expect(screen.getByTestId("api-error-modal")).toBeInTheDocument();
  });

  it("has the correct layout structure", () => {
    render(<AppLayout />);

    // Check the main container has the correct classes
    const container = screen.getByTestId("top-bar").parentElement;
    expect(container).toHaveClass(
      "flex",
      "flex-col",
      "min-h-screen",
      "bg-background",
    );

    // Check that the main content area has flex-1 class
    const mainContent = screen.getByTestId("outlet").parentElement;
    expect(mainContent).toHaveClass("flex-1");
  });
});
