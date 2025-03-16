import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ParticipantsPage } from "../ParticipantsPage";
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

vi.mock("../../components/wizard/ParticipantConfigStep", () => ({
  ParticipantConfigStep: ({
    onNext,
    onBack,
  }: {
    onNext: () => void;
    onBack: () => void;
  }) => (
    <div data-testid="participant-config-step">
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}));

describe("ParticipantsPage", () => {
  const mockNavigate = vi.fn();
  const mockSetWizardStep = vi.fn();
  const mockSetWizardCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up the mocks
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(usePreferencesStore).mockReturnValue({
      setWizardStep: mockSetWizardStep,
      setWizardCompleted: mockSetWizardCompleted,
      // Add other properties as needed
      preferences: { theme: "light" },
      wizardStep: 2,
    } as unknown as ReturnType<typeof usePreferencesStore>);
  });

  it("renders the page with correct components", () => {
    render(<ParticipantsPage />);

    // Check that the components are rendered
    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("wizard-progress")).toBeInTheDocument();
    expect(screen.getByTestId("participant-config-step")).toBeInTheDocument();

    // Check that the wizard progress shows the correct step
    expect(screen.getByTestId("wizard-progress")).toHaveTextContent(
      "Step 2 of 3",
    );
  });

  it("sets the wizard step on mount", () => {
    render(<ParticipantsPage />);

    // Check that setWizardStep was called with the correct step
    expect(mockSetWizardStep).toHaveBeenCalledWith(2);
  });

  it("completes the wizard and navigates to the roundtable when Next is clicked", () => {
    render(<ParticipantsPage />);

    // Click the Next button
    fireEvent.click(screen.getByTestId("next-button"));

    // Check that setWizardCompleted was called with true
    expect(mockSetWizardCompleted).toHaveBeenCalledWith(true);

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/roundtable");
  });

  it("navigates to the previous page when Back is clicked", () => {
    render(<ParticipantsPage />);

    // Click the Back button
    fireEvent.click(screen.getByTestId("back-button"));

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/apiKeys");
  });
});
