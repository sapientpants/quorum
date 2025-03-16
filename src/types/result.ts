import { LLMError, ErrorType } from "../services/llm/LLMError";

/**
 * A Result type for handling success and failure cases
 */
export type Result<T, E = LLMError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create a success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
function failure<E = LLMError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Default error transformer
 */
function defaultErrorTransformer(error: unknown): LLMError {
  if (error instanceof LLMError) {
    return error;
  }

  return new LLMError(
    ErrorType.UNKNOWN,
    error instanceof Error ? error.message : String(error),
  );
}

/**
 * Try to execute a function and return a Result
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorTransformer: (error: unknown) => LLMError = defaultErrorTransformer,
): Promise<Result<T>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(errorTransformer(error));
  }
}
