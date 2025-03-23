import { useTranslation } from "react-i18next";
import type { LLMProvider } from "../types/llm";

interface ProviderSelectorProps {
  providers: LLMProvider[];
  activeProvider: LLMProvider | null;
  onSelect: (provider: LLMProvider) => void;
  apiKeys: Record<string, string>;
}

function ProviderSelector({
  providers,
  activeProvider,
  onSelect,
  apiKeys,
}: ProviderSelectorProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="label">
        <span className="label-text">
          {t("providerSelector.selectProvider")}
        </span>
      </label>
      <div className="btn-group">
        {providers.map((provider) => {
          const isActive = provider.id === activeProvider?.id;
          const hasApiKey = !!apiKeys[provider.id];

          return (
            <button
              key={provider.id}
              className={`btn btn-sm ${
                isActive ? "btn-primary bg-primary" : "btn-outline"
              } ${hasApiKey ? "hover:bg-primary" : ""}`}
              onClick={() => onSelect(provider)}
              disabled={!hasApiKey}
            >
              {provider.displayName}
              {!hasApiKey && ` (${t("providerSelector.configureApiKey")})`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProviderSelector;
