import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecurityPage } from "../SecurityPage";
import { useNavigate } from "react-router-dom";
import { usePreferencesStore } from "../../store/preferencesStore";

// Mock the dependencies
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../../store/preferencesStore", () => ({
  usePreferencesStore: vi.fn(),
}));

vi.mock("../../components/TopBar", () => ({
  TopBar: () => <div data-testid="top-bar">Top Bar</div>,
}));

vi.mock("../../components/wizard/WizardProgress", () => ({
  WizardProgress: ({
    currentStep,
    totalSteps,
  }: {
    currentStep: number;
    totalSteps: number;
  }) => (
    <div data-testid="wizard-progress">
      Step {currentStep} of {totalSteps}
    </div>
  ),
}));

vi.mock("../../components/wizard/SecurityStep", () => ({
  SecurityStep: ({
    onNext,
    onBack,
  }: {
    onNext: () => void;
    onBack: () => void;
  }) => (
    <div data-testid="security-step">
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}));

// Mock console.log to prevent it from cluttering the test output
vi.spyOn(console, "log").mockImplementation(() => {});

describe("SecurityPage", () => {
  const mockNavigate = vi.fn();
  const mockSetWizardStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up the mocks
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(usePreferencesStore).mockReturnValue({
      setWizardStep: mockSetWizardStep,
      // Add other properties as needed
      preferences: { theme: "light" },
      wizardStep: 0,
    } as unknown as ReturnType<typeof usePreferencesStore>);
  });

  it("renders the page with correct components", () => {
    render(<SecurityPage />);

    // Check that the components are rendered
    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("wizard-progress")).toBeInTheDocument();
    expect(screen.getByTestId("security-step")).toBeInTheDocument();

    // Check that the wizard progress shows the correct step
    expect(screen.getByTestId("wizard-progress")).toHaveTextContent(
      "Step 0 of 3",
    );
  });

  it("sets the wizard step on mount", () => {
    render(<SecurityPage />);

    // Check that setWizardStep was called with the correct step
    expect(mockSetWizardStep).toHaveBeenCalledWith(0);
  });

  it("navigates to the next page when Next is clicked", () => {
    render(<SecurityPage />);

    // Click the Next button
    fireEvent.click(screen.getByTestId("next-button"));

    // Check that setWizardStep was called with the correct step
    expect(mockSetWizardStep).toHaveBeenCalledWith(1);

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/apiKeys");

    // Check that console.log was called with the correct message
    expect(console.log).toHaveBeenCalledWith("SecurityPage: handleNext called");
  });

  it("navigates to the previous page when Back is clicked", () => {
    render(<SecurityPage />);

    // Click the Back button
    fireEvent.click(screen.getByTestId("back-button"));

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
