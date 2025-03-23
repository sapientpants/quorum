import type { Message } from "../../types/chat";
import type {
  LLMClient,
  LLMSettings,
  StreamingOptions,
  ProviderCapabilities,
  GoogleModel,
  LLMModel,
} from "../../types/llm";
import type { StreamingResponse } from "../../types/streaming";

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
  private readonly supportedModels: GoogleModel[] = [
    "gemini-2.0-pro",
    "gemini-2.0-flash",
  ];

  private readonly defaultModel: GoogleModel = "gemini-2.0-pro";

  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel = this.defaultModel as LLMModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
  ): Promise<string> {
    if (!apiKey) throw new GoogleError("API key is required");
    if (!this.supportedModels.includes(model as GoogleModel)) {
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

  getAvailableModels(): LLMModel[] {
    return this.supportedModels as LLMModel[];
  }

  getDefaultModel(): LLMModel {
    return this.defaultModel as LLMModel;
  }

  getProviderName(): string {
    return "google";
  }

  supportsStreaming(): boolean {
    return false;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: false,
      supportsSystemMessages: true,
      maxContextLength: 32768,
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    return !!apiKey; // Simple validation - just check if key exists
  }

  async *streamMessage(
    _messages: Message[],
    _apiKey: string,
    _model: LLMModel,
    _settings?: LLMSettings,
    _abortSignal?: AbortSignal,
  ): AsyncIterable<StreamingResponse> {
    // Yield an error response with proper explanation
    yield {
      done: true,
      error: new Error("Streaming not supported for Google"),
    };
  }
}
