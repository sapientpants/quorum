import type { Message } from '../types/chat'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  max_tokens?: number
}

interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Convert our app's message format to OpenAI's format
function convertToOpenAIMessages(messages: Message[]): OpenAIMessage[] {
  return messages.map(message => {
    // Determine the role based on senderId
    let role: 'system' | 'user' | 'assistant'
    
    if (message.senderId === 'user') {
      role = 'user'
    } else if (message.senderId === 'system') {
      role = 'system'
    } else {
      role = 'assistant'
    }
    
    return {
      role,
      content: message.text
    }
  })
}

// Call the OpenAI API
export async function callOpenAI(
  messages: Message[], 
  apiKey: string, 
  model = 'gpt-4o', 
  temperature = 0.7,
  maxTokens = 1000
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required')
  }
  
  const openAIMessages = convertToOpenAIMessages(messages)
  
  const requestBody: OpenAIRequest = {
    model,
    messages: openAIMessages,
    temperature,
    max_tokens: maxTokens
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }
    
    const data: OpenAIResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }
    
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw error
  }
} 