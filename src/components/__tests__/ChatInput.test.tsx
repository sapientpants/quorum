import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "../ChatInput";

describe("ChatInput", () => {
  const onSendMessageMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    // Check that the textarea and button are rendered
    const textarea = screen.getByPlaceholderText("Type your message here...");
    expect(textarea).toBeInTheDocument();
    expect(textarea).not.toBeDisabled();

    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled(); // Button should be disabled when textarea is empty
  });

  it("enables the send button when text is entered", async () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");
    const button = screen.getByRole("button", { name: "Send" });

    // Button should be disabled initially
    expect(button).toBeDisabled();

    // Enter text in the textarea
    await userEvent.type(textarea, "Hello, world!");

    // Button should be enabled now
    expect(button).not.toBeDisabled();
  });

  it("calls onSendMessage when the send button is clicked", async () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");
    const button = screen.getByRole("button", { name: "Send" });

    // Enter text in the textarea
    await userEvent.type(textarea, "Hello, world!");

    // Click the send button
    await userEvent.click(button);

    // Check that onSendMessage was called with the correct text
    expect(onSendMessageMock).toHaveBeenCalledWith("Hello, world!");

    // Textarea should be cleared after sending
    expect(textarea).toHaveValue("");
  });

  it("calls onSendMessage when Enter is pressed", async () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");

    // Enter text in the textarea
    await userEvent.type(textarea, "Hello, world!");

    // Press Enter
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    // Check that onSendMessage was called with the correct text
    expect(onSendMessageMock).toHaveBeenCalledWith("Hello, world!");

    // Textarea should be cleared after sending
    expect(textarea).toHaveValue("");
  });

  it("does not call onSendMessage when Shift+Enter is pressed", async () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");

    // Enter text in the textarea
    await userEvent.type(textarea, "Hello, world!");

    // Press Shift+Enter
    fireEvent.keyDown(textarea, {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
    });

    // Check that onSendMessage was not called
    expect(onSendMessageMock).not.toHaveBeenCalled();

    // Textarea should still have the text
    expect(textarea).toHaveValue("Hello, world!");
  });

  it("disables the textarea and button when isLoading is true", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} isLoading={true} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");
    const button = screen.getByRole("button");

    // Both textarea and button should be disabled
    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();

    // Button should show loading spinner
    expect(
      screen.getByText("", { selector: ".loading-spinner" }),
    ).toBeInTheDocument();
  });

  it("disables the textarea and button when disabled prop is true", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} disabled={true} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");
    const button = screen.getByRole("button", { name: "Send" });

    // Both textarea and button should be disabled
    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("uses the provided placeholder text", () => {
    const customPlaceholder = "Enter your message...";
    render(
      <ChatInput
        onSendMessage={onSendMessageMock}
        placeholder={customPlaceholder}
      />,
    );

    // Check that the textarea has the custom placeholder
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it("does not send empty messages", async () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    const textarea = screen.getByPlaceholderText("Type your message here...");
    const button = screen.getByRole("button", { name: "Send" });

    // Enter only whitespace in the textarea
    await userEvent.type(textarea, "   ");

    // Button should still be disabled
    expect(button).toBeDisabled();

    // Try to press Enter
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    // Check that onSendMessage was not called
    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});
