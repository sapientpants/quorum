import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { testApiKey } from '../services/api-key-service'
import { ApiKeyTestResult } from '../components/api-key-management/api-key-test-modal'

interface ApiKeysState {
  apiKeys: Record<string, string>
  setApiKey: (providerId: string, apiKey: string) => void
  clearApiKey: (providerId: string) => void
  clearAllApiKeys: () => void
  testApiKey: (providerId: string) => Promise<ApiKeyTestResult>
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      apiKeys: {},
      
      setApiKey: (providerId: string, apiKey: string) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [providerId]: apiKey
          }
        }))
      },

      clearApiKey: (providerId: string) => {
        set((state) => {
          const newApiKeys = { ...state.apiKeys }
          delete newApiKeys[providerId]
          return { apiKeys: newApiKeys }
        })
      },

      clearAllApiKeys: () => {
        set({ apiKeys: {} })
      },

      testApiKey: async (providerId: string) => {
        const apiKey = get().apiKeys[providerId]
        if (!apiKey) {
          return {
            success: false,
            message: 'No API key found for this provider',
            models: []
          }
        }
        return testApiKey(providerId, apiKey)
      }
    }),
    {
      name: 'api-keys-storage',
      // You can add storage configuration here if needed
      // For example, to use sessionStorage instead of localStorage
      // storage: createJSONStorage(() => sessionStorage)
    }
  )
) 