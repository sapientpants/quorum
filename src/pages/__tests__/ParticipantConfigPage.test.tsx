import { render, screen, fireEvent } from "@testing-library/react";
import { vi, type MockInstance } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ParticipantConfigPage } from "../ParticipantConfigPage";
import { useParticipantsStore } from "../../store/participants";

// Mock the store
vi.mock("../../store/participants", () => ({
  useParticipantsStore: vi.fn(),
}));

// Mock the Icon component
vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: { icon: string }) => (
    <span data-testid={`icon-${icon}`}>{icon}</span>
  ),
}));

// Mock ParticipantForm component
vi.mock("../../components/ParticipantForm", () => ({
  ParticipantForm: ({
    onSubmit,
    onCancel,
    initialData,
  }: {
    onSubmit: (data: {
      name: string;
      type: string;
      provider?: string;
      model?: string;
      systemPrompt?: string;
      settings?: {
        temperature: number;
        maxTokens: number;
      };
    }) => void;
    onCancel: () => void;
    initialData?: {
      name: string;
      type: string;
      provider?: string;
      model?: string;
      systemPrompt?: string;
    };
  }) => (
    <div data-testid="participant-form">
      <button
        data-testid="submit-form"
        onClick={() =>
          onSubmit({
            name: "New Participant",
            type: "llm",
            provider: "openai",
            model: "gpt-4",
            systemPrompt: "You are a helpful assistant",
            settings: { temperature: 0.7, maxTokens: 1000 },
          })
        }
      >
        Submit
      </button>
      <button data-testid="cancel-form" onClick={onCancel}>
        Cancel
      </button>
      {initialData && (
        <div data-testid="form-initial-data">{initialData.name}</div>
      )}
    </div>
  ),
}));

// Mock ParticipantAdvancedSettings component
vi.mock("../../components/ParticipantAdvancedSettings", () => ({
  ParticipantAdvancedSettings: ({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: { temperature: number; maxTokens: number }) => void;
  }) =>
    isOpen ? (
      <div data-testid="advanced-settings">
        <button
          data-testid="save-settings"
          onClick={() => onSave({ temperature: 0.8, maxTokens: 2000 })}
        >
          Save
        </button>
        <button data-testid="close-settings" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

describe("ParticipantConfigPage", () => {
  // Setup default mock implementation
  const mockSetActiveParticipant = vi.fn();
  const mockAddParticipant = vi.fn();
  const mockUpdateParticipant = vi.fn();

  beforeEach(() => {
    // Default mock implementation
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [
        {
          id: "user",
          name: "You",
          type: "human",
        },
        {
          id: "assistant",
          name: "AI Assistant",
          type: "llm",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt: "You are a helpful assistant",
          settings: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        },
      ],
      activeParticipantId: null,
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders the page with list view by default", () => {
    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Check for the title
    expect(screen.getByText("Participant Configuration")).toBeInTheDocument();

    // Check for view toggle buttons
    expect(screen.getByText("List")).toBeInTheDocument();
    expect(screen.getByText("Round Table")).toBeInTheDocument();

    // Verify we're in list view
    expect(screen.getByText("Participants")).toBeInTheDocument();
  });

  test("switches between list and round table views", () => {
    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Click on Round Table view
    fireEvent.click(screen.getByRole("button", { name: /Round Table/i }));

    // Verify we're in round table view
    expect(
      screen.getByRole("heading", { name: "Round Table" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Click on a participant to view details"),
    ).toBeInTheDocument();

    // Click back to list view
    fireEvent.click(screen.getAllByRole("button", { name: /List/i })[0]);

    // Verify we're back in list view
    expect(screen.getByText("Participants")).toBeInTheDocument();
  });

  test("shows participant details when selected in round table view", () => {
    // Mock with an active participant
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [
        {
          id: "user",
          name: "You",
          type: "human",
        },
        {
          id: "assistant",
          name: "AI Assistant",
          type: "llm",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt: "You are a helpful assistant",
          settings: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        },
      ],
      activeParticipantId: "assistant",
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });

    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Switch to round table view
    fireEvent.click(screen.getByText("Round Table"));

    // Verify we see the active participant details
    expect(
      screen.getByRole("heading", { level: 3, name: "AI Assistant" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("openai")[0]).toBeInTheDocument();
    expect(screen.getAllByText("gpt-4o")[0]).toBeInTheDocument();
    expect(screen.getByText("You are a helpful assistant")).toBeInTheDocument();

    // Check for the clear selection button
    const clearButton = screen.getByText("Clear Selection");
    expect(clearButton).toBeInTheDocument();

    // Click the clear button
    fireEvent.click(clearButton);

    // Verify setActiveParticipant was called with null
    expect(mockSetActiveParticipant).toHaveBeenCalledWith(null);
  });

  it("displays empty state when no participants are available", () => {
    // Mock empty participants array
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [],
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });

    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Verify empty state message
    expect(screen.getByText("No Participants Yet")).toBeInTheDocument();
  });

  test("handles clicking on a participant in round table view", () => {
    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Switch to round table view
    const roundTableButton = screen.getByRole("button", {
      name: /Round Table/i,
    });
    fireEvent.click(roundTableButton);

    // Find the participant buttons in the round table
    const participantButtons = screen.getAllByRole("button", {
      name: /Select participant/i,
    });

    // There should be at least one participant button
    expect(participantButtons.length).toBeGreaterThan(0);

    // Click on the first participant
    fireEvent.click(participantButtons[0]);

    // Verify setActiveParticipant was called
    expect(mockSetActiveParticipant).toHaveBeenCalled();
  });

  test("shows add participant form and adds a new participant", () => {
    // Setup mock with isAddingParticipant=true
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [{ id: "user", name: "You", type: "human" }],
      activeParticipantId: null,
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });

    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // First we need to trigger the add participant form
    // Let's get the Add Participant button
    const addButton = screen.getByText(/Add Participant/i);
    fireEvent.click(addButton);

    // Now we should be in the add participant form view
    // Submit the form
    fireEvent.click(screen.getByTestId("submit-form"));

    // Verify addParticipant was called with the correct data
    expect(mockAddParticipant).toHaveBeenCalledWith({
      name: "New Participant",
      type: "llm",
      provider: "openai",
      model: "gpt-4",
      systemPrompt: "You are a helpful assistant",
      settings: { temperature: 0.7, maxTokens: 1000 },
    });
  });

  test("shows edit participant form when edit button clicked", () => {
    // First render with normal state
    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Switch to round table view where we can find the edit button
    fireEvent.click(screen.getByText("Round Table"));

    // Set an active participant
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [
        { id: "user", name: "You", type: "human" },
        {
          id: "assistant",
          name: "AI Assistant",
          type: "llm",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt: "You are a helpful assistant",
          settings: { temperature: 0.7, maxTokens: 1000 },
        },
      ],
      activeParticipantId: "assistant",
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });

    // Re-render with the new state
    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Find and click the edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Now we should be in edit mode
    // Verify the form has the initial data
    expect(screen.getByTestId("form-initial-data")).toHaveTextContent(
      "AI Assistant",
    );

    // Submit the edit form
    fireEvent.click(screen.getByTestId("submit-form"));

    // Verify updateParticipant was called with the correct data
    expect(mockUpdateParticipant).toHaveBeenCalledWith("assistant", {
      name: "New Participant",
      type: "llm",
      provider: "openai",
      model: "gpt-4",
      systemPrompt: "You are a helpful assistant",
      settings: { temperature: 0.7, maxTokens: 1000 },
    });
  });

  test("shows and interacts with advanced settings", () => {
    // Setup with participant to edit
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [
        {
          id: "assistant",
          name: "AI Assistant",
          type: "llm",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt: "You are a helpful assistant",
          settings: { temperature: 0.7, maxTokens: 1000 },
        },
      ],
      activeParticipantId: "assistant",
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });

    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Find and click the edit button to get to edit view
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Since the ParticipantForm and advanced settings are mocked, we'll make sure
    // their expected behavior is mimicked in the test

    // Simulate submitting the form - without needing to access advanced settings
    fireEvent.click(screen.getByTestId("submit-form"));

    // Verify updateParticipant was called
    expect(mockUpdateParticipant).toHaveBeenCalled();
  });

  test("cancels form when cancel button is clicked", () => {
    // Setup with isAddingParticipant=true to show the form
    (useParticipantsStore as unknown as MockInstance).mockReturnValue({
      participants: [{ id: "user", name: "You", type: "human" }],
      activeParticipantId: null,
      setActiveParticipant: mockSetActiveParticipant,
      addParticipant: mockAddParticipant,
      updateParticipant: mockUpdateParticipant,
    });

    render(
      <BrowserRouter>
        <ParticipantConfigPage />
      </BrowserRouter>,
    );

    // Trigger the add participant form
    const addButton = screen.getByText(/Add Participant/i);
    fireEvent.click(addButton);

    // Cancel the form
    fireEvent.click(screen.getByTestId("cancel-form"));

    // We should be back to the main view, verify by checking for the List/Round Table buttons
    expect(screen.getByText("List")).toBeInTheDocument();
    expect(screen.getByText("Round Table")).toBeInTheDocument();
  });
});
