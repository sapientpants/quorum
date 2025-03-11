import { useState, useCallback } from 'react'
import type { LLMSettings } from '../types/llm'

export function useSettings(initialSettings?: Partial<LLMSettings>) {
  const [settings, setSettings] = useState<LLMSettings>({
    temperature: initialSettings?.temperature ?? 0.7,
    maxTokens: initialSettings?.maxTokens ?? 1000,
    topP: initialSettings?.topP,
    frequencyPenalty: initialSettings?.frequencyPenalty,
    presencePenalty: initialSettings?.presencePenalty
  })
  
  const [useStreaming, setUseStreaming] = useState<boolean>(true)
  
  const updateTemperature = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      temperature: value
    }))
  }, [])
  
  const updateMaxTokens = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      maxTokens: value
    }))
  }, [])
  
  const updateTopP = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      topP: value
    }))
  }, [])
  
  const updateFrequencyPenalty = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      frequencyPenalty: value
    }))
  }, [])
  
  const updatePresencePenalty = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      presencePenalty: value
    }))
  }, [])
  
  return {
    settings,
    setSettings,
    useStreaming,
    setUseStreaming,
    updateTemperature,
    updateMaxTokens,
    updateTopP,
    updateFrequencyPenalty,
    updatePresencePenalty
  }
}