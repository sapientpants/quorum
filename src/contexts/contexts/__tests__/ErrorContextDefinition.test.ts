import { describe, it, expect } from 'vitest'
import { ErrorContext, ErrorContextType } from '../ErrorContextDefinition'
import { LLMError, LLMErrorType } from '../../../services/llm/errors'
import { ConnectionQuality } from '../../../utils/network'

describe('ErrorContextDefinition', () => {
  it('exports ErrorContext with undefined default value', () => {
    expect(ErrorContext).toBeDefined()
    expect(ErrorContext.Provider).toBeDefined()
    expect(ErrorContext.Consumer).toBeDefined()
    expect(ErrorContext.displayName).toBeUndefined()
    
    // The default value should be undefined
    // @ts-expect-error - Testing internal implementation
    expect(ErrorContext._currentValue).toBeUndefined()
  })
  
  it('has the correct ErrorContextType interface', () => {
    // Create a mock implementation of ErrorContextType to verify the interface
    const mockErrorContext: ErrorContextType = {
      apiError: null,
      setApiError: () => {},
      showApiErrorModal: false,
      setShowApiErrorModal: () => {},
      networkStatus: ConnectionQuality.UNKNOWN,
      isOnline: true,
      isLowBandwidth: false,
      currentProvider: null,
      setCurrentProvider: () => {},
      clearError: () => {}
    }
    
    // Verify that the mock implements the interface correctly
    expect(mockErrorContext).toHaveProperty('apiError')
    expect(mockErrorContext).toHaveProperty('setApiError')
    expect(mockErrorContext).toHaveProperty('showApiErrorModal')
    expect(mockErrorContext).toHaveProperty('setShowApiErrorModal')
    expect(mockErrorContext).toHaveProperty('networkStatus')
    expect(mockErrorContext).toHaveProperty('isOnline')
    expect(mockErrorContext).toHaveProperty('isLowBandwidth')
    expect(mockErrorContext).toHaveProperty('currentProvider')
    expect(mockErrorContext).toHaveProperty('setCurrentProvider')
    expect(mockErrorContext).toHaveProperty('clearError')
    
    // Test with an error
    const error = new LLMError(LLMErrorType.AUTHENTICATION, 'Invalid API key')
    const mockWithError: ErrorContextType = {
      ...mockErrorContext,
      apiError: error
    }
    
    expect(mockWithError.apiError).toBe(error)
  })
})
