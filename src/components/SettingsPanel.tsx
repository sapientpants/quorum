import type { LLMSettings } from '../types/llm'

interface SettingsPanelProps {
  settings: LLMSettings
  onSettingsChange: (settings: LLMSettings) => void
  useStreaming: boolean
  onStreamingChange: (useStreaming: boolean) => void
  isStreamingSupported: boolean
}

function SettingsPanel({
  settings,
  onSettingsChange,
  useStreaming,
  onStreamingChange,
  isStreamingSupported
}: SettingsPanelProps) {
  return (
    <div className="mb-4 collapse collapse-arrow bg-base-200">
      <input type="checkbox" />
      <div className="collapse-title font-medium">Advanced Settings</div>
      <div className="collapse-content grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperature */}
        <div>
          <label className="label">
            <span className="label-text">Temperature</span>
            <span className="label-text-alt">{settings.temperature}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            className="range range-sm"
            value={settings.temperature}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                temperature: parseFloat(e.target.value)
              })
            }
          />
          <div className="flex justify-between text-xs px-2">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="label">
            <span className="label-text">Max Tokens</span>
            <span className="label-text-alt">{settings.maxTokens}</span>
          </label>
          <input
            type="range"
            min="100"
            max="4000"
            step="100"
            className="range range-sm"
            value={settings.maxTokens}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                maxTokens: parseInt(e.target.value)
              })
            }
          />
          <div className="flex justify-between text-xs px-2">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>

        {/* Streaming toggle (only show if supported) */}
        {isStreamingSupported && (
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Enable streaming</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={useStreaming}
                onChange={(e) => onStreamingChange(e.target.checked)}
              />
            </label>
            <span className="text-xs opacity-70">
              Streaming shows responses as they are generated
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPanel