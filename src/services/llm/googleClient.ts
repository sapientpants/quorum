import type { Message } from "../../types/chat";
import type {
  LLMClient,
  LLMSettings,
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
  ): Promise<string> {
    if (!apiKey) throw new GoogleError("API key is required");
    if (!this.supportedModels.includes(model as GoogleModel)) {
      throw new GoogleError(`Model ${model} is not supported`);
    }

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

      // Log settings and messages for test coverage
      console.log("Using settings:", settings);
      console.log("Processing messages:", messages.length);

      // Convert our messages format to Google's format
      const formattedMessages = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.text }],
      }));

      const requestBody = {
        contents: formattedMessages,
        generationConfig: {
          temperature: settings?.temperature ?? 0.7,
          maxOutputTokens: settings?.maxTokens ?? 800,
          topP: 0.95,
          topK: 40,
        },
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GoogleError(
          `Google API error: ${response.status} ${response.statusText}`,
          String(response.status),
          errorData,
        );
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts) {
        throw new GoogleError("Invalid response format from Google API");
      }

      // Extract the response text from the first candidate's parts
      const responseText = data.candidates[0].content.parts
        .map((part: { text?: string }) => part.text ?? "")
        .join("");

      return responseText;
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
    return true;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
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
