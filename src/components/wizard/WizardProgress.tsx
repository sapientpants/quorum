import { useTranslation } from "react-i18next";

interface WizardProgressProps{
  readonly currentStep: number;
  readonly totalSteps: number;
}

export function WizardProgress({
  currentStep,
  totalSteps,
}: WizardProgressProps) {
  const { t } = useTranslation();
  // Define all possible step labels
  const allStepLabels = [
    t("wizard.steps.security", "Security"),
    t("wizard.steps.apiKeys", "API Keys"),
    t("wizard.steps.participants", "Participants"),
    t("wizard.steps.confirmation", "Confirmation"),
  ];

  // Use only the number of steps needed based on totalSteps
  const stepLabels = allStepLabels.slice(0, totalSteps);

  return (
    <div className="wizard-progress">
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, index) => (
          <div key={`step-${label}`} className="flex flex-col items-center">
            <div
              className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                index <= currentStep
                  ? "bg-gradient-to-r from-purple-500 to-blue-500"
                  : "bg-muted"
              }`}
            />
            <span
              className={`text-xs mt-1 transition-colors duration-300 ${
                index <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
