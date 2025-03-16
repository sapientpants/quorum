import { useTranslation } from "react-i18next";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({
  currentStep,
  totalSteps,
}: WizardProgressProps) {
  const { t } = useTranslation();
  const stepLabels = [
    t("wizard.steps.security", "Security"),
    t("wizard.steps.apiKeys", "API Keys"),
    t("wizard.steps.participants", "Participants"),
  ];

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
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
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
              {stepLabels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
