import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { RoundTable } from "../RoundTable";
import type { Participant } from "../../types/participant";

// Mock the Icon component
vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: { icon: string }) => (
    <span data-testid={`icon-${icon}`}>{icon}</span>
  ),
}));

// Sample participants data
const participants: Participant[] = [
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
  {
    id: "expert",
    name: "Domain Expert",
    type: "llm",
    provider: "anthropic",
    model: "claude-3-opus",
    roleDescription: "Technical expert who provides in-depth analysis",
    systemPrompt: "You are a technical domain expert",
    settings: {
      temperature: 0.5,
      maxTokens: 2000,
    },
  },
];

describe("RoundTable", () => {
  test("renders all participants in a circular layout", () => {
    const handleClick = vi.fn();

    render(
      <RoundTable
        participants={participants}
        activeParticipantId={null}
        onParticipantClick={handleClick}
      />,
    );

    // Check for the title
    expect(screen.getByText("Round Table")).toBeInTheDocument();

    // Check for all participant names - using getAll to avoid duplicate text issues
    const youTexts = screen.getAllByText("You");
    const assistantTexts = screen.getAllByText("AI Assistant");
    const expertTexts = screen.getAllByText("Domain Expert");

    expect(youTexts.length).toBeGreaterThan(0);
    expect(assistantTexts.length).toBeGreaterThan(0);
    expect(expertTexts.length).toBeGreaterThan(0);

    // Verify we have the right number of participant nodes
    const userIcon = screen.getByTestId("icon-solar:user-rounded-linear");
    const robotIcons = screen.getAllByTestId("icon-solar:robot-linear");

    expect(userIcon).toBeInTheDocument();
    expect(robotIcons).toHaveLength(2); // Two AI participants
  });

  test("highlights the active participant", () => {
    const handleClick = vi.fn();

    render(
      <RoundTable
        participants={participants}
        activeParticipantId="assistant"
        onParticipantClick={handleClick}
      />,
    );

    // Check that the active participant details are shown
    // Get all elements with this text since it appears in multiple places
    const assistantTexts = screen.getAllByText("AI Assistant");
    expect(assistantTexts.length).toBeGreaterThan(0);

    expect(screen.getByText("openai")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o")).toBeInTheDocument();
  });

  test("calls onParticipantClick when a participant is clicked", () => {
    const handleClick = vi.fn();

    render(
      <RoundTable
        participants={participants}
        activeParticipantId={null}
        onParticipantClick={handleClick}
      />,
    );

    // Find all participant buttons and click one
    // We need to find the actual buttons which contain the participant info
    const buttons = screen.getAllByRole("button");

    // Filter to find a button with the title attribute
    const assistantButton = buttons.find(
      (btn) => btn.getAttribute("title") === "AI Assistant",
    );

    // Click the assistant button
    if (assistantButton) {
      fireEvent.click(assistantButton);

      // Verify the click handler was called with the correct ID
      expect(handleClick).toHaveBeenCalledWith("assistant");
    } else {
      throw new Error("Could not find assistant button");
    }
  });

  test("displays participant details when active", () => {
    const handleClick = vi.fn();

    // Test with the third participant active (has role description)
    render(
      <RoundTable
        participants={participants}
        activeParticipantId="expert"
        onParticipantClick={handleClick}
      />,
    );

    // Check that the active participant details are shown with role description
    // Get all elements with this text since it appears in multiple places
    const expertTexts = screen.getAllByText("Domain Expert");
    expect(expertTexts.length).toBeGreaterThan(0);

    expect(screen.getByText("anthropic")).toBeInTheDocument();
    expect(screen.getByText("claude-3-opus")).toBeInTheDocument();
    expect(
      screen.getByText("Technical expert who provides in-depth analysis"),
    ).toBeInTheDocument();
  });
});
