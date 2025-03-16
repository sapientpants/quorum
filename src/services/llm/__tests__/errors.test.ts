import { describe, it, expect } from 'vitest'
import { LLMError, LLMErrorType } from '../errors'

describe('LLMError', () => {
  it('creates an error with the correct properties', () => {
    const error = new LLMError(LLMErrorType.API_ERROR, 'Test error message')
    
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('LLMError')
    expect(error.type).toBe(LLMErrorType.API_ERROR)
    expect(error.message).toBe('Test error message')
    expect(error.statusCode).toBeUndefined()
    expect(error.originalError).toBeUndefined()
    expect(error.requestId).toBeUndefined()
  })
  
  it('creates an error with options', () => {
    const originalError = new Error('Original error')
    const error = new LLMError(LLMErrorType.API_ERROR, 'Test error message', {
      statusCode: 500,
      originalError,
      requestId: 'req-123'
    })
    
    expect(error.statusCode).toBe(500)
    expect(error.originalError).toBe(originalError)
    expect(error.requestId).toBe('req-123')
  })
  
  it('returns the correct user message for AUTHENTICATION', () => {
    const error = new LLMError(LLMErrorType.AUTHENTICATION, 'Auth failed')
    expect(error.getUserMessage()).toBe('Authentication failed. Please check your API key and account status.')
  })
  
  it('returns the correct user message for RATE_LIMIT', () => {
    const error = new LLMError(LLMErrorType.RATE_LIMIT, 'Rate limit exceeded')
    expect(error.getUserMessage()).toBe('Rate limit exceeded. Please wait a moment and try again.')
  })
  
  it('returns the correct user message for TIMEOUT', () => {
    const error = new LLMError(LLMErrorType.TIMEOUT, 'Request timed out')
    expect(error.getUserMessage()).toBe('The request timed out. Please check your network connection and try again.')
  })
  
  it('returns the correct user message for CONTENT_FILTER', () => {
    const error = new LLMError(LLMErrorType.CONTENT_FILTER, 'Content filtered')
    expect(error.getUserMessage()).toBe('Your request was filtered by content safety systems. Please modify your prompt.')
  })
  
  it('returns the correct user message for NETWORK', () => {
    const error = new LLMError(LLMErrorType.NETWORK, 'Network error')
    expect(error.getUserMessage()).toBe('Network error. Please check your internet connection.')
  })
  
  it('returns the correct user message for API_ERROR', () => {
    const error = new LLMError(LLMErrorType.API_ERROR, 'API error details')
    expect(error.getUserMessage()).toBe('API error: API error details')
  })
  
  it('returns the correct user message for UNKNOWN', () => {
    const error = new LLMError(LLMErrorType.UNKNOWN, 'Unknown error')
    expect(error.getUserMessage()).toBe('Unknown error')
  })
  
  it('returns the correct user message for empty message', () => {
    const error = new LLMError(LLMErrorType.UNKNOWN, '')
    expect(error.getUserMessage()).toBe('An unknown error occurred.')
  })
  
  it('returns the correct suggestions for AUTHENTICATION', () => {
    const error = new LLMError(LLMErrorType.AUTHENTICATION, 'Auth failed')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(3)
    expect(suggestions).toContain('Check that your API key is correct')
    expect(suggestions).toContain('Ensure your account is in good standing')
    expect(suggestions).toContain('Try regenerating your API key')
  })
  
  it('returns the correct suggestions for RATE_LIMIT', () => {
    const error = new LLMError(LLMErrorType.RATE_LIMIT, 'Rate limit exceeded')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(3)
    expect(suggestions).toContain('Wait a few minutes before trying again')
    expect(suggestions).toContain('Consider upgrading your account plan')
    expect(suggestions).toContain('Check your usage dashboard for quota information')
  })
  
  it('returns the correct suggestions for TIMEOUT', () => {
    const error = new LLMError(LLMErrorType.TIMEOUT, 'Request timed out')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(3)
    expect(suggestions).toContain('Check your internet connection')
    expect(suggestions).toContain('Try a simpler or shorter prompt')
    expect(suggestions).toContain('The service might be experiencing high load')
  })
  
  it('returns the correct suggestions for CONTENT_FILTER', () => {
    const error = new LLMError(LLMErrorType.CONTENT_FILTER, 'Content filtered')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(3)
    expect(suggestions).toContain('Modify your prompt to comply with content policies')
    expect(suggestions).toContain('Remove potentially sensitive or prohibited content')
    expect(suggestions).toContain('Review the provider\'s content guidelines')
  })
  
  it('returns the correct suggestions for NETWORK', () => {
    const error = new LLMError(LLMErrorType.NETWORK, 'Network error')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(3)
    expect(suggestions).toContain('Check your internet connection')
    expect(suggestions).toContain('Try again in a few moments')
    expect(suggestions).toContain('If the issue persists, contact your network administrator')
  })
  
  it('returns the correct suggestions for API_ERROR', () => {
    const error = new LLMError(LLMErrorType.API_ERROR, 'API error details')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(2)
    expect(suggestions).toContain('Try again')
    expect(suggestions).toContain('If the error persists, report the issue')
  })
  
  it('returns the correct suggestions for UNKNOWN', () => {
    const error = new LLMError(LLMErrorType.UNKNOWN, 'Unknown error')
    const suggestions = error.getSuggestions()
    
    expect(suggestions).toHaveLength(2)
    expect(suggestions).toContain('Try again')
    expect(suggestions).toContain('If the error persists, report the issue')
  })
  
  it('handles all error types', () => {
    // Check that we have a test for each error type
    const errorTypes = Object.values(LLMErrorType)
    
    // Create a set of tested error types
    const testedErrorTypes = new Set([
      LLMErrorType.AUTHENTICATION,
      LLMErrorType.RATE_LIMIT,
      LLMErrorType.TIMEOUT,
      LLMErrorType.CONTENT_FILTER,
      LLMErrorType.NETWORK,
      LLMErrorType.API_ERROR,
      LLMErrorType.UNKNOWN
    ])
    
    // Check that all error types are tested
    errorTypes.forEach(errorType => {
      expect(testedErrorTypes.has(errorType)).toBe(true)
    })
    
    // Check that we don't have extra tests
    expect(testedErrorTypes.size).toBe(errorTypes.length)
  })
})
