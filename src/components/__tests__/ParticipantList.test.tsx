import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { ParticipantList } from "../ParticipantList";
import type { Participant } from "../../types/participant";

// Import the useParticipantsStore
import { useParticipantsStore } from "../../store/participants";

// Mock the useParticipantsStore hook
vi.mock("../../store/participants", () => ({
  useParticipantsStore: vi.fn(),
}));

// Get the mocked function
const mockUseParticipantsStore = useParticipantsStore as unknown as ReturnType<
  typeof vi.fn
>;

// Mock the SortableItem component
vi.mock("../SortableItem", () => ({
  SortableItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-item">{children}</div>
  ),
}));

// Mock the DndContext component
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

// Mock the SortableContext component
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn().mockReturnValue({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  sortableKeyboardCoordinates: vi.fn(),
}));

vi.mock("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: vi.fn(),
}));

// Mock the ParticipantForm component
interface ParticipantFormProps {
  onSubmit: (data: Omit<Participant, "id">) => void;
  onCancel: () => void;
}

vi.mock("../ParticipantForm", () => ({
  ParticipantForm: ({ onSubmit, onCancel }: ParticipantFormProps) => (
    <div data-testid="participant-form">
      <button
        data-testid="mock-submit"
        onClick={() =>
          onSubmit({
            name: "New AI",
            type: "llm",
            provider: "openai",
            model: "gpt-4o",
          } as Omit<Participant, "id">)
        }
      >
        Submit
      </button>
      <button data-testid="mock-cancel" onClick={() => onCancel()}>
        Cancel
      </button>
    </div>
  ),
}));

describe("ParticipantList", () => {
  const mockParticipants: Participant[] = [
    {
      id: "user",
      name: "You",
      type: "human",
    },
    {
      id: "123",
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
  ];

  const mockStore = {
    participants: mockParticipants,
    activeParticipantId: null,
    addParticipant: vi.fn(),
    removeParticipant: vi.fn(),
    updateParticipant: vi.fn(),
    reorderParticipants: vi.fn(),
    setActiveParticipant: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParticipantsStore.mockImplementation(() => mockStore);
  });

  it("renders the participant list", () => {
    render(<ParticipantList />);

    expect(screen.getByText("Participants")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  it("shows add participant form when add button is clicked", () => {
    render(<ParticipantList />);

    fireEvent.click(screen.getByText("Add Participant"));

    expect(screen.getByTestId("participant-form")).toBeInTheDocument();
    expect(screen.getByText("Add New Participant")).toBeInTheDocument();
  });

  it("adds a new participant when form is submitted", async () => {
    render(<ParticipantList />);

    fireEvent.click(screen.getByText("Add Participant"));
    fireEvent.click(screen.getByTestId("mock-submit"));

    expect(mockStore.addParticipant).toHaveBeenCalledWith({
      name: "New AI",
      type: "llm",
      provider: "openai",
      model: "gpt-4o",
    });
  });

  it("shows edit form when edit button is clicked", () => {
    render(<ParticipantList />);

    // Find and click the edit button for the AI participant
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId("participant-form")).toBeInTheDocument();
    expect(screen.getByText("Edit Participant")).toBeInTheDocument();
  });

  it("updates a participant when edit form is submitted", () => {
    render(<ParticipantList />);

    // Find and click the edit button for the AI participant
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    // Submit the form
    fireEvent.click(screen.getByTestId("mock-submit"));

    expect(mockStore.updateParticipant).toHaveBeenCalledWith("123", {
      name: "New AI",
      type: "llm",
      provider: "openai",
      model: "gpt-4o",
    });
  });

  it("shows delete confirmation when delete button is clicked", () => {
    render(<ParticipantList />);

    // Find and click the delete button for the AI participant
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText("Delete Participant")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/),
    ).toBeInTheDocument();
  });

  it("deletes a participant when confirmed", () => {
    render(<ParticipantList />);

    // Find and click the delete button for the AI participant
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    fireEvent.click(screen.getByText("Delete"));

    expect(mockStore.removeParticipant).toHaveBeenCalledWith("123");
  });

  it("cancels deletion when cancel is clicked", () => {
    render(<ParticipantList />);

    // Find and click the delete button for the AI participant
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    // Cancel deletion
    fireEvent.click(screen.getByText("Cancel"));

    expect(mockStore.removeParticipant).not.toHaveBeenCalled();
    expect(screen.getByText("Participants")).toBeInTheDocument();
  });

  it("shows empty state when there are no participants", () => {
    mockUseParticipantsStore.mockImplementation(() => ({
      ...mockStore,
      participants: [],
    }));

    render(<ParticipantList />);

    expect(screen.getByText("No Participants Yet")).toBeInTheDocument();
  });
});
