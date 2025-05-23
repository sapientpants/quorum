import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ApiKeyInputProps {
  readonly onApiKeyChange: (apiKey: string) => void;
  readonly initialApiKey?: string;
}

export function ApiKeyInput({
  onApiKeyChange,
  initialApiKey = "",
}: Readonly<ApiKeyInputProps>) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isVisible, setIsVisible] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    }
  }, [apiKey]);

  function handleApiKeyChange(newApiKey: string) {
    setApiKey(newApiKey);
    onApiKeyChange(newApiKey);
  }

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{t("apiKeys.openai.label")}</span>
      </label>
      <div className="input-group">
        <input
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder={t("apiKeys.openai.placeholder")}
          className="input input-bordered w-full"
        />
        <button
          type="button"
          className="btn btn-square"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={
            isVisible
              ? t("common.actions.hideKey")
              : t("common.actions.showKey")
          }
        >
          {isVisible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      <label className="label">
        <span className="label-text-alt text-warning">
          {t("apiKeys.setup.storageNote")}
        </span>
      </label>
    </div>
  );
}
