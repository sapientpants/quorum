import { useLanguageContext } from '../contexts/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './ui/dropdown-menu'

export function LanguageToggle() {
  const { language, changeLanguage, availableLanguages } = useLanguageContext()
  const { t } = useTranslation()

  const languageIcons: Record<string, string> = {
    en: 'emojione:flag-for-united-kingdom',
    de: 'emojione:flag-for-germany'
  }

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
        aria-label={t('languageToggle.selectLanguage')}
      >
        <Icon 
          icon={languageIcons[language] || 'solar:global-linear'} 
          width="20" 
          height="20" 
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            className={`flex items-center gap-2 py-2 px-3 ${
              language === lang.code 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-white/5'
            }`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <Icon 
              icon={languageIcons[lang.code] || 'solar:global-linear'} 
              width="18" 
              height="18" 
            />
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 