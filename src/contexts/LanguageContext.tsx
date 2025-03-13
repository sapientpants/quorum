import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import i18n from '../lib/i18n'

interface LanguageContextType {
  language: string
  changeLanguage: (lang: string) => void
  availableLanguages: { code: string; name: string }[]
}

const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
]

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(i18n.language || 'en')

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider')
  }
  
  return context
} 