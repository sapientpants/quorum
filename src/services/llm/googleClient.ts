import type { Message } from "../../types/chat";
import type { LLMClient, StreamingOptions } from "./llmClient";
import type { LLMSettings } from "../../types/llm";
import { GOOGLE_MODELS } from "../../types/llm";

// Provider-specific error types
class GoogleError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "GoogleError";
  }
}

export class GoogleClient implements LLMClient {
  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
  ): Promise<string> {
    if (!apiKey) throw new GoogleError("API key is required");
    if (!GOOGLE_MODELS.includes(model)) {
      throw new GoogleError(`Model ${model} is not supported`);
    }

    try {
      // TODO: Implement actual API call to Google's Gemini API
      // This is a placeholder that should be replaced with actual implementation
      console.log("Using settings:", settings);
      console.log("Using streaming options:", streamingOptions);
      console.log("Processing messages:", messages.length);

      return "Response from Google Gemini API";
    } catch (error) {
      throw new GoogleError(
        "Failed to send message to Google API",
        undefined,
        error,
      );
    }
  }

  getAvailableModels(): string[] {
    return GOOGLE_MODELS;
  }

  getDefaultModel(): string {
    return "gemini-2.0-pro";
  }

  getProviderName(): string {
    return "google";
  }

  supportsStreaming(): boolean {
    return true;
  }
}
