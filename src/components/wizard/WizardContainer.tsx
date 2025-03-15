import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreferencesStore } from '../../store/preferencesStore'
import { SecurityStep } from './SecurityStep'
import { ApiKeyStep } from './ApiKeyStep'
import { ParticipantConfigStep } from './ParticipantConfigStep'
import { WizardProgress } from './WizardProgress'
import { WizardNavigation } from './WizardNavigation'
import { TopBar } from '../TopBar'

export function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0)
  const { setWizardCompleted } = usePreferencesStore()
  const navigate = useNavigate()
  const steps = ['security', 'api-keys', 'participants']
  
  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete wizard
      setWizardCompleted(true)
      // Redirect to main app
      navigate('/chat')
    }
  }
  
  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <WizardProgress currentStep={currentStep} totalSteps={steps.length} />
        
        <div className="mt-8 bg-card p-6 rounded-lg shadow-sm border border-border flex-1">
          {/* Render current step */}
          {currentStep === 0 && <SecurityStep onNext={handleNext} onBack={handleBack} />}
          {currentStep === 1 && <ApiKeyStep onNext={handleNext} onBack={handleBack} />}
          {currentStep === 2 && <ParticipantConfigStep onNext={handleNext} onBack={handleBack} />}
        </div>
        
        <div className="mt-6">
          <WizardNavigation 
            currentStep={currentStep} 
            totalSteps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      </main>
    </div>
  )
}

export default WizardContainer
