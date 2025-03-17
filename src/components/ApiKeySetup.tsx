import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ApiKey, ApiKeyStorageOptions } from "../types/api";
import type { LLMProviderId } from "../types/llm";
import { validateApiKey } from "../services/apiKeyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";

interface ApiKeySetupProps {
  onComplete: () => void;
  initialKeys?: ApiKey[];
  storageType?: ApiKeyStorageOptions["storage"];
}

export function ApiKeySetup({
  onComplete,
  initialKeys = [],
  storageType = "session",
}: ApiKeySetupProps) {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<Record<LLMProviderId, string>>({
    openai: "",
    anthropic: "",
    grok: "",
    google: "",
  });
  const [errors, setErrors] = useState<Record<LLMProviderId, string | null>>({
    openai: null,
    anthropic: null,
    grok: null,
    google: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial keys if provided
  useEffect(() => {
    const defaultKeys: Record<LLMProviderId, string> = {
      openai: "",
      anthropic: "",
      grok: "",
      google: "",
    };
    if (initialKeys.length > 0) {
      const keyMap = initialKeys.reduce(
        (acc, key) => {
          acc[key.provider] = key.key;
          return acc;
        },
        {} as Record<LLMProviderId, string>,
      );
      setApiKeys({ ...defaultKeys, ...keyMap });
    }
  }, [initialKeys]);

  function handleKeyChange(provider: LLMProviderId, value: string) {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [provider]: null }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const newErrors: Record<LLMProviderId, string | null> = {
      openai: null,
      anthropic: null,
      grok: null,
      google: null,
    };

    // Validate at least one key is provided
    if (
      !apiKeys.openai &&
      !apiKeys.anthropic &&
      !apiKeys.grok &&
      !apiKeys.google
    ) {
      setErrors({
        openai: t("apiKeys.errors.atLeastOneRequired"),
        anthropic: null,
        grok: null,
        google: null,
      });
      setIsSubmitting(false);
      return;
    }

    // Validate each provided key
    for (const [provider, key] of Object.entries(apiKeys)) {
      if (key) {
        const validation = validateApiKey(provider, key);
        if (!validation.isValid) {
          newErrors[provider as LLMProviderId] =
            validation.message || "Invalid API key";
        }
      }
    }

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== null)) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Store keys based on storage preference
    if (storageType !== "none") {
      const storage = storageType === "local" ? localStorage : sessionStorage;
      Object.entries(apiKeys).forEach(([provider, key]) => {
        if (key) {
          storage.setItem(`${provider}_api_key`, key);
        }
      });
    }

    setIsSubmitting(false);
    setIsLoading(true);
    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative bg-card p-8 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl -z-10"></div>

      <h2 className="text-2xl font-bold mb-4 text-foreground">
        {t("apiKeys.setup.title")}
      </h2>
      <p className="text-foreground/70 mb-8">
        {t("apiKeys.setup.description")}
      </p>

      {/* OpenAI API Key */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="openai" className="text-base">
              {t("apiKeys.openai.label")}
            </Label>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              {t("apiKeys.openai.getKey")}
            </a>
          </div>
          <Input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="openai"
            placeholder={t("apiKeys.openai.placeholder")}
            type="password"
            value={apiKeys.openai}
            onBlur={(e) => {
              if (!e.target.value.startsWith("sk-")) {
                setErrors((prev) => ({
                  ...prev,
                  openai: t("apiKeys.errors.invalidKey"),
                }));
              }
            }}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, openai: "" }));
              setApiKeys({ ...apiKeys, openai: e.target.value });
            }}
          />
          {errors.openai && (
            <p
              data-testid="openai-error"
              className="error text-red-500 mt-1 text-sm"
            >
              {errors.openai}
            </p>
          )}
        </div>

        {/* Anthropic API Key */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="anthropic" className="text-base">
              {t("apiKeys.anthropic.label")}
            </Label>
            <a
              href="https://console.anthropic.com/account/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              {t("apiKeys.anthropic.getKey")}
            </a>
          </div>
          <Input
            id="anthropic"
            type="password"
            value={apiKeys.anthropic}
            onBlur={(e) => {
              if (e.target.value && !e.target.value.startsWith("sk-ant-")) {
                setErrors((prev) => ({
                  ...prev,
                  anthropic: t("apiKeys.errors.invalidKey"),
                }));
              }
            }}
            onChange={(e) =>
              handleKeyChange("anthropic" as LLMProviderId, e.target.value)
            }
            placeholder={t("apiKeys.anthropic.placeholder")}
            className={errors.anthropic ? "border-error" : ""}
          />
          {errors.anthropic && (
            <p data-testid="anthropic-error" className="text-sm text-error">
              {errors.anthropic}
            </p>
          )}
        </div>

        {/* Grok API Key */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="grok" className="text-base">
              {t("apiKeys.grok.label")}
            </Label>
            <a
              href="https://grok.x.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              {t("apiKeys.grok.getKey")}
            </a>
          </div>
          <Input
            id="grok"
            type="password"
            value={apiKeys.grok}
            onChange={(e) =>
              handleKeyChange("grok" as LLMProviderId, e.target.value)
            }
            placeholder={t("apiKeys.grok.placeholder")}
            className={errors.grok ? "border-error" : ""}
          />
          {errors.grok && (
            <p data-testid="grok-error" className="text-sm text-error">
              {errors.grok}
            </p>
          )}
        </div>

        {/* Google AI API Key */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="google" className="text-base">
              {t("apiKeys.google.label")}
            </Label>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              {t("apiKeys.google.getKey")}
            </a>
          </div>
          <Input
            id="google"
            type="password"
            value={apiKeys.google}
            onChange={(e) =>
              handleKeyChange("google" as LLMProviderId, e.target.value)
            }
            placeholder={t("apiKeys.google.placeholder")}
            className={errors.google ? "border-error" : ""}
          />
          {errors.google && (
            <p data-testid="google-error" className="text-sm text-error">
              {errors.google}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary/80 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 font-medium px-8 h-12 rounded-md shadow-lg hover:shadow-purple-600/30 transition-all inline-flex items-center justify-center gap-2 w-64 mx-auto"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          <span>{isLoading ? t("common.testing") : t("common.continue")}</span>
        </Button>
      </div>

      <p className="mt-6 text-sm text-foreground/70">
        {t("apiKeys.setup.storageNote", {
          storage:
            storageType === "none"
              ? t("apiKeys.setup.notStored")
              : t("apiKeys.setup.storedLocally"),
        })}
      </p>
    </div>
  );
}
