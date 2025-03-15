import type { LLMProvider } from '../types/llm'

interface ProviderSelectorProps {
  providers: LLMProvider[]
  activeProvider: LLMProvider | null
  onSelect: (provider: LLMProvider) => void
  apiKeys: Record<string, string>
}

function ProviderSelector({
  providers,
  activeProvider,
  onSelect,
  apiKeys
}: ProviderSelectorProps) {
  return (
    <div>
      <label className="label">
        <span className="label-text">Select Provider</span>
      </label>
      <div className="btn-group">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`btn btn-sm ${provider.id === activeProvider?.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => onSelect(provider)}
            disabled={!apiKeys[provider.id]}
          >
            {provider.displayName}
            {!apiKeys[provider.id] && ' (No API Key)'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProviderSelector
