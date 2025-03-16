import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import ApiKeyManager from "../ApiKeyManager";
import { usePreferencesStore } from "../../store/preferencesStore";
import { Icon } from "@iconify/react";

interface ApiKeyStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ApiKeyStep({ onNext, onBack }: ApiKeyStepProps) {
  const { t } = useTranslation();
  const { preferences } = usePreferencesStore();
  const [hasApiKeys, setHasApiKeys] = useState(false);

  // Check if any API keys exist in local or session storage
  useEffect(() => {
    function checkApiKeys(): boolean {
      // Check individual provider keys
      const providers = ["openai", "anthropic", "grok", "google"];
      for (const provider of providers) {
        if (
          localStorage.getItem(`${provider}_api_key`) ||
          sessionStorage.getItem(`${provider}_api_key`)
        ) {
          return true;
        }
      }
      return false;
    }

    setHasApiKeys(checkApiKeys());

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      setHasApiKeys(checkApiKeys());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function handleApiKeyChange(provider: string, key: string) {
    // Store in localStorage or sessionStorage based on preference
    if (key) {
      if (preferences.keyStoragePreference === "local") {
        localStorage.setItem(`${provider}_api_key`, key);
      } else if (preferences.keyStoragePreference === "session") {
        sessionStorage.setItem(`${provider}_api_key`, key);
      }
      // If preference is 'none', the key won't be stored persistently

      setHasApiKeys(true);
    } else {
      localStorage.removeItem(`${provider}_api_key`);
      sessionStorage.removeItem(`${provider}_api_key`);

      // Check if any keys remain
      const providers = ["openai", "anthropic", "grok", "google"];
      let anyKeysRemain = false;
      for (const p of providers) {
        if (
          p !== provider &&
          (localStorage.getItem(`${p}_api_key`) ||
            sessionStorage.getItem(`${p}_api_key`))
        ) {
          anyKeysRemain = true;
          break;
        }
      }
      setHasApiKeys(anyKeysRemain);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("wizard.apiKeys.title")}</h2>
        <p className="text-muted-foreground">
          {t("wizard.apiKeys.description")}
        </p>
      </div>

      <ApiKeyManager
        onApiKeyChange={handleApiKeyChange}
        storageOption={{ storage: preferences.keyStoragePreference }}
      />

      {!hasApiKeys && (
        <div className="bg-warning/20 border border-warning/50 text-warning-content rounded-md p-4 mt-4">
          <div className="flex items-start gap-2">
            <Icon
              icon="solar:danger-triangle-bold"
              className="h-5 w-5 mt-0.5"
            />
            <p className="text-sm">
              {t(
                "wizard.apiKeys.noKeyWarning",
                "You need at least one valid API key to continue. Please add an API key above.",
              )}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          {t("wizard.navigation.back")}
        </Button>

        <Button
          onClick={onNext}
          disabled={!hasApiKeys}
          variant="default"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {t("wizard.navigation.next")}
        </Button>
      </div>
    </div>
  );
}
