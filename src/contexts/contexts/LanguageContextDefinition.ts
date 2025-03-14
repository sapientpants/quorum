import { createContext } from 'react'

/**
 * Language context type definition
 */
export interface LanguageContextType {
  language: string
  changeLanguage: (lang: string) => void
  availableLanguages: { code: string; name: string }[]
}

/**
 * Available languages in the application
 */
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
]

/**
 * Language context for managing application localization
 */
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined) 