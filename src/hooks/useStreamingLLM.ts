import { useState, useCallback, useRef } from "react";
import type { Message } from "../types/chat";
import type { LLMProviderId, LLMSettings, LLMModel } from "../types/llm";
import { StreamingResponse } from "../types/streaming";
import { LLMService, LLMError, LLMErrorType } from "../services/llm";

// Helper function to create LLMError from any exception
function createLLMErrorFromException(err: unknown): LLMError {
  if (err instanceof LLMError) {
    return err;
  }

  const errorMessage = err instanceof Error ? err.message : "Unknown error";
  return new LLMError(LLMErrorType.API_ERROR, errorMessage);
}

/**
 * Hook for using streaming LLM responses with async iterables
 */
export function useStreamingLLM() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<LLMError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Validate streaming requirements
   */
  const validateStreamingRequirements = useCallback(
    (
      provider: LLMProviderId,
      apiKey: string,
      callbacks?: {
        onToken?: (token: string) => void;
        onComplete?: (fullText: string) => void;
        onError?: (error: LLMError) => void;
      },
    ) => {
      if (!provider) {
        const error = new LLMError(
          LLMErrorType.INVALID_MODEL,
          "Provider is required",
        );
        setError(error);
        callbacks?.onError?.(error);
        return false;
      }

      if (!apiKey) {
        const error = new LLMError(
          LLMErrorType.AUTHENTICATION,
          `API key for ${provider} is required`,
        );
        setError(error);
        callbacks?.onError?.(error);
        return false;
      }

      return true;
    },
    [],
  );

  /**
   * Process streaming response
   */
  const processStreamResponse = useCallback(
    async (
      stream: AsyncIterable<StreamingResponse>,
      callbacks?: {
        onToken?: (token: string) => void;
        onComplete?: (fullText: string) => void;
      },
    ) => {
      let fullText = "";

      for await (const chunk of stream) {
        if (chunk.error) {
          throw chunk.error;
        }

        if (chunk.token) {
          fullText += chunk.token;
          callbacks?.onToken?.(chunk.token);
        }

        if (chunk.done) {
          break;
        }
      }

      // Call the onComplete callback
      callbacks?.onComplete?.(fullText);
      return fullText;
    },
    [],
  );

  /**
   * Stream a message to an LLM and get tokens as they arrive
   */
  const streamMessage = useCallback(
    async (
      messages: Message[],
      provider: LLMProviderId,
      apiKey: string,
      model: LLMModel,
      settings?: LLMSettings,
      callbacks?: {
        onToken?: (token: string) => void;
        onComplete?: (fullText: string) => void;
        onError?: (error: LLMError) => void;
      },
    ) => {
      // Validate requirements
      if (!validateStreamingRequirements(provider, apiKey, callbacks)) {
        return null;
      }

      setIsStreaming(true);
      setError(null);

      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Get the client for the requested provider
        const client = LLMService.getClient(provider);

        // Check if streaming is supported by the client
        if (!client.supportsStreaming()) {
          throw new LLMError(
            LLMErrorType.UNSUPPORTED_OPERATION,
            `Provider ${provider} does not support streaming`,
          );
        }

        // Check if streamMessage method exists
        if (!client.streamMessage) {
          throw new LLMError(
            LLMErrorType.UNSUPPORTED_OPERATION,
            `Provider ${provider} does not implement streamMessage`,
          );
        }

        // Stream the response
        const stream = client.streamMessage(
          messages,
          apiKey,
          model,
          settings,
          abortControllerRef.current.signal,
        );

        return await processStreamResponse(stream, callbacks);
      } catch (err) {
        console.error(`Error streaming from ${provider}:`, err);

        const llmError = createLLMErrorFromException(err);

        setError(llmError);
        callbacks?.onError?.(llmError);
        return null;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [validateStreamingRequirements, processStreamResponse],
  );

  /**
   * Abort the current streaming request
   */
  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return {
    isStreaming,
    error,
    streamMessage,
    abortStream,
  };
}
