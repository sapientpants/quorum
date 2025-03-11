/**
 * Represents a response from a streaming LLM API
 */
export interface StreamingResponse {
  /**
   * Whether the streaming is done
   */
  done: boolean
  
  /**
   * The token received from the stream, if any
   */
  token?: string
  
  /**
   * The error that occurred during streaming, if any
   */
  error?: Error
}