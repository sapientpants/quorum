/**
 * Represents a chunk of a streaming response
 */
export interface StreamingResponse {
  /**
   * Indicates if this is the final chunk in the stream
   */
  done: boolean
  
  /**
   * The token text, if any
   */
  token?: string
  
  /**
   * Error that occurred during streaming, if any
   */
  error?: Error
}

/**
 * Options for streaming responses
 * @deprecated Use AsyncIterable-based streaming instead
 */
export interface StreamingOptions {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}