import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProviderSelection } from '../useProviderSelection'
import type { LLMProvider, LLMProviderId } from '../../types/llm'

// Mock the LLM services
vi.mock('../../services/llm', () => ({
  getAvailableModels: vi.fn((provider) => {
    if (provider === 'openai') return ['gpt-4', 'gpt-3.5-turbo']
    if (provider === 'anthropic') return ['claude-3-opus', 'claude-3-sonnet']
    return []
  }),
  getDefaultModel: vi.fn((provider) => {
    if (provider === 'openai') return 'gpt-4'
    if (provider === 'anthropic') return 'claude-3-sonnet'
    return ''
  }),
  supportsStreaming: vi.fn((provider) => {
    return provider === 'openai' // Only OpenAI supports streaming in our mock
  })
}))

// Mock the LLM_PROVIDERS constant
vi.mock('../../types/llm', () => ({
  LLM_PROVIDERS: [
    { id: 'openai', displayName: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
    { id: 'anthropic', displayName: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet'] }
  ],
  LLMProviderId: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    GROK: 'grok',
    GOOGLE: 'google'
  }
}))

describe('useProviderSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('initializes with null provider and model', () => {
    const { result } = renderHook(() => useProviderSelection())
    
    expect(result.current.activeProvider).toBeNull()
    expect(result.current.activeModel).toBeNull()
    expect(result.current.availableModels).toEqual([])
    expect(result.current.apiKeys).toEqual({})
  })
  
  it('updates available models and default model when provider changes', () => {
    const { result } = renderHook(() => useProviderSelection())
    
    // Set the active provider to OpenAI
    act(() => {
      const openaiProvider: LLMProvider = { id: 'openai' as LLMProviderId, displayName: 'OpenAI', models: [] }
      result.current.setActiveProvider(openaiProvider)
    })
    
    // Check that the available models and default model were updated
    expect(result.current.availableModels).toEqual(['gpt-4', 'gpt-3.5-turbo'])
    expect(result.current.activeModel).toBe('gpt-4')
    
    // Set the active provider to Anthropic
    act(() => {
      const anthropicProvider: LLMProvider = { id: 'anthropic' as LLMProviderId, displayName: 'Anthropic', models: [] }
      result.current.setActiveProvider(anthropicProvider)
    })
    
    // Check that the available models and default model were updated
    expect(result.current.availableModels).toEqual(['claude-3-opus', 'claude-3-sonnet'])
    expect(result.current.activeModel).toBe('claude-3-sonnet')
  })
  
  it('handles API key changes', () => {
    const { result } = renderHook(() => useProviderSelection())
    
    // Set an API key for OpenAI
    act(() => {
      result.current.handleApiKeyChange('openai', 'test-key-1')
    })
    
    // Check that the API key was set
    expect(result.current.apiKeys).toEqual({ openai: 'test-key-1' })
    
    // Set an API key for Anthropic
    act(() => {
      result.current.handleApiKeyChange('anthropic', 'test-key-2')
    })
    
    // Check that both API keys are set
    expect(result.current.apiKeys).toEqual({
      openai: 'test-key-1',
      anthropic: 'test-key-2'
    })
    
    // Update the OpenAI API key
    act(() => {
      result.current.handleApiKeyChange('openai', 'new-test-key')
    })
    
    // Check that the OpenAI API key was updated
    expect(result.current.apiKeys).toEqual({
      openai: 'new-test-key',
      anthropic: 'test-key-2'
    })
  })
  
  it('checks if a provider is configured', () => {
    const { result } = renderHook(() => useProviderSelection())
    
    // Initially, no providers are configured
    const openaiProvider: LLMProvider = { id: 'openai' as LLMProviderId, displayName: 'OpenAI', models: [] }
    expect(result.current.isProviderConfigured(openaiProvider)).toBe(false)
    
    // Set an API key for OpenAI
    act(() => {
      result.current.handleApiKeyChange('openai', 'test-key')
    })
    
    // Now OpenAI should be configured
    expect(result.current.isProviderConfigured(openaiProvider)).toBe(true)
    
    // Anthropic is still not configured
    const anthropicProvider: LLMProvider = { id: 'anthropic' as LLMProviderId, displayName: 'Anthropic', models: [] }
    expect(result.current.isProviderConfigured(anthropicProvider)).toBe(false)
  })
  
  it('checks if streaming is supported', () => {
    const { result } = renderHook(() => useProviderSelection())
    
    // Initially, no provider is selected, so streaming is not supported
    expect(result.current.isStreamingSupported()).toBe(false)
    
    // Set the active provider to OpenAI (which supports streaming in our mock)
    act(() => {
      const openaiProvider: LLMProvider = { id: 'openai' as LLMProviderId, displayName: 'OpenAI', models: [] }
      result.current.setActiveProvider(openaiProvider)
    })
    
    // Now streaming should be supported
    expect(result.current.isStreamingSupported()).toBe(true)
    
    // Set the active provider to Anthropic (which doesn't support streaming in our mock)
    act(() => {
      const anthropicProvider: LLMProvider = { id: 'anthropic' as LLMProviderId, displayName: 'Anthropic', models: [] }
      result.current.setActiveProvider(anthropicProvider)
    })
    
    // Now streaming should not be supported
    expect(result.current.isStreamingSupported()).toBe(false)
  })
  
  it('returns the list of supported providers', () => {
    const { result } = renderHook(() => useProviderSelection())
    
    // Check that the list of supported providers is returned
    const providers = result.current.getSupportedProvidersList()
    expect(providers).toEqual([
      { id: 'openai', displayName: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
      { id: 'anthropic', displayName: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet'] }
    ])
  })
})
