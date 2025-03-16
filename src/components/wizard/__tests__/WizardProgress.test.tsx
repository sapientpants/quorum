import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WizardProgress } from "../WizardProgress";

// Mock the useTranslation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe("WizardProgress", () => {
  it("renders with correct number of steps", () => {
    render(<WizardProgress currentStep={0} totalSteps={3} />);

    // Check that we have 3 step indicators
    const stepIndicators = screen.getAllByText(
      /Security|API Keys|Participants/,
    );
    expect(stepIndicators).toHaveLength(3);
    expect(stepIndicators[0]).toHaveTextContent("Security");
    expect(stepIndicators[1]).toHaveTextContent("API Keys");
    expect(stepIndicators[2]).toHaveTextContent("Participants");
  });

  it("highlights the current step and previous steps", () => {
    const { rerender } = render(
      <WizardProgress currentStep={0} totalSteps={3} />,
    );

    // Get all step dots
    const stepDots = document.querySelectorAll(".w-4.h-4.rounded-full");
    expect(stepDots).toHaveLength(3);

    // At step 0, only the first dot should be highlighted
    expect(stepDots[0]).toHaveClass("bg-gradient-to-r");
    expect(stepDots[1]).toHaveClass("bg-muted");
    expect(stepDots[2]).toHaveClass("bg-muted");

    // Get all step labels
    const stepLabels = screen.getAllByText(/Security|API Keys|Participants/);
    expect(stepLabels[0]).toHaveClass("text-foreground");
    expect(stepLabels[1]).toHaveClass("text-muted-foreground");
    expect(stepLabels[2]).toHaveClass("text-muted-foreground");

    // Rerender with currentStep = 1
    rerender(<WizardProgress currentStep={1} totalSteps={3} />);

    // Now the first and second dots should be highlighted
    expect(stepDots[0]).toHaveClass("bg-gradient-to-r");
    expect(stepDots[1]).toHaveClass("bg-gradient-to-r");
    expect(stepDots[2]).toHaveClass("bg-muted");

    // And the first and second labels should be highlighted
    expect(stepLabels[0]).toHaveClass("text-foreground");
    expect(stepLabels[1]).toHaveClass("text-foreground");
    expect(stepLabels[2]).toHaveClass("text-muted-foreground");
  });

  it("sets the progress bar width correctly", () => {
    const { rerender } = render(
      <WizardProgress currentStep={0} totalSteps={3} />,
    );

    // Get the progress bar
    const progressBar = document.querySelector(
      ".bg-gradient-to-r.from-purple-500.to-blue-500.transition-all",
    );
    expect(progressBar).toBeInTheDocument();

    // At step 0, progress should be 0%
    expect(progressBar).toHaveStyle("width: 0%");

    // Rerender with currentStep = 1
    rerender(<WizardProgress currentStep={1} totalSteps={3} />);

    // At step 1, progress should be 50%
    expect(progressBar).toHaveStyle("width: 50%");

    // Rerender with currentStep = 2
    rerender(<WizardProgress currentStep={2} totalSteps={3} />);

    // At step 2, progress should be 100%
    expect(progressBar).toHaveStyle("width: 100%");
  });

  it("handles different total steps", () => {
    render(<WizardProgress currentStep={1} totalSteps={4} />);

    // Should have 4 step indicators
    const stepDots = document.querySelectorAll(".w-4.h-4.rounded-full");
    expect(stepDots).toHaveLength(4);

    // Progress should be 33.33% (1/3)
    const progressBar = document.querySelector(
      ".bg-gradient-to-r.from-purple-500.to-blue-500.transition-all",
    );

    // Get the actual width style
    const style = window.getComputedStyle(progressBar as Element);
    const width = style.getPropertyValue("width");

    // Check that it's approximately 33.33%
    expect(parseFloat(width)).toBeCloseTo(33.33, 1);
  });
});
