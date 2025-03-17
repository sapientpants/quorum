import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApiKeyConsentModal } from "../ApiKeyConsentModal";

describe("ApiKeyConsentModal", () => {
  const onContinueMock = vi.fn();
  const onCancelMock = vi.fn();

  const defaultProps = {
    onContinue: onContinueMock,
    onCancel: onCancelMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default values", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    // Check title and description
    expect(screen.getByText("API Key Storage Consent")).toBeInTheDocument();
    expect(
      screen.getByText(/Before you enter your API key/),
    ).toBeInTheDocument();

    // Check storage options
    expect(screen.getByText("Local Storage")).toBeInTheDocument();
    expect(screen.getByText("Session Storage")).toBeInTheDocument();
    expect(screen.getByText("No Storage")).toBeInTheDocument();

    // Check session storage is selected by default
    const sessionRadioInput = screen.getByRole("radio", { checked: true });
    expect(sessionRadioInput).toBeInTheDocument();
    expect(sessionRadioInput.parentElement?.textContent).toContain(
      "Session Storage",
    );

    // Check consent checkbox with the actual text
    expect(
      screen.getByText(/I understand and consent to the storage of my API key/),
    ).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();

    // Continue button should be disabled by default (checkbox not checked)
    expect(screen.getByText("Continue")).toBeDisabled();
  });

  it("enables continue button when consent checkbox is checked", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    // Continue button should be disabled initially
    expect(screen.getByText("Continue")).toBeDisabled();

    // Check the consent checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Continue button should now be enabled
    expect(screen.getByText("Continue")).not.toBeDisabled();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(onCancelMock).toHaveBeenCalledTimes(1);
    expect(onContinueMock).not.toHaveBeenCalled();
  });

  it("calls onContinue with session storage when continue is clicked with default selection", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    // Check the consent checkbox to enable the continue button
    fireEvent.click(screen.getByRole("checkbox"));

    // Click continue
    fireEvent.click(screen.getByText("Continue"));

    // Should call onContinue with 'session'
    expect(onContinueMock).toHaveBeenCalledTimes(1);
    expect(onContinueMock).toHaveBeenCalledWith("session");
    expect(onCancelMock).not.toHaveBeenCalled();
  });

  it("calls onContinue with local storage when selected", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    // Find all radio inputs
    const radioInputs = screen.getAllByRole("radio");

    // Find the Local Storage radio by its parent text content
    const localStorageRadio = Array.from(radioInputs).find((radio) =>
      radio.parentElement?.textContent?.includes("Local Storage"),
    );

    // Select local storage
    if (localStorageRadio) {
      fireEvent.click(localStorageRadio);
    }

    // Check the consent checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Click continue
    fireEvent.click(screen.getByText("Continue"));

    // Should call onContinue with 'local'
    expect(onContinueMock).toHaveBeenCalledTimes(1);
    expect(onContinueMock).toHaveBeenCalledWith("local");
  });

  it("calls onContinue with no storage when selected", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    // Find all radio inputs
    const radioInputs = screen.getAllByRole("radio");

    // Find the No Storage radio by its parent text content
    const noStorageRadio = Array.from(radioInputs).find((radio) =>
      radio.parentElement?.textContent?.includes("No Storage"),
    );

    // Select no storage
    if (noStorageRadio) {
      fireEvent.click(noStorageRadio);
    }

    // Check the consent checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Click continue
    fireEvent.click(screen.getByText("Continue"));

    // Should call onContinue with 'none'
    expect(onContinueMock).toHaveBeenCalledTimes(1);
    expect(onContinueMock).toHaveBeenCalledWith("none");
  });

  it("does not call onContinue when checkbox is not checked", () => {
    render(<ApiKeyConsentModal {...defaultProps} />);

    // Try to click continue (should be disabled)
    const continueButton = screen.getByText("Continue");
    expect(continueButton).toBeDisabled();

    // Verify onContinue was not called
    expect(onContinueMock).not.toHaveBeenCalled();
  });
});
