import type { LLMModel } from '../types/llm'

interface ModelSelectorProps {
  models: string[]
  activeModel: LLMModel | null
  onSelect: (model: string) => void
}

function ModelSelector({ models, activeModel, onSelect }: ModelSelectorProps) {
  if (models.length === 0) {
    return null
  }

  return (
    <div>
      <label className="label">
        <span className="label-text">Select Model</span>
      </label>
      <select
        className="select select-bordered w-full"
        value={activeModel || ''}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="" disabled>
          Select a model
        </option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ModelSelector