import type { LLMProviderId } from "./llm";

type ParticipantType = "human" | "llm";

interface BaseParticipant {
  id: string;
  name: string;
  type: ParticipantType;
}

interface HumanParticipant extends BaseParticipant {
  type: "human";
}

export interface LLMParticipant extends BaseParticipant {
  type: "llm";
  provider: LLMProviderId;
  model: string;
  roleDescription?: string;
  systemPrompt: string;
  settings: {
    temperature: number;
    maxTokens: number;
  };
}

export type Participant = HumanParticipant | LLMParticipant;

// Helper function to create a new participant
export function createParticipant(
  data: Partial<Participant> & Pick<Participant, "id" | "name" | "type">,
): Participant {
  if (data.type === "human") {
    return {
      id: data.id,
      name: data.name,
      type: "human",
    };
  }

  return {
    id: data.id,
    name: data.name,
    type: "llm",
    provider: data.provider || "openai",
    model: data.model || "gpt-4o",
    systemPrompt: data.systemPrompt || "",
    settings: {
      temperature: data.settings?.temperature || 0.7,
      maxTokens: data.settings?.maxTokens || 1000,
    },
  };
}
