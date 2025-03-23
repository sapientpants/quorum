import { useState, useEffect } from "react";
import type { ApiKeyStorageOptions } from "../types/api";
import type { LLMProviderId } from "../types/llm";
import { LLM_PROVIDERS } from "../types/llm";
import {
  saveApiKeys,
  loadApiKeys,
  clearApiKeys,
  createApiKey,
} from "../services/apiKeyService";
import { Icon } from "@iconify/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "react-i18next";

interface ApiKeyManagerProps {
  readonly onApiKeyChange: (provider: string, apiKey: string) => void;
  readonly storageOption?: ApiKeyStorageOptions;
}

function ApiKeyManager({
  onApiKeyChange,
  storageOption = { storage: "local" },
}: ApiKeyManagerProps) {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<Record<LLMProviderId, string>>({
    openai: "",
    anthropic: "",
    google: "",
    grok: "",
  });
  const [isVisible, setIsVisible] = useState<Record<LLMProviderId, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
    grok: false,
  });
  const [statusMessages, setStatusMessages] = useState<
    Record<LLMProviderId, { type: "success" | "error"; message: string } | null>
  >({
    openai: null,
    anthropic: null,
    google: null,
    grok: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [storageType] = useState<"local" | "session" | "none">(
    storageOption.storage,
  );

  // Provider info with placeholders and descriptions
  const providerInfo = {
    openai: {
      placeholder: "sk-...",
      description: t("settings.apiKeyManager.openaiDescription"),
    },
    anthropic: {
      placeholder: "sk-ant-...",
      description: t("settings.apiKeyManager.anthropicDescription"),
    },
    google: {
      placeholder: t("settings.apiKeyManager.enterApiKey"),
      description: t("settings.apiKeyManager.googleDescription"),
    },
    grok: {
      placeholder: "grok-...",
      description: t("settings.apiKeyManager.grokDescription"),
    },
  };

  // Load API keys from storage on component mount
  useEffect(() => {
    const loadStoredKeys = async () => {
      setIsLoading(true);
      const savedKeys = loadApiKeys({ storage: storageType });
      const keyMap: Record<LLMProviderId, string> = {
        openai: "",
        anthropic: "",
        google: "",
        grok: "",
      };

      if (savedKeys.length > 0) {
        // Group keys by provider and use the first one for each
        const providerMap = new Map<string, string>();
        savedKeys.forEach((key) => {
          if (!providerMap.has(key.provider)) {
            providerMap.set(key.provider, key.key);
            keyMap[key.provider] = key.key;
            onApiKeyChange(key.provider, key.key);
          }
        });
      }

      setApiKeys(keyMap);
      setIsLoading(false);
    };

    loadStoredKeys();
  }, [onApiKeyChange, storageType]);

  // Toggle visibility of an API key
  function toggleKeyVisibility(provider: LLMProviderId) {
    setIsVisible((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  }

  // Handle API key change
  function handleApiKeyChange(provider: LLMProviderId, value: string) {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: value,
    }));

    // Save the key
    if (value) {
      // Create and add the new key
      const newKey = createApiKey(provider, value);

      // Get existing keys
      const savedKeys = loadApiKeys({ storage: storageType });

      // Remove any existing keys for this provider
      const filteredKeys = savedKeys.filter((key) => key.provider !== provider);

      // Add the new key
      saveApiKeys([...filteredKeys, newKey], { storage: storageType });

      // Show success message
      setStatusMessages((prev) => ({
        ...prev,
        [provider]: {
          type: "success",
          message: t("settings.apiKeyManager.saved"),
        },
      }));

      // Clear success message after 2 seconds
      setTimeout(() => {
        setStatusMessages((prev) => ({
          ...prev,
          [provider]: null,
        }));
      }, 2000);
    } else {
      // Remove the key
      const savedKeys = loadApiKeys({ storage: storageType });
      const filteredKeys = savedKeys.filter((key) => key.provider !== provider);
      saveApiKeys(filteredKeys, { storage: storageType });
    }

    // Notify parent about the key change
    onApiKeyChange(provider, value);
  }

  // Clear all API keys
  function handleClearAllKeys() {
    if (confirm(t("settings.apiKeyManager.clearConfirmation"))) {
      clearApiKeys({ storage: storageType });

      // Reset state
      setApiKeys({
        openai: "",
        anthropic: "",
        google: "",
        grok: "",
      });

      // Notify parent that all keys are gone
      Object.keys(apiKeys).forEach((provider) => {
        onApiKeyChange(provider, "");
      });
    }
  }

  if (isLoading) {
    return <div className="py-2">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Direct API Key Inputs */}
      <div className="space-y-6">
        {LLM_PROVIDERS.map((provider) => (
          <div key={provider.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`${provider.id}-api-key`}
                  className="text-base font-medium"
                >
                  {provider.displayName}
                </Label>
                {apiKeys[provider.id] && (
                  <span
                    className="inline-flex h-2 w-2 rounded-full bg-green-500"
                    title={t("settings.apiKeyManager.keyPresent")}
                  ></span>
                )}
              </div>
              {statusMessages[provider.id] && (
                <span
                  className={`text-sm ${statusMessages[provider.id]?.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {statusMessages[provider.id]?.message}
                </span>
              )}
            </div>

            <div className="relative">
              <Input
                id={`${provider.id}-api-key`}
                type={isVisible[provider.id] ? "text" : "password"}
                value={apiKeys[provider.id]}
                onChange={(e) =>
                  handleApiKeyChange(provider.id, e.target.value)
                }
                placeholder={providerInfo[provider.id]?.placeholder}
                className="font-mono pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => toggleKeyVisibility(provider.id)}
                aria-label={
                  isVisible[provider.id]
                    ? t("settings.apiKeyManager.hideKey")
                    : t("settings.apiKeyManager.showKey")
                }
              >
                <Icon
                  icon={
                    isVisible[provider.id]
                      ? "solar:eye-closed-linear"
                      : "solar:eye-linear"
                  }
                  className="h-4 w-4"
                />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {providerInfo[provider.id]?.description}
            </p>
          </div>
        ))}
      </div>

      {/* Clear All Keys Button */}
      <div className="pt-2">
        <Button variant="error" size="sm" onClick={handleClearAllKeys}>
          <Icon
            icon="solar:trash-bin-trash-linear"
            className="mr-1.5 h-4 w-4"
          />
          {t("settings.apiKeyManager.clearAllKeys")}
        </Button>
      </div>
    </div>
  );
}

// Add default export
export default ApiKeyManager;
