import { useState, useEffect, useCallback } from "react";
import type { LLMProvider, LLMModel } from "../types/llm";
import { LLM_PROVIDERS } from "../types/llm";
import {
  getAvailableModels,
  getDefaultModel,
  supportsStreaming,
} from "../services/llm";

export function useProviderSelection() {
  const [activeProvider, setActiveProvider] = useState<LLMProvider | null>(
    null,
  );
  const [activeModel, setActiveModel] = useState<LLMModel | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Update available models when provider changes
  useEffect(() => {
    if (activeProvider) {
      const models = getAvailableModels(activeProvider.id);
      setAvailableModels(models);

      // Set default model for the provider
      const defaultModel = getDefaultModel(activeProvider.id);
      setActiveModel(defaultModel);
    } else {
      setAvailableModels([]);
      setActiveModel(null);
    }
  }, [activeProvider]);

  const handleApiKeyChange = useCallback((provider: string, apiKey: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: apiKey,
    }));
  }, []);

  const isProviderConfigured = useCallback(
    (provider: LLMProvider) => {
      return !!apiKeys[provider.id];
    },
    [apiKeys],
  );

  const isStreamingSupported = useCallback(() => {
    return activeProvider ? supportsStreaming(activeProvider.id) : false;
  }, [activeProvider]);

  const getSupportedProvidersList = useCallback(() => {
    return LLM_PROVIDERS;
  }, []);

  return {
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
  };
}
