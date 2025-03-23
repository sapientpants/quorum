// Grok-specific interfaces
export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GrokResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrokStreamChunk {
  choices: {
    delta?: {
      content: string;
    };
  }[];
}
