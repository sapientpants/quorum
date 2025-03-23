import { useCallback, ReactNode, useMemo } from "react";
import { useChatState } from "../hooks/useChatState";
import { useProviderSelection } from "../hooks/useProviderSelection";
import { useSettings } from "../hooks/useSettings";
import { useStreamingLLM } from "../hooks/useStreamingLLM";
import { LLMError } from "../services/llm/LLMError";
import { ChatContext, ChatContextValue } from "./ChatContextValue";
import { Message } from "../types/chat";

/**
 * Chat context provider component
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  // Use our custom hooks for state management
  const {
    messages,
    isLoading,
    setIsLoading,
    error,
    setError,
    addUserMessage,
    addAIMessage,
    updateAIMessage,
    handleRetry: handleMessageRetry,
    clearError,
  } = useChatState();

  const {
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    handleApiKeyChange,
    isProviderConfigured,
    isStreamingSupported,
    getSupportedProvidersList,
  } = useProviderSelection();

  const { settings, setSettings, useStreaming, setUseStreaming } =
    useSettings();

  const { streamMessage, abortStream } = useStreamingLLM();

  // Get all supported providers
  const supportedProviders = getSupportedProvidersList();

  // Helper function to validate message requirements
  const validateMessageRequirements = useCallback(() => {
    if (!activeProvider) {
      setError("Please select a provider to continue");
      return false;
    }

    if (activeProvider && !apiKeys[activeProvider.id]) {
      setError(`Please enter your ${activeProvider} API key to continue`);
      return false;
    }

    if (!activeModel) {
      setError("Please select a model to continue");
      return false;
    }

    return true;
  }, [activeProvider, activeModel, apiKeys, setError]);

  // Helper function to handle streaming response
  const handleStreamingResponse = useCallback(
    async (userMessage: Message, aiMessageId: string) => {
      if (!activeProvider) {
        setError("No provider selected");
        return;
      }

      const modelToUse = activeModel || activeProvider.models[0];

      await streamMessage(
        [...messages, userMessage],
        activeProvider.id,
        apiKeys[activeProvider.id],
        modelToUse,
        settings,
        {
          onToken: (token: string) => {
            updateAIMessage(aiMessageId, {
              text:
                messages.find((m) => m.id === aiMessageId)?.text + token ||
                token,
            });
          },
          onComplete: () => {
            updateAIMessage(aiMessageId, {
              status: "sent",
            });
            setIsLoading(false);
          },
          onError: (err: LLMError) => {
            updateAIMessage(aiMessageId, {
              text: `Error: ${err.message}`,
              status: "error",
              error: err,
            });
            setError(err.message);
            setIsLoading(false);
          },
        },
      );
    },
    [
      messages,
      activeProvider,
      activeModel,
      apiKeys,
      settings,
      streamMessage,
      updateAIMessage,
      setIsLoading,
      setError,
    ],
  );

  // Helper function to handle standard response
  const handleStandardResponse = useCallback(
    async (userMessage: Message, aiMessageId: string) => {
      if (!activeProvider) {
        setError("No provider selected");
        return;
      }

      const modelToUse = activeModel || activeProvider.models[0];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            provider: activeProvider.id,
            apiKey: apiKeys[activeProvider.id],
            model: modelToUse,
            settings,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Update the AI response
        updateAIMessage(aiMessageId, {
          text: data.text,
          status: "sent",
        });
        setIsLoading(false);
      } catch (error) {
        console.error(`Error calling ${activeProvider?.id}:`, error);

        // Update the AI message with error
        updateAIMessage(aiMessageId, {
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          status: "error",
          error: error instanceof Error ? error : new Error("Unknown error"),
        });

        setError(
          error instanceof Error
            ? error.message
            : `An error occurred while calling the ${activeProvider?.id} API`,
        );
        setIsLoading(false);
      }
    },
    [
      messages,
      activeProvider,
      activeModel,
      apiKeys,
      settings,
      updateAIMessage,
      setIsLoading,
      setError,
    ],
  );

  // Send a message to the AI
  const sendMessage = useCallback(
    async (text: string) => {
      // Clear any previous errors
      setError(null);

      // Validate requirements
      if (!validateMessageRequirements()) {
        return;
      }

      // Create user message using the addUserMessage function
      const userMessage = addUserMessage(text);
      if (!userMessage) return;

      // Create AI message placeholder
      if (!activeProvider) {
        setError("No provider selected");
        return;
      }

      const modelToUse = activeModel || activeProvider.models[0];
      const aiMessageId = addAIMessage(activeProvider, modelToUse);

      // Set loading state
      setIsLoading(true);

      // Use streaming if available, otherwise use standard API
      if (isStreamingSupported()) {
        await handleStreamingResponse(userMessage, aiMessageId);
      } else {
        await handleStandardResponse(userMessage, aiMessageId);
      }
    },
    [
      validateMessageRequirements,
      addUserMessage,
      activeProvider,
      activeModel,
      addAIMessage,
      setIsLoading,
      isStreamingSupported,
      handleStreamingResponse,
      handleStandardResponse,
      setError,
    ],
  );

  // Handle retry for failed messages
  const handleRetry = useCallback(
    (messageId: string) => {
      handleMessageRetry(messageId, sendMessage);
    },
    [handleMessageRetry, sendMessage],
  );

  // Create the context value
  const value = useMemo<ChatContextValue>(() => ({
    // Messages
    messages,
    isLoading,
    error,

    // Provider and model selection
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    handleApiKeyChange,
    isProviderConfigured,
    isStreamingSupported,
    supportedProviders,

    // Settings
    settings,
    setSettings,
    useStreaming,
    setUseStreaming,

    // Actions
    addUserMessage,
    sendMessage,
    handleRetry,
    clearError,
    abortStream,
  }), [
    messages,
    isLoading,
    error,
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    handleApiKeyChange,
    isProviderConfigured,
    isStreamingSupported,
    supportedProviders,
    settings,
    setSettings,
    useStreaming,
    setUseStreaming,
    addUserMessage,
    sendMessage,
    handleRetry,
    clearError,
    abortStream
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
