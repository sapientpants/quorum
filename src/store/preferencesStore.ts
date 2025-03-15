import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences, Theme } from '../types/preferences'

interface PreferencesState {
  preferences: UserPreferences
  hasConsented: boolean
  setHasConsented: (value: boolean) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  resetPreferences: () => void
  setTheme: (theme: Theme) => void
  setWizardCompleted: (completed: boolean) => void
  setWizardStep: (step: number) => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  accentColor: 'purple',
  autoAdvance: true,
  showThinkingIndicators: true,
  autoSummarize: false,
  keyStoragePreference: 'session',
  language: 'en',
  defaultTemperature: 0.7,
  defaultMaxTokens: 1000,
  defaultSystemPrompt: '',
  wizardCompleted: false
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      hasConsented: false,

      setHasConsented: (value: boolean) => 
        set({ hasConsented: value }),

      updatePreferences: (updates: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        })),

      setTheme: (theme: Theme) => {
        console.log('PreferencesStore: Setting theme to', theme)
        set((state) => ({
          preferences: { ...state.preferences, theme }
        }))
      },

      setWizardCompleted: (completed: boolean) =>
        set((state) => ({
          preferences: { ...state.preferences, wizardCompleted: completed }
        })),
        
      setWizardStep: (step: number) =>
        set((state) => ({
          preferences: { ...state.preferences, wizardStep: step }
        })),

      resetPreferences: () =>
        set({ preferences: defaultPreferences, hasConsented: false })
    }),
    {
      name: 'preferences-storage'
    }
  )
)
