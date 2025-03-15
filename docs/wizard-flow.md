# Wizard Flow Implementation Plan

## 1. Overview

The wizard flow is a guided setup process that helps users configure the application for use. It provides a structured, step-by-step approach to setting up the necessary components for using the application effectively.

### 1.1 Goals

- Guide users through the setup process
- Ensure all required configuration is completed before using the app
- Provide a seamless, intuitive experience with clear navigation
- Allow users to revisit the wizard if needed
- Prevent access to app features until setup is complete

### 1.2 User Experience

The wizard will present a series of steps that the user must complete in order. Each step will validate user input before allowing progression to the next step. The user can navigate back to previous steps to make changes. A progress indicator will show the user's position in the overall flow.

## 2. Current Implementation Analysis

### 2.1 Existing Components

The application already has several components that can be leveraged for the wizard flow:

- **Welcome Screen**: Exists but lacks proper integration with a wizard flow
- **API Key Setup**: Functional component for configuring API keys
- **Participant Configuration**: Existing page for setting up participants
- **Onboarding Components**: Some components exist in `src/components/onboarding/` but aren't properly integrated

### 2.2 Current Issues

The current implementation has several issues that need to be addressed:

- No clear flow between steps (direct navigation via URLs)
- Missing validation between steps
- No persistence of wizard completion state
- No way to restart the wizard from settings
- TopBar shows all navigation options even during initial setup
- Onboarding components exist but aren't properly integrated

### 2.3 Existing Code Review

- **OnboardingFlow.tsx**: Basic step management but incomplete
- **Welcome.tsx**: Contains some logic for directing users but not integrated with a proper wizard
- **ApiKeySetup.tsx**: Functional component but not integrated into a wizard flow
- **ParticipantConfigPage.tsx**: Exists but not adapted for the wizard context

## 3. Proposed Architecture

### 3.1 Component Structure

```
WizardContainer
├── WizardProgress
├── WizardNavigation
└── WizardSteps
    ├── WelcomeStep
    ├── SecurityStep
    ├── ApiKeyStep (includes provider selection)
    └── ParticipantConfigStep
```

### 3.2 State Management

We will extend the existing preferences store to track wizard state:

```typescript
// Add to UserPreferences interface
wizardCompleted: boolean
```

This will allow us to:
- Track whether the user has completed the wizard
- Reset the wizard when needed

### 3.3 Routing Strategy

We will implement routing at the root level:

```
/
/:step
```

The wizard container will handle routing internally, preventing direct URL navigation to steps that haven't been validated.

## 4. Implementation Details

### 4.1 Wizard Container

The WizardContainer will be the main component responsible for managing the wizard flow:

```typescript
function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0)
  const { preferences, updatePreferences } = usePreferencesStore()
  const steps = ['welcome', 'security', 'api-keys', 'participants']
  
  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete wizard
      updatePreferences({ 
        wizardCompleted: true
      })
      // Redirect to main app
      navigate('/chat')
    }
  }
  
  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  // Render current step
  return (
    <div className="wizard-container">
      <WizardProgress currentStep={currentStep} totalSteps={steps.length} />
      
      {/* Render current step */}
      {currentStep === 0 && <WelcomeStep onNext={handleNext} />}
      {currentStep === 1 && <SecurityStep onNext={handleNext} onBack={handleBack} />}
      {currentStep === 2 && <ApiKeyStep onNext={handleNext} onBack={handleBack} />}
      {currentStep === 3 && <ParticipantConfigStep onNext={handleNext} onBack={handleBack} />}
      
      <WizardNavigation 
        currentStep={currentStep} 
        totalSteps={steps.length}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  )
}
```

### 4.2 Wizard Steps

Each wizard step will be a separate component with consistent props:

```typescript
interface WizardStepProps {
  onNext: () => void
  onBack?: () => void
}
```

#### 4.2.1 WelcomeStep

```typescript
function WelcomeStep({ onNext }: WizardStepProps) {
  return (
    <div className="wizard-step">
      <h2>Welcome to Quorum</h2>
      <p>A round-table conversation with AI participants</p>
      
      {/* Feature highlights */}
      <ul>
        <li>Custom AI participants with different roles</li>
        <li>Multiple model providers</li>
        <li>Save and load conversation templates</li>
        <li>Analyze conversations</li>
      </ul>
      
      <Button onClick={onNext}>Get Started</Button>
    </div>
  )
}
```

#### 4.2.2 SecurityStep

```typescript
function SecurityStep({ onNext, onBack }: WizardStepProps) {
  const { preferences, updatePreferences } = usePreferencesStore()
  const [keyStoragePreference, setKeyStoragePreference] = useState<KeyStoragePreference>(
    preferences.keyStoragePreference || 'session'
  )
  
  function handleStorageChange(preference: KeyStoragePreference) {
    setKeyStoragePreference(preference)
  }
  
  function handleContinue() {
    updatePreferences({ keyStoragePreference })
    onNext()
  }
  
  return (
    <div className="wizard-step">
      <h2>Security Settings</h2>
      <p>Choose how you want to store your API keys</p>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input 
            type="radio" 
            id="localStorage" 
            name="keyStorage" 
            className="radio radio-primary" 
            checked={keyStoragePreference === 'local'}
            onChange={() => handleStorageChange('local')}
          />
          <label htmlFor="localStorage" className="flex flex-col">
            <span className="font-medium">Local Storage</span>
            <span className="text-sm opacity-70">
              Keys will be saved in your browser and persist between sessions
            </span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="radio" 
            id="sessionOnly" 
            name="keyStorage" 
            className="radio radio-primary" 
            checked={keyStoragePreference === 'session'}
            onChange={() => handleStorageChange('session')}
          />
          <label htmlFor="sessionOnly" className="flex flex-col">
            <span className="font-medium">Session Only</span>
            <span className="text-sm opacity-70">
              Keys will be saved only for this session and cleared when you close the browser
            </span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="radio" 
            id="noStorage" 
            name="keyStorage" 
            className="radio radio-primary" 
            checked={keyStoragePreference === 'none'}
            onChange={() => handleStorageChange('none')}
          />
          <label htmlFor="noStorage" className="flex flex-col">
            <span className="font-medium">No Storage</span>
            <span className="text-sm opacity-70">
              Keys will not be saved and must be re-entered each time
            </span>
          </label>
        </div>
      </div>
      
      <Button onClick={handleContinue}>
        Continue
      </Button>
    </div>
  )
}
```

#### 4.2.3 ApiKeyStep

```typescript
function ApiKeyStep({ onNext, onBack }: WizardStepProps) {
  const [hasValidKeys, setHasValidKeys] = useState(false)
  
  function handleApiKeysComplete() {
    setHasValidKeys(true)
  }
  
  return (
    <div className="wizard-step">
      <h2>API Key Setup</h2>
      <p>Configure your API keys for the AI providers you want to use</p>
      
      <ApiKeySetup onComplete={handleApiKeysComplete} />
      
      {/* Next button is enabled only when valid keys are provided */}
      <Button 
        onClick={onNext}
        disabled={!hasValidKeys}
      >
        Continue
      </Button>
    </div>
  )
}
```

#### 4.2.4 ParticipantConfigStep

```typescript
function ParticipantConfigStep({ onNext, onBack }: WizardStepProps) {
  const { participants } = useParticipantsStore()
  const [isAddingParticipant, setIsAddingParticipant] = useState(participants.length === 0)
  
  return (
    <div className="wizard-step">
      <h2>Configure Participants</h2>
      <p>Set up at least one AI participant for your conversations</p>
      
      {isAddingParticipant ? (
        <ParticipantForm 
          onSubmit={() => setIsAddingParticipant(false)}
          onCancel={() => setIsAddingParticipant(false)}
        />
      ) : (
        <>
          <ParticipantList />
          <Button onClick={() => setIsAddingParticipant(true)}>
            Add Participant
          </Button>
        </>
      )}
      
      <Button 
        onClick={onNext}
        disabled={participants.length === 0}
      >
        Complete Setup
      </Button>
    </div>
  )
}
```

### 4.3 Navigation and Progress Tracking

The wizard will include components for navigation and progress tracking:

```typescript
function WizardProgress({ currentStep, totalSteps }) {
  return (
    <div className="wizard-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      <div className="step-indicators">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`step-indicator ${index <= currentStep ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

function WizardNavigation({ currentStep, totalSteps, onNext, onBack }) {
  return (
    <div className="wizard-navigation">
      {currentStep > 0 && (
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      )}
      
      <Button onClick={onNext}>
        {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
      </Button>
    </div>
  )
}
```

### 4.4 Validation Logic

Each step will implement its own validation logic:

1. **SecurityStep**: No validation needed, just save the preference
2. **ApiKeyStep**: Validate that at least one valid API key is provided
3. **ParticipantConfigStep**: Validate that at least one participant is configured

### 4.5 Persistence Strategy

The wizard completion state will be persisted in the preferences store:

```typescript
// In preferencesStore.ts
interface PreferencesState {
  preferences: UserPreferences
  // ...existing properties
  
  // Add this property
  setWizardCompleted: (completed: boolean) => void
}

// In the store implementation
setWizardCompleted: (completed: boolean) =>
  set((state) => ({
    preferences: { ...state.preferences, wizardCompleted: completed }
  })),
```

## 5. Integration Points

### 5.1 App Integration

Update App.tsx to check for wizard completion and redirect accordingly:

```typescript
function App() {
  const { preferences } = usePreferencesStore()
  
  return (
    <ThemeProvider>
      <ErrorProvider>
        <LanguageProvider>
          <ChatProvider>
            <Router>
              <Routes>
                {/* Protected routes - redirect to wizard if not completed */}
                <Route
                  path="/*"
                  element={
                    preferences.wizardCompleted ? (
                      <AppLayout>
                        <AppRoutes />
                      </AppLayout>
                    ) : (
                      <WizardContainer />
                    )
                  }
                />
              </Routes>
              <Toaster />
            </Router>
          </ChatProvider>
        </LanguageProvider>
      </ErrorProvider>
    </ThemeProvider>
  )
}
```

### 5.2 Settings Integration

Add a wizard restart option to the Settings page:

```typescript
// In Settings.tsx
function Settings() {
  const { resetPreferences, updatePreferences } = usePreferencesStore()
  const navigate = useNavigate()
  
  function handleRestartWizard() {
    // Reset wizard state
    updatePreferences({ 
      wizardCompleted: false
    })
    
    // Navigate to root (wizard will show)
    navigate('/')
  }
  
  return (
    <div>
      {/* Existing settings content */}
      
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h3 className="text-xl font-semibold">Setup Wizard</h3>
          <p>Restart the setup wizard to reconfigure your application</p>
          
          <Button 
            variant="outline" 
            onClick={handleRestartWizard}
          >
            Restart Setup Wizard
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 5.3 TopBar Integration

Update the TopBar to hide navigation during the wizard flow:

```typescript
function TopBar() {
  const { preferences } = usePreferencesStore()
  
  // Don't show navigation in wizard mode
  if (!preferences.wizardCompleted) {
    return (
      <Navbar className="bg-card h-16">
        <NavbarBrand>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Icon icon="solar:chat-round-dots-bold" className="text-purple-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">Quorum</span>
          </div>
        </NavbarBrand>
      </Navbar>
    )
  }
  
  // Regular navbar for non-wizard pages
  return (
    // Existing TopBar implementation
  )
}
```

## 6. Implementation Plan

1. **Update Preferences Types and Store**
   - Add `wizardCompleted` to UserPreferences
   - Add setter method to the preferences store

2. **Create Wizard Components**
   - Implement WizardContainer
   - Implement WizardProgress and WizardNavigation
   - Implement or adapt each wizard step
   - Create new SecurityStep component

3. **Update Routing**
   - Implement root-level routing
   - Implement protection for app routes

4. **Integrate with App**
   - Update App.tsx to check wizard completion
   - Redirect to wizard if not completed

5. **Update TopBar**
   - Hide navigation during wizard flow
   - Show simplified header

6. **Add Restart Option**
   - Add wizard restart option to Settings

7. **Testing**
   - Test the complete flow
   - Test validation logic
   - Test persistence

## 7. Open Questions

1. **Wizard UI Style**: Should the wizard be a modal overlay or full-page experience?
   - [ ] Modal overlay
   - [X] Full-page experience

2. **Step Skipping**: Should we allow users to skip certain steps if they've already completed them (e.g., if they already have API keys)?
   - [X] Allow skipping with validation
   - [ ] Require all steps to be completed in order

3. **Additional Steps**: Do we need to add any additional steps beyond the ones mentioned?
   - [X] No additional steps needed
   - [ ] Add step for: _________________

4. **Progress Persistence**: Should we implement a way to save progress if the user leaves mid-wizard?
   - [ ] Save progress automatically
   - [X] Don't save progress (restart from beginning)

5. **Access Control**: How should we handle the case where a user has no API keys but tries to access other parts of the app?
   - [ ] Block access completely until wizard is completed
   - [ ] Allow access but show warnings/prompts
   - [X] Redirect to API key setup

6. **Provider Selection**: Should provider selection be a separate step or part of the API key setup?
   - [ ] Separate step
   - [X] Part of API key setup

7. **Participant Creation**: Should we require at least one participant to be created during the wizard?
   - [X] Require at least one participant
   - [ ] Make participant creation optional
