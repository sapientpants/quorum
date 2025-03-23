import { useChat } from "../hooks/useChat";
import { useTranslation } from "react-i18next";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import ProviderSelector from "./ProviderSelector";
import ModelSelector from "./ModelSelector";
import SettingsPanel from "./SettingsPanel";
import ErrorDisplay from "./ErrorDisplay";

function Chat() {
  const { t } = useTranslation();
  const {
    messages,
    isLoading,
    error,
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    isStreamingSupported,
    supportedProviders,
    settings,
    setSettings,
    useStreaming,
    setUseStreaming,
    sendMessage,
    handleRetry,
    clearError,
  } = useChat();

  const isInputEnabled = activeProvider && activeModel;

  return (
    <div className="chat-container flex flex-col h-full">
      <div className="flex items-center space-x-4 p-4 border-b">
        <ProviderSelector
          providers={supportedProviders}
          activeProvider={activeProvider}
          onSelect={setActiveProvider}
          apiKeys={apiKeys}
        />

        {activeProvider && (
          <ModelSelector
            models={availableModels}
            selectedModel={activeModel ?? undefined}
            onSelect={setActiveModel}
          />
        )}

        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          useStreaming={useStreaming}
          onStreamingChange={setUseStreaming}
          isStreamingSupported={isStreamingSupported()}
        />
      </div>

      {error && <ErrorDisplay error={error} onDismiss={clearError} />}

      <div className="flex-1 overflow-auto p-4">
        <ChatList
          messages={messages}
          isLoading={isLoading}
          onRetry={handleRetry}
        />
      </div>

      <div className="p-4 border-t">
        <ChatInput
          onSendMessage={sendMessage}
          disabled={!isInputEnabled}
          isLoading={isLoading}
          placeholder={t("chat.input.placeholder")}
        />
      </div>
    </div>
  );
}

export default Chat;
