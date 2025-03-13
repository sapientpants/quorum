import { useState } from 'react'

function ApiKeySetupScreen() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    grok: '',
    google: ''
  })

  const [storageOption, setStorageOption] = useState<'local' | 'session' | 'none'>('local')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">API Key Setup</h2>
      <form className="w-full max-w-md bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">OpenAI API Key</label>
          <input
            type="text"
            value={apiKeys.openai}
            onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
            placeholder="Enter your OpenAI API key"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            <a
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              How to get an API key
            </a>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Anthropic API Key</label>
          <input
            type="text"
            value={apiKeys.anthropic}
            onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
            placeholder="Enter your Anthropic API key"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            <a
              href="https://www.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              How to get an API key
            </a>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Grok API Key</label>
          <input
            type="text"
            value={apiKeys.grok}
            onChange={(e) => setApiKeys({ ...apiKeys, grok: e.target.value })}
            placeholder="Enter your Grok API key"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            <a
              href="https://grok.example.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              How to get an API key
            </a>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Google AI API Key</label>
          <input
            type="text"
            value={apiKeys.google}
            onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
            placeholder="Enter your Google AI API key"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            <a
              href="https://cloud.google.com/docs/authentication/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              How to get an API key
            </a>
          </p>
        </div>
        <div className="mb-4">
          <p className="font-semibold mb-2">Storage Preference:</p>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storageOption"
                value="local"
                checked={storageOption === 'local'}
                onChange={() => setStorageOption('local')}
                className="form-radio"
              />
              <span className="ml-2">Local Storage</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storageOption"
                value="session"
                checked={storageOption === 'session'}
                onChange={() => setStorageOption('session')}
                className="form-radio"
              />
              <span className="ml-2">Session Storage</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storageOption"
                value="none"
                checked={storageOption === 'none'}
                onChange={() => setStorageOption('none')}
                className="form-radio"
              />
              <span className="ml-2">No Storage</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

export default ApiKeySetupScreen 