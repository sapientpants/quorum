import { LLMModel } from "@/types/llm";
import { useTranslation } from "react-i18next";

export interface ModelSelectorProps {
  models: LLMModel[];
  onSelect: (model: LLMModel) => void;
  selectedModel?: LLMModel;
}

function ModelSelector({ models, selectedModel, onSelect }: ModelSelectorProps) {
  const { t } = useTranslation();

  if (models.length === 0) {
    return null;
  }

  return (
    <div>
      <label className="label">
        <span className="label-text">{t("modelSelector.selectModel")}</span>
      </label>
      <select
        className="select select-bordered w-full"
        value={selectedModel || ""}
        onChange={(e) => onSelect(e.target.value as LLMModel)}
      >
        <option value="" disabled>
          {t("modelSelector.selectAModel")}
        </option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModelSelector;
