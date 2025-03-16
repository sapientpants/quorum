import { describe, it, expect, vi, beforeEach } from "vitest";
import { useParticipantsStore } from "../participants";
import { type LLMParticipant } from "../../types/participant";
import { act } from "@testing-library/react";

// Mock the crypto.randomUUID function
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid"),
});

// Mock the persist middleware
vi.mock("zustand/middleware", () => ({
  persist: (config: unknown) => config,
}));

describe("participants store", () => {
  beforeEach(() => {
    // Clear the store before each test
    const { removeParticipant, participants: storeParticipants } =
      useParticipantsStore.getState();

    // Remove all participants except the default 'You' participant
    storeParticipants.forEach((p) => {
      if (p.id !== "user") {
        removeParticipant(p.id);
      }
    });

    // Reset the active participant
    useParticipantsStore.setState({ activeParticipantId: null });

    // Reset the mocks
    vi.clearAllMocks();
  });

  it("initializes with default state", () => {
    const state = useParticipantsStore.getState();

    // Check that the store has the default participant
    expect(state.participants).toHaveLength(1);
    expect(state.participants[0].id).toBe("user");
    expect(state.participants[0].name).toBe("You");
    expect(state.participants[0].type).toBe("human");

    // Check that the active participant is null
    expect(state.activeParticipantId).toBeNull();
  });

  it("adds a participant", () => {
    const { addParticipant } = useParticipantsStore.getState();

    // Add a new participant
    act(() => {
      addParticipant({
        name: "Test Participant",
        type: "llm",
        provider: "openai" as const,
        model: "gpt-4",
        systemPrompt: "You are a helpful assistant",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Get the updated state
    const updatedParticipants = useParticipantsStore.getState().participants;

    // Check that the participant was added
    expect(updatedParticipants).toHaveLength(2);
    expect(updatedParticipants[1].id).toBe("test-uuid");
    expect(updatedParticipants[1].name).toBe("Test Participant");
    expect(updatedParticipants[1].type).toBe("llm");

    // Cast to LLMParticipant to access LLM-specific properties
    const llmParticipant = updatedParticipants[1] as LLMParticipant;
    expect(llmParticipant.provider).toBe("openai");
    expect(llmParticipant.model).toBe("gpt-4");
    expect(llmParticipant.systemPrompt).toBe("You are a helpful assistant");
    expect(llmParticipant.settings.temperature).toBe(0.7);
    expect(llmParticipant.settings.maxTokens).toBe(1000);

    // Check that crypto.randomUUID was called
    expect(crypto.randomUUID).toHaveBeenCalled();
  });

  it("removes a participant", () => {
    const { addParticipant, removeParticipant } =
      useParticipantsStore.getState();

    // Add a new participant
    act(() => {
      addParticipant({
        name: "Test Participant",
        type: "llm",
        provider: "openai" as const,
        model: "gpt-4",
        systemPrompt: "You are a helpful assistant",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Get the updated state
    const updatedParticipants = useParticipantsStore.getState().participants;

    // Check that the participant was added
    expect(updatedParticipants).toHaveLength(2);

    // Remove the participant
    act(() => {
      removeParticipant("test-uuid");
    });

    // Get the updated state
    const finalParticipants = useParticipantsStore.getState().participants;

    // Check that the participant was removed
    expect(finalParticipants).toHaveLength(1);
    expect(finalParticipants[0].id).toBe("user");
  });

  it("updates a participant", () => {
    const { addParticipant, updateParticipant } =
      useParticipantsStore.getState();

    // Add a new participant
    act(() => {
      addParticipant({
        name: "Test Participant",
        type: "llm",
        provider: "openai" as const,
        model: "gpt-4",
        systemPrompt: "You are a helpful assistant",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Update the participant
    act(() => {
      updateParticipant("test-uuid", {
        name: "Updated Participant",
        // Cast to LLMParticipant to allow model property
        ...({
          model: "gpt-4-turbo",
          systemPrompt: "You are a super helpful assistant",
          settings: {
            temperature: 0.8,
            maxTokens: 2000,
          },
        } as Partial<LLMParticipant>),
      });
    });

    // Get the updated state
    const updatedParticipants = useParticipantsStore.getState().participants;

    // Cast to LLMParticipant to access LLM-specific properties
    const llmParticipant = updatedParticipants[1] as LLMParticipant;

    // Check that the participant was updated
    expect(llmParticipant.name).toBe("Updated Participant");
    expect(llmParticipant.model).toBe("gpt-4-turbo");
    expect(llmParticipant.systemPrompt).toBe(
      "You are a super helpful assistant",
    );
    expect(llmParticipant.settings.temperature).toBe(0.8);
    expect(llmParticipant.settings.maxTokens).toBe(2000);

    // Check that the type and id were not changed
    expect(llmParticipant.type).toBe("llm");
    expect(llmParticipant.id).toBe("test-uuid");
  });

  it("sets the active participant", () => {
    const { setActiveParticipant } = useParticipantsStore.getState();

    // Set the active participant
    act(() => {
      setActiveParticipant("user");
    });

    // Get the updated state
    const activeParticipantId =
      useParticipantsStore.getState().activeParticipantId;

    // Check that the active participant was set
    expect(activeParticipantId).toBe("user");

    // Set the active participant to null
    act(() => {
      setActiveParticipant(null);
    });

    // Get the updated state
    const finalActiveParticipantId =
      useParticipantsStore.getState().activeParticipantId;

    // Check that the active participant was set to null
    expect(finalActiveParticipantId).toBeNull();
  });

  it("reorders participants", () => {
    const { addParticipant, reorderParticipants } =
      useParticipantsStore.getState();

    // Add two new participants
    act(() => {
      addParticipant({
        name: "Participant 1",
        type: "llm",
        provider: "openai" as const,
        model: "gpt-4",
        systemPrompt: "",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Mock a different UUID for the second participant
    vi.mocked(crypto.randomUUID).mockReturnValueOnce(
      "test-uuid-2" as `${string}-${string}-${string}-${string}-${string}`,
    );

    act(() => {
      addParticipant({
        name: "Participant 2",
        type: "llm",
        provider: "anthropic" as const,
        model: "claude-3",
        systemPrompt: "",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Get the updated state
    const initialParticipants = useParticipantsStore.getState().participants;

    // Check that the participants were added
    expect(initialParticipants).toHaveLength(3);
    expect(initialParticipants[0].name).toBe("You");
    expect(initialParticipants[1].name).toBe("Participant 1");
    expect(initialParticipants[2].name).toBe("Participant 2");

    // Reorder the participants
    act(() => {
      reorderParticipants(1, 2);
    });

    // Get the updated state
    const reorderedParticipants = useParticipantsStore.getState().participants;

    // Check that the participants were reordered
    expect(reorderedParticipants).toHaveLength(3);
    expect(reorderedParticipants[0].name).toBe("You");
    expect(reorderedParticipants[1].name).toBe("Participant 2");
    expect(reorderedParticipants[2].name).toBe("Participant 1");
  });

  it("clears the active participant when removing the active participant", () => {
    const { addParticipant, setActiveParticipant, removeParticipant } =
      useParticipantsStore.getState();

    // Add a new participant
    act(() => {
      addParticipant({
        name: "Test Participant",
        type: "llm",
        provider: "openai" as const,
        model: "gpt-4",
        systemPrompt: "",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Set the active participant
    act(() => {
      setActiveParticipant("test-uuid");
    });

    // Get the updated state
    const activeParticipantId =
      useParticipantsStore.getState().activeParticipantId;

    // Check that the active participant was set
    expect(activeParticipantId).toBe("test-uuid");

    // Remove the active participant
    act(() => {
      removeParticipant("test-uuid");
    });

    // Get the updated state
    const finalActiveParticipantId =
      useParticipantsStore.getState().activeParticipantId;

    // Check that the active participant was cleared
    expect(finalActiveParticipantId).toBeNull();
  });

  it("does not clear the active participant when removing a different participant", () => {
    const { addParticipant, setActiveParticipant, removeParticipant } =
      useParticipantsStore.getState();

    // Add two new participants
    act(() => {
      addParticipant({
        name: "Participant 1",
        type: "llm",
        provider: "openai" as const,
        model: "gpt-4",
        systemPrompt: "",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Mock a different UUID for the second participant
    vi.mocked(crypto.randomUUID).mockReturnValueOnce(
      "test-uuid-2" as `${string}-${string}-${string}-${string}-${string}`,
    );

    act(() => {
      addParticipant({
        name: "Participant 2",
        type: "llm",
        provider: "anthropic" as const,
        model: "claude-3",
        systemPrompt: "",
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      } as LLMParticipant);
    });

    // Set the active participant to the first participant
    act(() => {
      setActiveParticipant("test-uuid");
    });

    // Get the updated state
    const activeParticipantId =
      useParticipantsStore.getState().activeParticipantId;

    // Check that the active participant was set
    expect(activeParticipantId).toBe("test-uuid");

    // Remove the second participant
    act(() => {
      removeParticipant("test-uuid-2");
    });

    // Get the updated state
    const finalActiveParticipantId =
      useParticipantsStore.getState().activeParticipantId;

    // Check that the active participant was not cleared
    expect(finalActiveParticipantId).toBe("test-uuid");
  });
});
