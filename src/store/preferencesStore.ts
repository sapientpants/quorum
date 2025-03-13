import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences } from '../types/preferences'

interface PreferencesState {
  preferences: UserPreferences
  hasConsented: boolean
  setHasConsented: (value: boolean) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  accentColor: 'purple',
  autoAdvance: true,
  showThinkingIndicators: true,
  autoSummarize: false,
  keyStoragePreference: 'session',
  language: 'en'
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

      resetPreferences: () =>
        set({ preferences: defaultPreferences, hasConsented: false })
    }),
    {
      name: 'preferences-storage'
    }
  )
) 