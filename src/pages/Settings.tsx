import * as React from 'react'
import { Button } from '../components/ui/button'
import ApiKeyManager from '../components/ApiKeyManager'
import { ParticipantList } from '../components/ParticipantList'
import { Icon } from '@iconify/react'
import { useLanguageContext } from '../hooks/useLanguageContext'
import { useTranslation } from 'react-i18next'
import { ThemeSelector } from '../components/ThemeSelector'
import { ThemeDebug } from '../components/debug/ThemeDebug'
import { HeroUIThemeTest } from '../components/debug/HeroUIThemeTest'
import { usePreferencesStore } from '../store/preferencesStore'
import { type KeyStoragePreference } from '../types/preferences'
import { useState } from 'react'
import { Separator } from '../components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog'
import { toast } from 'sonner'

export function Settings() {
  const [activeTab, setActiveTab] = React.useState('api-keys')
  const [displayName, setDisplayName] = React.useState<string>(localStorage.getItem('displayName') || '')
  const [autoAdvance, setAutoAdvance] = React.useState<boolean>(localStorage.getItem('autoAdvance') !== 'false')
  const [showThinking, setShowThinking] = React.useState<boolean>(localStorage.getItem('showThinking') !== 'false')
  const [autoSummarize, setAutoSummarize] = React.useState<boolean>(localStorage.getItem('autoSummarize') === 'true')
  const { language, changeLanguage, availableLanguages } = useLanguageContext()
  const { t } = useTranslation()
  const { preferences, updatePreferences, resetPreferences } = usePreferencesStore()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportData, setExportData] = useState('')
  
  function handleDisplayNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayName(e.target.value)
    localStorage.setItem('displayName', e.target.value)
  }
  
  function handleAutoAdvanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutoAdvance(e.target.checked)
    localStorage.setItem('autoAdvance', e.target.checked.toString())
    // Also update in preferences store
    updatePreferences({ autoAdvance: e.target.checked })
  }
  
  function handleShowThinkingChange(e: React.ChangeEvent<HTMLInputElement>) {
    setShowThinking(e.target.checked)
    localStorage.setItem('showThinking', e.target.checked.toString())
    // Also update in preferences store
    updatePreferences({ showThinkingIndicators: e.target.checked })
  }
  
  function handleAutoSummarizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutoSummarize(e.target.checked)
    localStorage.setItem('autoSummarize', e.target.checked.toString())
    // Also update in preferences store
    updatePreferences({ autoSummarize: e.target.checked })
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
    
    // Close the dialog
    setIsResetDialogOpen(false)
    
    // Use the preferences store reset function
    resetPreferences()
    
    toast.success(t('settings.resetSuccessful'))
  }

  function handleKeyStorageChange(preference: KeyStoragePreference) {
    updatePreferences({ keyStoragePreference: preference })
    toast.success(t('settings.keyStorageUpdated'))
  }
  
  function handleClearAllData() {
    // Clear localStorage
    localStorage.clear()
    
    // Reset preferences to defaults
    resetPreferences()
    
    // Reset UI state
    setDisplayName('')
    setAutoAdvance(true)
    setShowThinking(true)
    setAutoSummarize(false)
    
    // Close the dialog
    setIsResetDialogOpen(false)
    
    toast.success(t('settings.dataCleared'))
  }
  
  function handleExportData() {
    try {
      // Collect all data from localStorage
      const exportObj: Record<string, unknown> = {}
      
      // Add all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            // Try to parse as JSON first
            exportObj[key] = JSON.parse(localStorage.getItem(key) || '')
          } catch {
            // If not valid JSON, store as string
            exportObj[key] = localStorage.getItem(key)
          }
        }
      }
      
      // Format as pretty JSON
      const dataStr = JSON.stringify(exportObj, null, 2)
      setExportData(dataStr)
      setIsExportDialogOpen(true)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error(t('settings.exportError'))
    }
  }
  
  function downloadExportedData() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData)
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "quorum_data_export.json")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('Error downloading data:', error)
      toast.error(t('settings.downloadError'))
    }
  }
  
  return (
    <div className="mb-6 mt-6 pl-6 pr-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:shrink-0">
          <div className="flex flex-col gap-2 sticky top-20">
            <Button 
              variant={activeTab === 'api-keys' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('api-keys')}
              className="justify-start"
            >
              <Icon icon="solar:key-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.apiKeys')}</span>
            </Button>
            <Button 
              variant={activeTab === 'participants' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('participants')}
              className="justify-start"
            >
              <Icon icon="solar:users-group-rounded-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.participants')}</span>
            </Button>
            <Button 
              variant={activeTab === 'appearance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('appearance')}
              className="justify-start"
            >
              <Icon icon="solar:palette-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.appearance')}</span>
            </Button>
            <Button 
              variant={activeTab === 'llm-defaults' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('llm-defaults')}
              className="justify-start"
            >
              <Icon icon="solar:settings-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.llmDefaults')}</span>
            </Button>
            <Button 
              variant={activeTab === 'language' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('language')}
              className="justify-start"
            >
              <Icon icon="solar:global-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.language')}</span>
            </Button>
            <Button 
              variant={activeTab === 'privacy' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('privacy')}
              className="justify-start"
            >
              <Icon icon="solar:shield-user-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.privacy')}</span>
            </Button>
            <Button 
              variant={activeTab === 'about' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('about')}
              className="justify-start"
            >
              <Icon icon="solar:info-circle-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t('settings.about')}</span>
            </Button>
          </div>
        </div>
        
        <div className="w-full md:grow">
          {activeTab === 'api-keys' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.apiKeys')}</h2>
              <p className="mb-6">
                {t('settings.apiKeysDescription')}
              </p>
              
              <ApiKeyManager 
                onApiKeyChange={handleApiKeyChange} 
                storageOption={{ storage: preferences.keyStoragePreference }}
              />
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
              
              <div className="form-control w-full max-w-md mb-6">
                <label className="label">
                  <span className="label-text">{t('settings.theme')}</span>
                </label>
                <div className="mt-2">
                  <ThemeSelector />
                </div>
                <label className="label">
                  <span className="label-text-alt text-muted-foreground">
                    {t('settings.themeDescription')}
                  </span>
                </label>
              </div>
              
              {/* Theme Debug Component */}
              <div className="mb-6">
                <h4 className="font-bold mb-2">Theme Debug</h4>
                <ThemeDebug />
              </div>
              
              {/* HeroUI Theme Test */}
              <div className="mb-6">
                <h4 className="font-bold mb-2">HeroUI Theme Test</h4>
                <HeroUIThemeTest />
              </div>
              
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

          {activeTab === 'llm-defaults' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('settings.llmDefaults')}</h2>
              <p className="mb-6">
                {t('settings.llmDefaultsDescription')}
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('settings.defaultParameters')}</h3>
                  
                  <div className="form-control w-full max-w-md mb-4">
                    <label className="label">
                      <span className="label-text">{t('settings.defaultTemperature')}</span>
                      <span className="label-text-alt">{preferences.defaultTemperature || 0.7}</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.1" 
                      className="range" 
                      value={preferences.defaultTemperature || 0.7}
                      onChange={(e) => updatePreferences({ defaultTemperature: parseFloat(e.target.value) })}
                    />
                    <div className="flex justify-between text-xs px-2 mt-1">
                      <span>Precise</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div className="form-control w-full max-w-md mb-4">
                    <label className="label">
                      <span className="label-text">{t('settings.defaultMaxTokens')}</span>
                      <span className="label-text-alt">{preferences.defaultMaxTokens || 1000}</span>
                    </label>
                    <input 
                      type="range" 
                      min="100" 
                      max="4000" 
                      step="100" 
                      className="range" 
                      value={preferences.defaultMaxTokens || 1000}
                      onChange={(e) => updatePreferences({ defaultMaxTokens: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between text-xs px-2 mt-1">
                      <span>Short</span>
                      <span>Medium</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('settings.defaultSystemPrompt')}</h3>
                  <textarea 
                    className="textarea textarea-bordered w-full h-32" 
                    placeholder={t('settings.defaultSystemPromptPlaceholder')}
                    value={preferences.defaultSystemPrompt || ""}
                    onChange={(e) => updatePreferences({ defaultSystemPrompt: e.target.value })}
                  ></textarea>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('settings.defaultSystemPromptDescription')}
                  </p>
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
              
              <div className="space-y-8">
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">{t('settings.apiKeyStorage')}</h3>
                    <p className="mb-4">
                      {t('settings.apiKeyStorageDescription')}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id="localStorage" 
                          name="keyStorage" 
                          className="radio radio-primary" 
                          checked={preferences.keyStoragePreference === 'local'}
                          onChange={() => handleKeyStorageChange('local')}
                        />
                        <label htmlFor="localStorage" className="flex flex-col">
                          <span className="font-medium">{t('settings.localStorage')}</span>
                          <span className="text-sm opacity-70">{t('settings.localStorageDescription')}</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id="sessionOnly" 
                          name="keyStorage" 
                          className="radio radio-primary" 
                          checked={preferences.keyStoragePreference === 'session'}
                          onChange={() => handleKeyStorageChange('session')}
                        />
                        <label htmlFor="sessionOnly" className="flex flex-col">
                          <span className="font-medium">{t('settings.sessionOnly')}</span>
                          <span className="text-sm opacity-70">{t('settings.sessionOnlyDescription')}</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id="noStorage" 
                          name="keyStorage" 
                          className="radio radio-primary" 
                          checked={preferences.keyStoragePreference === 'none'}
                          onChange={() => handleKeyStorageChange('none')}
                        />
                        <label htmlFor="noStorage" className="flex flex-col">
                          <span className="font-medium">{t('settings.noStorage')}</span>
                          <span className="text-sm opacity-70">{t('settings.noStorageDescription')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">{t('settings.dataManagement')}</h3>
                    <p className="mb-4">
                      {t('settings.dataManagementDescription')}
                    </p>
                    
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={handleExportData}
                      >
                        <Icon icon="solar:export-line-duotone" className="h-4 w-4" />
                        {t('settings.exportAllData')}
                      </Button>
                      
                      <Button 
                        variant="error" 
                        className="flex items-center gap-2"
                        onClick={handleClearAllData}
                      >
                        <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4" />
                        {t('settings.clearAllData')}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">{t('settings.dataSecurity')}</h3>
                    <div className="space-y-2">
                      <p>
                        {t('settings.dataSecurityDescription1')}
                      </p>
                      <p>
                        {t('settings.dataSecurityDescription2')}
                      </p>
                      
                      <div className="bg-warning/20 border border-warning/50 text-warning-content rounded-md p-4 mt-4">
                        <div className="flex items-start gap-2">
                          <Icon icon="solar:danger-triangle-bold" className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">{t('settings.securityWarning')}</p>
                            <p className="text-sm mt-1">{t('settings.securityWarningDetails')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
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

              <div className="card bg-base-200 shadow-sm mb-6">
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <Icon icon="solar:chat-round-dots-linear" className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="text-2xl font-bold">Quorum</h3>
                      <p className="text-sm opacity-70">A round-table conversation with AI participants</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{t('settings.version')}</span>
                      <span>0.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t('settings.lastUpdated')}</span>
                      <span>May 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t('settings.license')}</span>
                      <span>MIT</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon icon="solar:code-linear" className="h-4 w-4" />
                      <a 
                        href="https://github.com/yourusername/quorum" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {t('settings.viewOnGitHub')}
                      </a>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon icon="solar:bug-linear" className="h-4 w-4" />
                      <a 
                        href="https://github.com/yourusername/quorum/issues" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {t('settings.reportIssue')}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {activeTab === 'appearance' && (
        <div className="flex justify-end mt-6">
          <Button 
            variant="outline"
            className="mr-2"
            onClick={() => setIsResetDialogOpen(true)}
          >
            {t('settings.resetDefaults')}
          </Button>
          <Button>
            {t('settings.saveChanges')}
          </Button>
        </div>
      )}
      
      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.resetConfirmation')}</DialogTitle>
            <DialogDescription>
              {t('settings.resetConfirmationDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button variant="error" onClick={handleResetDefaults}>
              {t('settings.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Data Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('settings.exportData')}</DialogTitle>
            <DialogDescription>
              {t('settings.exportDataDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 rounded-md p-4 max-h-80 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
              {exportData}
            </pre>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              {t('settings.close')}
            </Button>
            <Button onClick={downloadExportedData}>
              <Icon icon="solar:download-linear" className="mr-2 h-4 w-4" />
              {t('settings.download')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
