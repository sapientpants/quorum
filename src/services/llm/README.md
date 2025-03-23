# LLM Client Architecture

This directory contains the implementation of the LLM (Large Language Model) client architecture for the Quorum project.

## Architecture Overview

The architecture is designed around a common base class with provider-specific implementations:

```
LLMClient (interface)
    ↑
BaseClient (abstract class)
    ↑
    ├── AnthropicClient
    ├── OpenAIClient
    ├── GoogleClient
    └── GrokClient
```

## Core Components

- **BaseClient** (`base/BaseClient.ts`): Abstract base class that handles common functionality like error handling, request processing, and streaming.
- **LLMError** (`errors.ts`): Unified error handling system with standardized error types and user-friendly messages.

- **Provider Implementations** (`providers/`): Client implementations for different LLM providers (Anthropic, OpenAI, Google, Grok).

- **LLMClientFactory** (`LLMClientFactory.ts`): Factory for creating and caching client instances.

## Usage

```typescript
import { LLMService } from "../services/llm";

// Get a client for a specific provider
const client = LLMService.getClient("openai");

// Send a message
const response = await client.sendMessage(messages, apiKey, model, settings);

// Stream a message with callbacks
const streamingOptions = {
  onToken: (token) => {
    // Process token
  },
  onComplete: (fullText) => {
    // Process complete response
  },
};

await client.sendMessage(messages, apiKey, model, settings, streamingOptions);

// Stream a message with async iterator
const stream = client.streamMessage(messages, apiKey, model, settings);
for await (const chunk of stream) {
  if (chunk.done) break;
  if (chunk.token) {
    // Process token
  }
}
```

## Error Handling

```typescript
import { LLMError, LLMErrorType } from "../services/llm";

try {
  const response = await client.sendMessage(messages, apiKey, model);
} catch (error) {
  if (error instanceof LLMError) {
    switch (error.type) {
      case LLMErrorType.AUTHENTICATION:
        // Handle authentication error
        console.error(error.getUserMessage());
        break;
      // Handle other error types...
    }
  }
}
```

## Migration Status

The codebase has been refactored to use this new architecture. The old implementation files have been kept temporarily for reference and backward compatibility:

1. ✅ New architecture implemented
2. ✅ Core functionality tested
3. ✅ Critical references updated
4. ❌ Old implementation files removed

## Completing the Migration

To complete the migration:

1. Update any remaining references to old client implementations:

   - `import { OpenAIClient } from "../services/llm/openaiClient"` → `import { OpenAIClient } from "../services/llm"`
   - `import { LLMError } from "../services/llm/LLMError"` → `import { LLMError } from "../services/llm"`

2. Run the cleanup script to remove old implementation files:
   ```bash
   cd src/services/llm
   chmod +x cleanup.sh
   ./cleanup.sh
   ```

## Adding a New Provider

To add a new LLM provider:

1. Create a new client class in `providers/` that extends `BaseClient`
2. Implement all required abstract methods
3. Update `LLMClientFactory` to support the new provider
4. Add appropriate type definitions

See `migration.md` for more detailed instructions.
