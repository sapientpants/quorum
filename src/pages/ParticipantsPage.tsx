import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { ParticipantConfigStep } from '../components/wizard/ParticipantConfigStep'
import { WizardProgress } from '../components/wizard/WizardProgress'
import { usePreferencesStore } from '../store/preferencesStore'

export function ParticipantsPage() {
  const navigate = useNavigate()
  const { setWizardStep, setWizardCompleted } = usePreferencesStore()
  
  // Set the current wizard step
  useEffect(() => {
    setWizardStep(2)
  }, [setWizardStep])
  
  function handleNext() {
    // Complete the wizard and navigate to the roundtable
    setWizardCompleted(true)
    navigate('/roundtable')
  }
  
  function handleBack() {
    // Navigate back to the API keys page
    navigate('/apiKeys')
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <WizardProgress currentStep={2} totalSteps={3} />
        
        <div className="mt-8">
          <ParticipantConfigStep onNext={handleNext} onBack={handleBack} />
        </div>
      </main>
    </div>
  )
}

export default ParticipantsPage
