import type { Message } from '../../types/chat'

export enum ErrorType {
  INVALID_PROVIDER = 'invalid_provider',
  MISSING_API_KEY = 'missing_api_key',
  INVALID_API_KEY = 'invalid_api_key',
  API_ERROR = 'api_error',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CONTENT_FILTER = 'content_filter',
  UNKNOWN = 'unknown'
}

export class LLMError extends Error {
  type: ErrorType
  errorMessage?: Message
  
  constructor(type: ErrorType, message: string, errorMessage?: Message) {
    super(message)
    this.name = 'LLMError'
    this.type = type
    this.errorMessage = errorMessage
  }
  
  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case ErrorType.INVALID_PROVIDER:
        return 'Invalid LLM provider selected.'
      case ErrorType.MISSING_API_KEY:
        return 'API key is required. Please add your API key in settings.'
      case ErrorType.INVALID_API_KEY:
        return 'Invalid API key. Please check your API key and try again.'
      case ErrorType.RATE_LIMIT:
        return 'Rate limit exceeded. Please try again later.'
      case ErrorType.TIMEOUT:
        return 'Request timed out. Please try again.'
      case ErrorType.CONTENT_FILTER:
        return 'Content was filtered by the provider\'s safety system.'
      case ErrorType.API_ERROR:
        return `API error: ${this.message}`
      default:
        return `An error occurred: ${this.message}`
    }
  }
}