import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { SecurityStep } from "../components/wizard/SecurityStep";
import { WizardProgress } from "../components/wizard/WizardProgress";
import { usePreferencesStore } from "../store/preferencesStore";

export function SecurityPage() {
  const navigate = useNavigate();
  const { setWizardStep } = usePreferencesStore();

  // Set the current wizard step
  useEffect(() => {
    setWizardStep(0);
  }, [setWizardStep]);

  function handleNext() {
    // Update the wizard step and navigate to the next step
    console.log("SecurityPage: handleNext called");
    setWizardStep(1);
    navigate("/apiKeys");
  }

  function handleBack() {
    // Navigate back to the welcome page
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <WizardProgress currentStep={0} totalSteps={3} />

        <div className="mt-8">
          <SecurityStep onNext={handleNext} onBack={handleBack} />
        </div>
      </main>
    </div>
  );
}
