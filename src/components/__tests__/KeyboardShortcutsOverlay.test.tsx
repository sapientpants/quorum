import { render, screen, fireEvent } from "@testing-library/react";
import { KeyboardShortcutsOverlay } from "../KeyboardShortcutsOverlay";

describe("KeyboardShortcutsOverlay", () => {
  beforeEach(() => {
    // Mock navigator.userAgent for consistent platform detection
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      writable: true,
    });
  });

  it("should not show the dialog by default", () => {
    render(<KeyboardShortcutsOverlay />);

    // Dialog should not be visible initially
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("should open when ? key is pressed", () => {
    render(<KeyboardShortcutsOverlay />);

    // Simulate pressing the ? key
    fireEvent.keyDown(document, { key: "?" });

    // Dialog should now be visible
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("should close when Escape key is pressed", () => {
    render(<KeyboardShortcutsOverlay />);

    // Open the dialog
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();

    // Close with Escape key
    fireEvent.keyDown(document, { key: "Escape" });

    // Dialog should be closed
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });
});
