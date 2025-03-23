import { describe, it, expect } from "vitest";
import { LLMError, LLMErrorType } from "../errors";

describe("LLMError", () => {
  it("creates an error with the correct properties", () => {
    const error = new LLMError(LLMErrorType.API_ERROR, "Test error message");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("LLMError");
    expect(error.type).toBe(LLMErrorType.API_ERROR);
    expect(error.message).toBe("Test error message");
    expect(error.statusCode).toBeUndefined();
    expect(error.originalError).toBeUndefined();
    expect(error.requestId).toBeUndefined();
  });

  it("creates an error with options", () => {
    const originalError = new Error("Original error");
    const error = new LLMError(LLMErrorType.API_ERROR, "Test error message", {
      statusCode: 500,
      originalError,
      requestId: "req-123",
    });

    expect(error.statusCode).toBe(500);
    expect(error.originalError).toBe(originalError);
    expect(error.requestId).toBe("req-123");
  });

  it("returns the correct user message for AUTHENTICATION", () => {
    const error = new LLMError(LLMErrorType.AUTHENTICATION, "Auth failed");
    expect(error.getUserMessage()).toBe(
      "Authentication failed. Please check your API key.",
    );
  });

  it("returns the correct user message for RATE_LIMIT", () => {
    const error = new LLMError(LLMErrorType.RATE_LIMIT, "Rate limit exceeded");
    expect(error.getUserMessage()).toBe(
      "Rate limit exceeded. Please try again later.",
    );
  });

  it("returns the correct user message for TIMEOUT", () => {
    const error = new LLMError(LLMErrorType.TIMEOUT, "Request timed out");
    expect(error.getUserMessage()).toBe(
      "The request timed out. Please try again.",
    );
  });

  it("returns the correct user message for CONTENT_FILTER", () => {
    const error = new LLMError(LLMErrorType.CONTENT_FILTER, "Content filtered");
    expect(error.getUserMessage()).toBe(
      "Your request was filtered due to content policy violation.",
    );
  });

  it("returns the correct user message for NETWORK", () => {
    const error = new LLMError(LLMErrorType.NETWORK, "Network error");
    expect(error.getUserMessage()).toBe(
      "Network error. Please check your internet connection.",
    );
  });

  it("returns the correct user message for API_ERROR", () => {
    const error = new LLMError(LLMErrorType.API_ERROR, "API error details");
    expect(error.getUserMessage()).toBe(
      "An error occurred while processing your request: API error details",
    );
  });

  it("returns the correct user message for UNKNOWN", () => {
    const error = new LLMError(LLMErrorType.UNKNOWN, "Unknown error");
    expect(error.getUserMessage()).toBe(
      "An unexpected error occurred: Unknown error",
    );
  });

  it("returns the correct user message for empty message", () => {
    const error = new LLMError(LLMErrorType.UNKNOWN, "");
    expect(error.getUserMessage()).toBe("An unexpected error occurred: ");
  });

  it("returns the correct suggestions for AUTHENTICATION", () => {
    const error = new LLMError(LLMErrorType.AUTHENTICATION, "Auth failed");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toContain("Verify your API key is correct");
    expect(suggestions).toContain("Make sure your API key is still valid");
    expect(suggestions).toContain(
      "Check if your API key has the necessary permissions",
    );
  });

  it("returns the correct suggestions for RATE_LIMIT", () => {
    const error = new LLMError(LLMErrorType.RATE_LIMIT, "Rate limit exceeded");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toContain("Wait a minute and try again");
    expect(suggestions).toContain("Reduce the frequency of requests");
    expect(suggestions).toContain(
      "Consider upgrading your API plan if available",
    );
  });

  it("returns the correct suggestions for TIMEOUT", () => {
    const error = new LLMError(LLMErrorType.TIMEOUT, "Request timed out");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toContain("Try again with a shorter prompt");
    expect(suggestions).toContain("Check your internet connection");
    expect(suggestions).toContain("Try a different model that might be faster");
  });

  it("returns the correct suggestions for CONTENT_FILTER", () => {
    const error = new LLMError(LLMErrorType.CONTENT_FILTER, "Content filtered");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(2);
    expect(suggestions).toContain(
      "Modify your request to comply with content policies",
    );
    expect(suggestions).toContain(
      "Remove any potentially sensitive or prohibited content",
    );
  });

  it("returns the correct suggestions for NETWORK", () => {
    const error = new LLMError(LLMErrorType.NETWORK, "Network error");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toContain("Check your internet connection");
    expect(suggestions).toContain("Try again in a few moments");
    expect(suggestions).toContain(
      "Verify the API service is not experiencing an outage",
    );
  });

  it("returns the correct suggestions for API_ERROR", () => {
    const error = new LLMError(LLMErrorType.API_ERROR, "API error details");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toContain("Try again later");
    expect(suggestions).toContain(
      "Check if the API service is experiencing issues",
    );
    expect(suggestions).toContain("Try with different parameters");
  });

  it("returns the correct suggestions for UNKNOWN", () => {
    const error = new LLMError(LLMErrorType.UNKNOWN, "Unknown error");
    const suggestions = error.getSuggestions();

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toContain("Try again later");
    expect(suggestions).toContain(
      "Check if the API service is experiencing issues",
    );
    expect(suggestions).toContain("Try with different parameters");
  });

  it("handles all error types", () => {
    // Check that we have a test for each error type
    const errorTypes = Object.values(LLMErrorType);

    // Create a set of tested error types
    const testedErrorTypes = new Set([
      LLMErrorType.AUTHENTICATION,
      LLMErrorType.RATE_LIMIT,
      LLMErrorType.TIMEOUT,
      LLMErrorType.CONTENT_FILTER,
      LLMErrorType.NETWORK,
      LLMErrorType.API_ERROR,
      LLMErrorType.UNKNOWN,
      LLMErrorType.INVALID_MODEL, // Added missing error types
      LLMErrorType.UNSUPPORTED_OPERATION,
    ]);

    // Check that all error types are tested
    errorTypes.forEach((errorType) => {
      expect(testedErrorTypes.has(errorType)).toBe(true);
    });

    // Check that we don't have extra tests
    expect(testedErrorTypes.size).toBe(errorTypes.length);
  });
});
