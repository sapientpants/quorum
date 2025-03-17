import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConsentModal from "../ConsentModal";

describe("ConsentModal", () => {
  const mockProps = {
    onCancel: vi.fn(),
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal with title and content", () => {
    render(<ConsentModal {...mockProps} />);

    expect(screen.getByText("API Keys & Privacy Notice")).toBeInTheDocument();
    expect(
      screen.getByText(/Please review our privacy policies/),
    ).toBeInTheDocument();
  });

  it("renders storage options with local storage selected by default", () => {
    render(<ConsentModal {...mockProps} />);

    const localStorageRadio = screen.getByLabelText(
      "Local Storage",
    ) as HTMLInputElement;
    const sessionStorageRadio = screen.getByLabelText(
      "Session Storage",
    ) as HTMLInputElement;
    const noStorageRadio = screen.getByLabelText(
      "No Storage",
    ) as HTMLInputElement;

    expect(localStorageRadio.checked).toBe(true);
    expect(sessionStorageRadio.checked).toBe(false);
    expect(noStorageRadio.checked).toBe(false);
  });

  it("allows changing storage option", () => {
    render(<ConsentModal {...mockProps} />);

    const sessionStorageRadio = screen.getByLabelText(
      "Session Storage",
    ) as HTMLInputElement;
    fireEvent.click(sessionStorageRadio);

    expect(sessionStorageRadio.checked).toBe(true);
    expect(
      (screen.getByLabelText("Local Storage") as HTMLInputElement).checked,
    ).toBe(false);
  });

  it("renders confirmation checkbox unchecked by default", () => {
    render(<ConsentModal {...mockProps} />);

    const checkbox = screen.getByLabelText(
      /I acknowledge and agree/,
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("disables continue button when checkbox is unchecked", () => {
    render(<ConsentModal {...mockProps} />);

    const continueButton = screen.getByText("Continue");
    expect(continueButton).toBeDisabled();
  });

  it("enables continue button when checkbox is checked", () => {
    render(<ConsentModal {...mockProps} />);

    const checkbox = screen.getByLabelText(
      /I acknowledge and agree/,
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    const continueButton = screen.getByText("Continue");
    expect(continueButton).not.toBeDisabled();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<ConsentModal {...mockProps} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onContinue when continue button is clicked and checkbox is checked", () => {
    render(<ConsentModal {...mockProps} />);

    // Check the checkbox first
    const checkbox = screen.getByLabelText(
      /I acknowledge and agree/,
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Then click continue
    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    expect(mockProps.onContinue).toHaveBeenCalledTimes(1);
  });

  it("applies the correct styling to buttons", () => {
    render(<ConsentModal {...mockProps} />);

    const cancelButton = screen.getByText("Cancel");
    const continueButton = screen.getByText("Continue");

    expect(cancelButton).toHaveClass("bg-gray-300");
    expect(continueButton).toHaveClass("bg-gray-400"); // Disabled state

    // Check the checkbox to enable the continue button
    const checkbox = screen.getByLabelText(
      /I acknowledge and agree/,
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Re-query the continue button as its classes may have changed
    const enabledContinueButton = screen.getByText("Continue");
    expect(enabledContinueButton).toHaveClass("bg-gradient-to-r");
    expect(enabledContinueButton).toHaveClass("from-blue-500");
    expect(enabledContinueButton).toHaveClass("to-green-500");
  });
});
