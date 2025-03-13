import * as React from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiKeyStorageOptions } from '../types/api'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'

interface ApiKeyConsentModalProps {
  onContinue: (storageType: ApiKeyStorageOptions['storage']) => void
  onCancel: () => void
}

export function ApiKeyConsentModal({ onContinue, onCancel }: ApiKeyConsentModalProps) {
  const { t } = useTranslation()
  const [isChecked, setIsChecked] = React.useState(false)
  const [selectedStorage, setSelectedStorage] = React.useState<ApiKeyStorageOptions['storage']>('session')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-card p-6 rounded-xl shadow-xl max-w-lg w-full mx-4 border border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl -z-10"></div>
        
        <h2 className="text-xl font-bold mb-4 text-foreground">
          {t('welcome.consent.title')}
        </h2>
        
        <p className="mb-4 text-foreground">
          {t('welcome.consent.intro')}
        </p>
        
        <ul className="list-disc pl-5 mb-6 space-y-2 text-foreground">
          <li>{t('welcome.consent.points.storage')}</li>
          <li>{t('welcome.consent.points.processing')}</li>
          <li>{t('welcome.consent.points.access')}</li>
        </ul>

        <div className="mb-6">
          <p className="font-medium mb-2 text-foreground">{t('welcome.consent.points.options')}</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="storage"
                className="radio radio-primary"
                checked={selectedStorage === 'local'}
                onChange={() => setSelectedStorage('local')}
              />
              <div>
                <div className="font-medium text-foreground">{t('welcome.consent.points.localStorage')}</div>
                <div className="text-sm text-foreground/70">Persists between sessions</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="storage"
                className="radio radio-primary"
                checked={selectedStorage === 'session'}
                onChange={() => setSelectedStorage('session')}
              />
              <div>
                <div className="font-medium text-foreground">{t('welcome.consent.points.sessionStorage')}</div>
                <div className="text-sm text-foreground/70">Cleared when browser closes</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="storage"
                className="radio radio-primary"
                checked={selectedStorage === 'none'}
                onChange={() => setSelectedStorage('none')}
              />
              <div>
                <div className="font-medium text-foreground">{t('welcome.consent.points.noStorage')}</div>
                <div className="text-sm text-foreground/70">Must re-enter each time</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Checkbox
            id="consent"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
            className="checkbox-primary"
          />
          <label htmlFor="consent" className="cursor-pointer text-foreground">
            {t('welcome.consent.agreement')}
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-foreground/5"
            onClick={onCancel}
          >
            {t('welcome.consent.cancel')}
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:shadow-lg hover:shadow-purple-600/20"
            disabled={!isChecked}
            onClick={() => onContinue(selectedStorage)}
          >
            {t('welcome.consent.continue')}
          </Button>
        </div>
      </div>
    </div>
  )
} 