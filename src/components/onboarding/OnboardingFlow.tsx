import { useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import ConsentModal from './ConsentModal'
import ApiKeySetupScreen from './ApiKeySetupScreen'

function OnboardingFlow () {
  const [step, setStep] = useState<'welcome' | 'consent' | 'apikey'>('welcome')

  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => setStep('consent')} />
  if (step === 'consent') return <ConsentModal onCancel={() => setStep('welcome')} onContinue={() => setStep('apikey')} />
  if (step === 'apikey') return <ApiKeySetupScreen />

  return null
}

export default OnboardingFlow 