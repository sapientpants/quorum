/**
 * Error handling for LLM API integrations
 */

export enum LLMErrorType {
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CONTENT_FILTER = 'content_filter',
  NETWORK = 'network',
  API_ERROR = 'api_error',
  UNKNOWN = 'unknown'
}

interface LLMErrorOptions {
  statusCode?: number;
  originalError?: unknown;
  requestId?: string | null;
}

/**
 * Standardized error for LLM API errors
 */
export class LLMError extends Error {
  public type: LLMErrorType;
  public statusCode?: number;
  public originalError?: unknown;
  public requestId?: string | null;
  
  constructor(
    type: LLMErrorType,
    message: string,
    options: LLMErrorOptions = {}
  ) {
    super(message);
    this.name = 'LLMError';
    this.type = type;
    this.statusCode = options.statusCode;
    this.originalError = options.originalError;
    this.requestId = options.requestId;
    
    // This makes the stack trace work correctly in Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LLMError);
    }
  }
  
  /**
   * Get a user-friendly error message based on the error type
   */
  public getUserMessage(): string {
    switch (this.type) {
      case LLMErrorType.AUTHENTICATION:
        return 'Authentication failed. Please check your API key and account status.';
      case LLMErrorType.RATE_LIMIT:
        return 'Rate limit exceeded. Please wait a moment and try again.';
      case LLMErrorType.TIMEOUT:
        return 'The request timed out. Please check your network connection and try again.';
      case LLMErrorType.CONTENT_FILTER:
        return 'Your request was filtered by content safety systems. Please modify your prompt.';
      case LLMErrorType.NETWORK:
        return 'Network error. Please check your internet connection.';
      case LLMErrorType.API_ERROR:
        return `API error: ${this.message}`;
      case LLMErrorType.UNKNOWN:
      default:
        return this.message || 'An unknown error occurred.';
    }
  }
  
  /**
   * Get suggested actions based on error type
   */
  public getSuggestions(): string[] {
    switch (this.type) {
      case LLMErrorType.AUTHENTICATION:
        return [
          'Check that your API key is correct',
          'Ensure your account is in good standing',
          'Try regenerating your API key'
        ];
        
      case LLMErrorType.RATE_LIMIT:
        return [
          'Wait a few minutes before trying again',
          'Consider upgrading your account plan',
          'Check your usage dashboard for quota information'
        ];
        
      case LLMErrorType.TIMEOUT:
        return [
          'Check your internet connection',
          'Try a simpler or shorter prompt',
          'The service might be experiencing high load'
        ];
        
      case LLMErrorType.CONTENT_FILTER:
        return [
          'Modify your prompt to comply with content policies',
          'Remove potentially sensitive or prohibited content',
          'Review the provider\'s content guidelines'
        ];
        
      case LLMErrorType.NETWORK:
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'If the issue persists, contact your network administrator'
        ];
        
      case LLMErrorType.API_ERROR:
      case LLMErrorType.UNKNOWN:
      default:
        return [
          'Try again',
          'If the error persists, report the issue'
        ];
    }
  }
} 