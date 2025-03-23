/**
 * Standard error types for LLM clients
 */
export enum LLMErrorType {
  // Authentication errors
  AUTHENTICATION = "authentication",

  // Rate limit errors
  RATE_LIMIT = "rate_limit",

  // Timeout errors
  TIMEOUT = "timeout",

  // Content filter errors
  CONTENT_FILTER = "content_filter",

  // Network errors
  NETWORK = "network",

  // API errors
  API_ERROR = "api_error",

  // Model not available or not supported
  INVALID_MODEL = "invalid_model",

  // Operation not supported
  UNSUPPORTED_OPERATION = "unsupported_operation",

  // Generic unknown errors
  UNKNOWN = "unknown",
}

/**
 * Options for LLMError
 */
export interface LLMErrorOptions {
  statusCode?: number;
  originalError?: unknown;
  responseData?: unknown;
  requestId?: string | null;
  provider?: string;
}

/**
 * Standardized error class for LLM operations
 */
export class LLMError extends Error {
  public readonly type: LLMErrorType;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;
  public readonly responseData?: unknown;
  public readonly requestId?: string | null;
  public readonly provider?: string;

  constructor(
    type: LLMErrorType,
    message: string,
    options: LLMErrorOptions = {},
  ) {
    super(message);
    this.name = "LLMError";
    this.type = type;
    this.statusCode = options.statusCode;
    this.originalError = options.originalError;
    this.responseData = options.responseData;
    this.requestId = options.requestId;
    this.provider = options.provider;
  }

  /**
   * Get a user-friendly message for this error type
   */
  public getUserMessage(): string {
    switch (this.type) {
      case LLMErrorType.AUTHENTICATION:
        return "Authentication failed. Please check your API key.";

      case LLMErrorType.RATE_LIMIT:
        return "Rate limit exceeded. Please try again later.";

      case LLMErrorType.TIMEOUT:
        return "The request timed out. Please try again.";

      case LLMErrorType.CONTENT_FILTER:
        return "Your request was filtered due to content policy violation.";

      case LLMErrorType.NETWORK:
        return "Network error. Please check your internet connection.";

      case LLMErrorType.INVALID_MODEL:
        return "The selected model is not available or not supported.";

      case LLMErrorType.UNSUPPORTED_OPERATION:
        return "This operation is not supported by the selected provider.";

      case LLMErrorType.API_ERROR:
        return `An error occurred while processing your request: ${this.message}`;

      case LLMErrorType.UNKNOWN:
      default:
        return `An unexpected error occurred: ${this.message}`;
    }
  }

  /**
   * Get suggestions for resolving this error
   */
  public getSuggestions(): string[] {
    switch (this.type) {
      case LLMErrorType.AUTHENTICATION:
        return [
          "Verify your API key is correct",
          "Make sure your API key is still valid",
          "Check if your API key has the necessary permissions",
        ];

      case LLMErrorType.RATE_LIMIT:
        return [
          "Wait a minute and try again",
          "Reduce the frequency of requests",
          "Consider upgrading your API plan if available",
        ];

      case LLMErrorType.TIMEOUT:
        return [
          "Try again with a shorter prompt",
          "Check your internet connection",
          "Try a different model that might be faster",
        ];

      case LLMErrorType.CONTENT_FILTER:
        return [
          "Modify your request to comply with content policies",
          "Remove any potentially sensitive or prohibited content",
        ];

      case LLMErrorType.NETWORK:
        return [
          "Check your internet connection",
          "Try again in a few moments",
          "Verify the API service is not experiencing an outage",
        ];

      case LLMErrorType.INVALID_MODEL:
        return [
          "Choose a different model that is supported",
          "Verify the model name is correct",
        ];

      case LLMErrorType.UNSUPPORTED_OPERATION:
        return [
          "Choose a different provider that supports this operation",
          "Use an alternative approach that is supported",
        ];

      case LLMErrorType.API_ERROR:
      case LLMErrorType.UNKNOWN:
      default:
        return [
          "Try again later",
          "Check if the API service is experiencing issues",
          "Try with different parameters",
        ];
    }
  }
}
