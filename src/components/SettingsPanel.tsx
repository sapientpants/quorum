import type { LLMSettings } from "../types/llm";

interface SettingsPanelProps {
  readonly settings: LLMSettings;
  readonly onSettingsChange: (settings: LLMSettings) => void;
  readonly useStreaming: boolean;
  readonly onStreamingChange: (useStreaming: boolean) => void;
  readonly isStreamingSupported: boolean;
}

function SettingsPanel({
  settings,
  onSettingsChange,
  useStreaming,
  onStreamingChange,
  isStreamingSupported,
}: SettingsPanelProps) {
  return (
    <div className="mb-4 collapse collapse-arrow bg-base-200">
      <label>
        <input type="checkbox" className="collapse-checkbox" />
        <div className="collapse-title font-medium">Advanced Settings</div>
      </label>
      <div className="collapse-content grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperature */}
        <div>
          <label className="block">
            <span className="label-text block">Temperature</span>
            <span className="label-text-alt block">{settings.temperature}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="range range-sm w-full"
              value={settings.temperature}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  temperature: parseFloat(e.target.value),
                })
              }
            />
          </label>
          <div className="flex justify-between text-xs opacity-70">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Maximum Length */}
        <div>
          <label className="block">
            <span className="label-text block">Maximum Length</span>
            <span className="label-text-alt block">{settings.maxTokens}</span>
            <input
              type="range"
              min="500"
              max="4000"
              step="100"
              className="range range-sm w-full"
              value={settings.maxTokens}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  maxTokens: parseInt(e.target.value),
                })
              }
            />
          </label>
          <div className="flex justify-between text-xs opacity-70">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>

        {/* Streaming toggle (only show if supported) */}
        {isStreamingSupported && (
          <div className="form-control">
            <label className="cursor-pointer flex items-center gap-2">
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
  );
}

export default SettingsPanel;
