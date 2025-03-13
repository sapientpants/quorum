export type Theme = 'light' | 'dark'
export type AccentColor = 'purple' | 'blue' | 'green' | 'red'
export type KeyStoragePreference = 'local' | 'session' | 'none'

export interface UserPreferences {
  theme: Theme
  accentColor: AccentColor
  autoAdvance: boolean
  showThinkingIndicators: boolean
  autoSummarize: boolean
  keyStoragePreference: KeyStoragePreference
  language: string
} 