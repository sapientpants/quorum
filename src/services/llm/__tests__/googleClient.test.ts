import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GoogleClient } from "../googleClient";
import { GOOGLE_MODELS } from "../../../types/llm";
import type { GoogleModel } from "../../../types/llm";
import type { Message } from "../../../types/chat";
import type { LLMSettings } from "../../../types/llm";

describe("GoogleClient", () => {
  let client: GoogleClient;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    client = new GoogleClient();
    // Mock console.log to prevent it from cluttering the test output
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock the fetch function to avoid real API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: "Response from Google Gemini API" }],
              },
            },
          ],
        }),
    } as Response);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("returns the correct provider name", () => {
    expect(client.getProviderName()).toBe("google");
  });

  it("returns the correct available models", () => {
    expect(client.getAvailableModels()).toEqual(GOOGLE_MODELS);
    expect(client.getAvailableModels()).toContain("gemini-2.0-pro");
    expect(client.getAvailableModels()).toContain("gemini-2.0-flash");
  });

  it("returns the correct default model", () => {
    expect(client.getDefaultModel()).toBe("gemini-2.0-pro");
  });

  it("indicates that streaming is supported", () => {
    expect(client.supportsStreaming()).toBe(true);
  });

  it("throws an error when sending a message without an API key", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    await expect(
      client.sendMessage(messages, "", "gemini-2.0-pro" as GoogleModel),
    ).rejects.toThrow("API key is required");
  });

  it("throws an error when using an unsupported model", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    await expect(
      // @ts-expect-error Using an invalid model for testing
      client.sendMessage(messages, "test-key", "unsupported-model"),
    ).rejects.toThrow("Model unsupported-model is not supported");
  });

  it("logs messages, settings, and streaming options when sending a message", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    const settings: LLMSettings = {
      temperature: 0.7,
      maxTokens: 100,
    };

    await client.sendMessage(
      messages,
      "test-key",
      "gemini-2.0-pro" as GoogleModel,
      settings,
    );

    expect(consoleSpy).toHaveBeenCalledWith("Using settings:", settings);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Processing messages:",
      messages.length,
    );
  });

  it("returns a placeholder response when sending a message", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    const response = await client.sendMessage(
      messages,
      "test-key",
      "gemini-2.0-pro" as GoogleModel,
    );

    expect(response).toBe("Response from Google Gemini API");
  });

  it("wraps errors in GoogleError", async () => {
    const messages: Message[] = [
      {
        id: "1",
        senderId: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
    ];

    // Mock console.log to throw an error
    consoleSpy.mockImplementation(() => {
      throw new Error("Test error");
    });

    await expect(
      client.sendMessage(messages, "test-key", "gemini-2.0-pro" as GoogleModel),
    ).rejects.toThrow("Failed to send message to Google API");
  });
});
