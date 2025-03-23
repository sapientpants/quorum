/**
 * Template interface for storing round table configurations
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  participantIds: string[]; // IDs of participants in order
  defaultConversationStarter?: string; // Optional initial message to start the conversation
  createdAt: number;
  updatedAt: number;
}

/**
 * Type for template creation form data
 */
export type TemplateFormData = Omit<Template, "id" | "createdAt" | "updatedAt">;

/**
 * Helper function to create a new template
 */
export function createTemplate(
  data: Partial<Template> & Pick<Template, "name">,
): Template {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description ?? "",
    participantIds: data.participantIds ?? [],
    defaultConversationStarter: data.defaultConversationStarter,
    createdAt: now,
    updatedAt: now,
  };
}
