import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { ApiKeyStep } from "../components/wizard/ApiKeyStep";
import { WizardProgress } from "../components/wizard/WizardProgress";
import { usePreferencesStore } from "../store/preferencesStore";

export function ApiKeysPage() {
  const navigate = useNavigate();
  const { setWizardStep } = usePreferencesStore();

  // Set the current wizard step
  useEffect(() => {
    setWizardStep(1);
  }, [setWizardStep]);

  function handleNext() {
    // Update the wizard step and navigate to the next step
    setWizardStep(2);
    navigate("/participants");
  }

  function handleBack() {
    // Navigate back to the security page
    navigate("/security");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <WizardProgress currentStep={1} totalSteps={3} />

        <div className="mt-8">
          <ApiKeyStep onNext={handleNext} onBack={handleBack} />
        </div>
      </main>
    </div>
  );
}
