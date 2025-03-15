import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation()
  
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-8">
      <div className="inline-block mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-4 py-2 font-medium shadow-lg shadow-purple-600/20">
          <div className="flex items-center gap-1">
            <Icon icon="solar:magic-stick-linear" width="20" height="20" />
            <span>{t('wizard.welcome.title', 'Welcome to Quorum')}</span>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">
        {t('wizard.welcome.heading', 'A round-table conversation with AI participants')}
      </h1>
      
      <p className="text-lg mb-8 text-foreground/80">
        {t('wizard.welcome.description', 'Quorum helps you create engaging conversations between multiple AI participants with different roles and perspectives.')}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md text-purple-600 dark:text-purple-400">
              <Icon icon="solar:users-group-rounded-linear" width="24" height="24" />
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-1">{t('wizard.welcome.features.customParticipants.title', 'Custom Participants')}</h3>
              <p className="text-sm text-foreground/70">{t('wizard.welcome.features.customParticipants.description', 'Create AI participants with different roles, personalities, and expertise.')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md text-blue-600 dark:text-blue-400">
              <Icon icon="solar:server-linear" width="24" height="24" />
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-1">{t('wizard.welcome.features.multiModel.title', 'Multiple Models')}</h3>
              <p className="text-sm text-foreground/70">{t('wizard.welcome.features.multiModel.description', 'Use different AI models from various providers for each participant.')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md text-green-600 dark:text-green-400">
              <Icon icon="solar:bookmark-linear" width="24" height="24" />
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-1">{t('wizard.welcome.features.saveConfigs.title', 'Save Configurations')}</h3>
              <p className="text-sm text-foreground/70">{t('wizard.welcome.features.saveConfigs.description', 'Save and reuse your favorite participant configurations and templates.')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md text-amber-600 dark:text-amber-400">
              <Icon icon="solar:chat-round-dots-linear" width="24" height="24" />
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-1">{t('wizard.welcome.features.analyze.title', 'Analyze Conversations')}</h3>
              <p className="text-sm text-foreground/70">{t('wizard.welcome.features.analyze.description', 'Gain insights from conversations between different AI perspectives.')}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 mb-8 border border-border/40 max-w-md">
        <p className="text-sm text-foreground/70 flex items-center">
          <Icon icon="solar:info-circle-linear" className="inline-block w-4 h-4 mr-1" />
          {t('wizard.welcome.apiNote', 'You\'ll need API keys for the AI providers you want to use. We\'ll help you set this up in the next steps.')}
        </p>
      </div>
      
      <button
        onClick={onNext}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 font-medium px-8 h-12 rounded-md shadow-lg hover:shadow-purple-600/30 transition-all inline-flex items-center justify-center gap-2 w-64"
      >
        <span>{t('wizard.welcome.getStarted', 'Get Started')}</span>
        <Icon icon="solar:arrow-right-linear" />
      </button>
    </div>
  )
}

export default WelcomeStep
