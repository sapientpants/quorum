import { ApiKeyTestResult } from '../components/api-key-management/api-key-test-modal'

export async function testApiKey(providerId: string, apiKey: string): Promise<ApiKeyTestResult> {
  switch (providerId) {
    case 'openai':
      return testOpenAIKey(apiKey)
    case 'anthropic':
      return testAnthropicKey(apiKey)
    case 'grok':
      return testGrokKey(apiKey)
    case 'google':
      return testGoogleKey(apiKey)
    default:
      throw new Error(`Unknown provider: ${providerId}`)
  }
}

async function testOpenAIKey(apiKey: string): Promise<ApiKeyTestResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Invalid API key')
    }

    const data = await response.json()
    const models = data.data.map((model: { id: string }) => model.id)

    return {
      success: true,
      message: 'API key is valid',
      models
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to validate API key',
      models: []
    }
  }
}

async function testAnthropicKey(apiKey: string): Promise<ApiKeyTestResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Invalid API key')
    }

    const data = await response.json()
    const models = data.models.map((model: { id: string }) => model.id)

    return {
      success: true,
      message: 'API key is valid',
      models
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to validate API key',
      models: []
    }
  }
}

async function testGrokKey(_apiKey: string): Promise<ApiKeyTestResult> {
  void _apiKey; // Added to prevent unused variable error
  // Note: Replace with actual Grok API endpoint when available
  return {
    success: false,
    message: 'Grok API validation not yet implemented',
    models: []
  }
}

async function testGoogleKey(apiKey: string): Promise<ApiKeyTestResult> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Invalid API key')
    }

    const data = await response.json()
    const models = data.models.map((model: { name: string }) => model.name)

    return {
      success: true,
      message: 'API key is valid',
      models
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to validate API key',
      models: []
    }
  }
} 