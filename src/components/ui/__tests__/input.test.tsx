import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

// Mock the cn utility function
vi.mock("../../../lib/utils", () => ({
  cn: (
    ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
  ) => inputs.filter(Boolean).join(" "),
}));

describe("Input", () => {
  it("renders with default props", () => {
    render(
      <Input type="text" placeholder="Enter text" data-testid="test-input" />,
    );

    const input = screen.getByTestId("test-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");

    // Check default classes
    expect(input).toHaveClass("flex");
    expect(input).toHaveClass("h-10");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("border");
  });

  it("renders with different input types", () => {
    render(<Input type="password" data-testid="password-input" />);

    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies additional className prop", () => {
    render(<Input className="custom-class" data-testid="custom-input" />);

    const input = screen.getByTestId("custom-input");
    expect(input).toHaveClass("custom-class");
  });

  it("passes through HTML input attributes", () => {
    render(
      <Input
        placeholder="Test placeholder"
        required
        maxLength={10}
        aria-label="Test input"
        data-testid="attr-input"
      />,
    );

    const input = screen.getByTestId("attr-input");
    expect(input).toHaveAttribute("placeholder", "Test placeholder");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toHaveAttribute("aria-label", "Test input");
  });

  it("applies disabled styles when disabled", () => {
    render(<Input disabled data-testid="disabled-input" />);

    const input = screen.getByTestId("disabled-input");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:cursor-not-allowed");
    expect(input).toHaveClass("disabled:opacity-50");
  });

  it("forwards ref to the input element", async () => {
    const refCallback = vi.fn();

    render(<Input ref={refCallback} data-testid="ref-input" />);

    expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it("handles user input correctly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Input onChange={onChange} data-testid="input-field" />);

    const input = screen.getByTestId("input-field");
    await user.type(input, "test input");

    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("test input");
  });
});
