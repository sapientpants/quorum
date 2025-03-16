import { describe, it, expect } from 'vitest'
import { LLMError, ErrorType } from '../LLMError'
import type { Message } from '../../../types/chat'

describe('LLMError', () => {
  it('creates an error with the correct properties', () => {
    const error = new LLMError(ErrorType.API_ERROR, 'Test error message')
    
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('LLMError')
    expect(error.type).toBe(ErrorType.API_ERROR)
    expect(error.message).toBe('Test error message')
    expect(error.errorMessage).toBeUndefined()
  })
  
  it('creates an error with an error message object', () => {
    const errorMessage: Message = {
      id: 'error-1',
      senderId: 'assistant',
      text: 'Error content',
      timestamp: Date.now(),
      role: 'assistant'
    }
    
    const error = new LLMError(ErrorType.API_ERROR, 'Test error message', errorMessage)
    
    expect(error.errorMessage).toBe(errorMessage)
  })
  
  it('returns the correct user message for INVALID_PROVIDER', () => {
    const error = new LLMError(ErrorType.INVALID_PROVIDER, 'Invalid provider')
    expect(error.getUserMessage()).toBe('Invalid LLM provider selected.')
  })
  
  it('returns the correct user message for MISSING_API_KEY', () => {
    const error = new LLMError(ErrorType.MISSING_API_KEY, 'Missing API key')
    expect(error.getUserMessage()).toBe('API key is required. Please add your API key in settings.')
  })
  
  it('returns the correct user message for INVALID_API_KEY', () => {
    const error = new LLMError(ErrorType.INVALID_API_KEY, 'Invalid API key')
    expect(error.getUserMessage()).toBe('Invalid API key. Please check your API key and try again.')
  })
  
  it('returns the correct user message for RATE_LIMIT', () => {
    const error = new LLMError(ErrorType.RATE_LIMIT, 'Rate limit exceeded')
    expect(error.getUserMessage()).toBe('Rate limit exceeded. Please try again later.')
  })
  
  it('returns the correct user message for TIMEOUT', () => {
    const error = new LLMError(ErrorType.TIMEOUT, 'Request timed out')
    expect(error.getUserMessage()).toBe('Request timed out. Please try again.')
  })
  
  it('returns the correct user message for CONTENT_FILTER', () => {
    const error = new LLMError(ErrorType.CONTENT_FILTER, 'Content filtered')
    expect(error.getUserMessage()).toBe('Content was filtered by the provider\'s safety system.')
  })
  
  it('returns the correct user message for API_ERROR', () => {
    const error = new LLMError(ErrorType.API_ERROR, 'API error details')
    expect(error.getUserMessage()).toBe('API error: API error details')
  })
  
  it('returns the correct user message for UNKNOWN', () => {
    const error = new LLMError(ErrorType.UNKNOWN, 'Unknown error')
    expect(error.getUserMessage()).toBe('An error occurred: Unknown error')
  })
  
  it('handles all error types', () => {
    // Check that we have a test for each error type
    const errorTypes = Object.values(ErrorType)
    
    // Create a set of tested error types
    const testedErrorTypes = new Set([
      ErrorType.INVALID_PROVIDER,
      ErrorType.MISSING_API_KEY,
      ErrorType.INVALID_API_KEY,
      ErrorType.RATE_LIMIT,
      ErrorType.TIMEOUT,
      ErrorType.CONTENT_FILTER,
      ErrorType.API_ERROR,
      ErrorType.UNKNOWN
    ])
    
    // Check that all error types are tested
    errorTypes.forEach(errorType => {
      expect(testedErrorTypes.has(errorType)).toBe(true)
    })
    
    // Check that we don't have extra tests
    expect(testedErrorTypes.size).toBe(errorTypes.length)
  })
})
