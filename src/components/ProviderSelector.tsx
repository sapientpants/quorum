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
        <span className="label-text">{t("providerSelector.label")}</span>
      </label>
      <div className="btn-group">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`btn btn-sm ${provider.id === activeProvider?.id ? "btn-primary" : "btn-outline"}`}
            onClick={() => onSelect(provider)}
            disabled={!apiKeys[provider.id]}
          >
            {provider.displayName}
            {!apiKeys[provider.id] && ` (${t("providerSelector.noApiKey")})`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProviderSelector;
