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
});
