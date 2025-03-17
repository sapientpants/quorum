import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextDisabled = false,
}: WizardNavigationProps) {
  const { t } = useTranslation();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
        {t("wizard.navigation.back")}
      </Button>

      <Button
        onClick={onNext}
        variant="default"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={nextDisabled}
      >
        {isLastStep
          ? t("wizard.navigation.complete")
          : t("wizard.navigation.next")}
      </Button>
    </div>
  );
}
