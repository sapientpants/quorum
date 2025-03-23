# LLM Client Migration Guide

This document guides you through the migration from the old LLM client implementation to the new, refactored architecture.

## Overview of Changes

The LLM client architecture has been refactored to:

1. Reduce code duplication
2. Provide consistent error handling
3. Standardize the interface for all providers
4. Make it easier to add new providers

## Migration Steps

### 1. Update Imports

**Old imports:**

```typescript
// Direct client imports
import { OpenAIClient } from "../../services/llm/openaiClient";
import { AnthropicClient } from "../../services/llm/anthropicClient";
import { GrokClient } from "../../services/llm/grokClient";
import { GoogleClient } from "../../services/llm/googleClient";

// Factory import
import { getLLMClient } from "../../services/llm/LLMClientFactory";
```

**New imports:**

```typescript
// Use the central index for all imports
import {
  OpenAIClient,
  AnthropicClient,
  GrokClient,
  GoogleClient,
  LLMClientFactory,
  LLMService,
} from "../../services/llm";

// Or import the service directly
import LLMService from "../../services/llm";
```

### 2. Use the Factory and Service

**Old usage:**

```typescript
// Get a client directly
const openaiClient = new OpenAIClient();

// Or use the factory
const client = getLLMClient("openai");
```

**New usage:**

```typescript
// Get a client through the service (recommended)
const openaiClient = LLMService.getClient("openai");

// Or use the factory directly
const client = LLMClientFactory.getLLMClient("openai");
```

### 3. Error Handling

**Old error handling:**

```typescript
try {
  const response = await client.sendMessage(messages, apiKey, model, settings);
  // Process response
} catch (error) {
  if (error.name === "OpenAIError") {
    // Handle OpenAI error
  } else if (error.name === "AnthropicError") {
    // Handle Anthropic error
  } else {
    // Handle generic error
  }
}
```

**New error handling:**

```typescript
import { LLMError, LLMErrorType } from "../../services/llm";

try {
  const response = await client.sendMessage(messages, apiKey, model, settings);
  // Process response
} catch (error) {
  if (error instanceof LLMError) {
    // Handle specific error types consistently
    switch (error.type) {
      case LLMErrorType.AUTHENTICATION:
        // Show authentication error UI
        console.error("Authentication error:", error.getUserMessage());
        break;
      case LLMErrorType.RATE_LIMIT:
        // Show rate limit error UI
        console.error("Rate limit error:", error.getUserMessage());
        break;
      // Handle other error types...
      default:
        console.error("API error:", error.getUserMessage());
    }

    // Get suggestions for the user
    const suggestions = error.getSuggestions();
    // Display suggestions to the user
  } else {
    // Handle non-LLM errors
    console.error("Unexpected error:", error);
  }
}
```

### 4. Streaming

**Old streaming usage:**

```typescript
const streamingOptions = {
  onToken: (token) => {
    // Handle token
  },
  onComplete: (fullText) => {
    // Handle complete text
  },
  onError: (error) => {
    // Handle error
  },
};

client.sendMessage(messages, apiKey, model, settings, streamingOptions);
```

**New streaming usage (callback-based):**

```typescript
// Callback-based streaming (compatible with old code)
const streamingOptions = {
  onToken: (token) => {
    // Handle token
  },
  onComplete: (fullText) => {
    // Handle complete text
  },
  onError: (error) => {
    // Handle error (now error will be an LLMError)
  },
};

client.sendMessage(messages, apiKey, model, settings, streamingOptions);
```

**New streaming usage (AsyncIterable):**

```typescript
// AsyncIterable-based streaming (new approach)
async function handleStreamedResponse() {
  const abortController = new AbortController();

  try {
    const messageStream = client.streamMessage(
      messages,
      apiKey,
      model,
      settings,
      abortController.signal,
    );

    for await (const chunk of messageStream) {
      if (chunk.done) {
        if (chunk.error) {
          console.error("Stream error:", chunk.error);
        } else {
          console.log("Stream complete");
        }
        break;
      }

      if (chunk.token) {
        // Process token
        console.log("Token:", chunk.token);
      }
    }
  } catch (error) {
    console.error("Stream iteration error:", error);
  }
}

// Call the function
handleStreamedResponse();

// To abort the stream if needed
// abortController.abort();
```

### 5. API Key Validation

**Old validation:**

```typescript
// Different implementations per provider
const isValid = await client.validateApiKey(apiKey);
```

**New validation:**

```typescript
// Consistent validation across providers
const isValid = await client.validateApiKey(apiKey);

// Or use the factory/service
const isValid = await LLMService.getClient("openai").validateApiKey(apiKey);
```

## Breaking Changes

1. **Error Handling**: All provider-specific errors have been replaced with the standardized `LLMError` class. Check for `LLMError` instead of provider-specific errors.

2. **API Key Validation**: The validation method now returns a Promise<boolean> for all providers, regardless of implementation details.

3. **Model Types**: The model parameters should explicitly use the types from `LLMModel` union type.

4. **Streaming**: The old streaming approach still works, but for new code, consider using the AsyncIterable-based streaming which offers more control.

## Benefits of the New Architecture

1. **Reduced Duplication**: Common functionality is now in the base class
2. **Unified Error Handling**: All providers use the same error system
3. **Consistent API**: All clients implement the same interface
4. **Improved Maintainability**: Changes to common functionality only need to be made once
5. **Easier Testing**: The architecture is more modular and testable
6. **Simplified Provider Addition**: Clear pattern for adding new providers

## Questions or Issues

If you encounter any issues during migration, please:

1. Check the implementation guide for the specific component
2. Look at the TypeScript types for guidance
3. Contact the development team for assistance
