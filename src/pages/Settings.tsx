import * as React from 'react'
import { Button } from '../components/ui/button'
import ApiKeyManager from '../components/ApiKeyManager'
import { ParticipantList } from '../components/ParticipantList'
import { Icon } from '@iconify/react'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useTranslation } from 'react-i18next'

export function Settings() {
  const [activeTab, setActiveTab] = React.useState('api-keys')
  const [displayName, setDisplayName] = React.useState<string>(localStorage.getItem('displayName') || '')
  const [autoAdvance, setAutoAdvance] = React.useState<boolean>(localStorage.getItem('autoAdvance') !== 'false')
  const [showThinking, setShowThinking] = React.useState<boolean>(localStorage.getItem('showThinking') !== 'false')
  const [autoSummarize, setAutoSummarize] = React.useState<boolean>(localStorage.getItem('autoSummarize') === 'true')
  const { language, changeLanguage, availableLanguages } = useLanguageContext()
  const { t } = useTranslation()
  
  function handleDisplayNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayName(e.target.value)
    localStorage.setItem('displayName', e.target.value)
  }
  
  function handleAutoAdvanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutoAdvance(e.target.checked)
    localStorage.setItem('autoAdvance', e.target.checked.toString())
  }
  
  function handleShowThinkingChange(e: React.ChangeEvent<HTMLInputElement>) {
    setShowThinking(e.target.checked)
    localStorage.setItem('showThinking', e.target.checked.toString())
  }
  
  function handleAutoSummarizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutoSummarize(e.target.checked)
    localStorage.setItem('autoSummarize', e.target.checked.toString())
  }
  
  function handleApiKeyChange(provider: string, key: string) {
    // Store in localStorage
    if (key) {
      localStorage.setItem(`${provider}_api_key`, key)
    } else {
      localStorage.removeItem(`${provider}_api_key`)
    }
  }
  
  function handleResetDefaults() {
    // Reset to default settings
    setDisplayName('')
    setAutoAdvance(true)
    setShowThinking(true)
    setAutoSummarize(false)
    
    // Update localStorage
    localStorage.setItem('displayName', '')
    localStorage.setItem('autoAdvance', 'true')
    localStorage.setItem('showThinking', 'true')
    localStorage.setItem('autoSummarize', 'false')
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <div className="flex flex-col gap-2 sticky top-20">
            <Button 
              variant={activeTab === 'api-keys' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('api-keys')}
              className="justify-start"
            >
              {t('settings.apiKeys')}
            </Button>
            <Button 
              variant={activeTab === 'participants' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('participants')}
              className="justify-start"
            >
              <Icon icon="solar:users-group-rounded-linear" className="mr-2 h-4 w-4" />
              {t('settings.participants')}
            </Button>
            <Button 
              variant={activeTab === 'language' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('language')}
              className="justify-start"
            >
              <Icon icon="solar:global-linear" className="mr-2 h-4 w-4" />
              {t('settings.language')}
            </Button>
            <Button 
              variant={activeTab === 'appearance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('appearance')}
              className="justify-start"
            >
              {t('settings.appearance')}
            </Button>
            <Button 
              variant={activeTab === 'privacy' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('privacy')}
              className="justify-start"
            >
              {t('settings.privacy')}
            </Button>
            <Button 
              variant={activeTab === 'about' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('about')}
              className="justify-start"
            >
              {t('settings.about')}
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          {activeTab === 'api-keys' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.apiKeys')}</h2>
              <p className="mb-6">
                {t('settings.apiKeysDescription')}
              </p>
              
              <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
            </div>
          )}
          
          {activeTab === 'participants' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.participants')}</h2>
              <p className="mb-6">
                {t('settings.participantsDescription')}
              </p>
              
              <ParticipantList />
            </div>
          )}
          
          {activeTab === 'language' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.language')}</h2>
              <p className="mb-6">
                {t('languageToggle.selectLanguage')}
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {availableLanguages.map((lang) => (
                    <div 
                      key={lang.code}
                      className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                        language === lang.code 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <Icon 
                        icon={`emojione:flag-for-${lang.code === 'en' ? 'united-kingdom' : 'germany'}`}
                        width="24" 
                        height="24" 
                      />
                      <div>
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-sm opacity-70">
                          {lang.code === 'en' ? 'English' : 'Deutsch'}
                        </div>
                      </div>
                      {language === lang.code && (
                        <Icon 
                          icon="solar:check-circle-bold" 
                          className="ml-auto text-primary" 
                          width="20" 
                          height="20" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.appearance')}</h2>
              <p className="mb-6">
                {t('settings.appearanceDescription')}
              </p>
              
              <div className="form-control w-full max-w-md mb-6">
                <label className="label">
                  <span className="label-text">{t('settings.displayName')}</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  placeholder={t('settings.displayName')}
                />
              </div>
              
              {/* Theme selector removed */}
              
              <div className="mb-6">
                <h4 className="font-bold mb-2">{t('settings.roundTableBehavior')}</h4>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={autoAdvance}
                      onChange={handleAutoAdvanceChange}
                    />
                    <span className="label-text">{t('settings.autoAdvance')}</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={showThinking}
                      onChange={handleShowThinkingChange}
                    />
                    <span className="label-text">{t('settings.showThinking')}</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={autoSummarize}
                      onChange={handleAutoSummarizeChange}
                    />
                    <span className="label-text">{t('settings.autoSummarize')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.privacy')}</h2>
              <p className="mb-6">
                {t('settings.privacyDescription')}
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('settings.dataStorage')}</h3>
                  <p className="mb-2">
                    {t('settings.dataStorageDescription')}
                  </p>
                  <Button variant="error">{t('settings.clearAllData')}</Button>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('settings.apiKeyStorage')}</h3>
                  <p className="mb-2">
                    {t('settings.apiKeyStorageDescription')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="localStorage" name="keyStorage" defaultChecked />
                    <label htmlFor="localStorage">{t('settings.localStorage')}</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="sessionOnly" name="keyStorage" />
                    <label htmlFor="sessionOnly">{t('settings.sessionOnly')}</label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.about')} Quorum</h2>
              <p className="mb-4">
                {t('settings.aboutDescription')}
              </p>
              <p className="mb-4">
                {t('settings.version')}: 0.1.0
              </p>
              <p className="mb-4">
                {t('settings.createdBy')}: Your Name
              </p>
              <p className="mb-4">
                <a href="https://github.com/yourusername/quorum" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
      
      {activeTab === 'appearance' && (
        <div className="flex justify-end mt-6">
          <button 
            className="btn btn-outline mr-2"
            onClick={handleResetDefaults}
          >
            {t('settings.resetDefaults')}
          </button>
          <button className="btn btn-primary">
            {t('settings.saveChanges')}
          </button>
        </div>
      )}
    </div>
  )
} 