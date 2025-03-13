import React from 'react'

export interface ApiKeyTestResult {
  success: boolean
  message: string
  models: string[]
}

interface ApiKeyTestModalProps {
  isOpen: boolean
  testResult: ApiKeyTestResult
  onClose: () => void
}

export function ApiKeyTestModal({ isOpen, testResult, onClose }: ApiKeyTestModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">API Key Test Results</h2>
        <p className="mb-4">{testResult.message}</p>
        {testResult.success && testResult.models.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold">Available Models:</h3>
            <ul className="list-disc list-inside">
              {testResult.models.map((model) => (
                <li key={model}>{model}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  )
} 