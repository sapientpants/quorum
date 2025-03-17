import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Checkbox } from "../checkbox";

// Define types for the mock components
type CheckboxComponentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

// Mock Radix UI Checkbox components
vi.mock("@radix-ui/react-checkbox", () => ({
  Root: ({
    className,
    children,
    onCheckedChange,
    checked,
    defaultChecked,
    ...props
  }: CheckboxComponentProps) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(
      Boolean(checked || defaultChecked),
    );

    // Handle clicks to properly simulate checkbox behavior
    const handleClick = () => {
      const newChecked = !isChecked;
      setIsChecked(newChecked);
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    };

    return (
      <div
        data-testid="checkbox-root"
        className={className}
        role="checkbox"
        aria-checked={isChecked}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  },
  Indicator: ({ className, children, ...props }: CheckboxComponentProps) => (
    <div data-testid="checkbox-indicator" className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock the CheckIcon from lucide-react
vi.mock("lucide-react", () => ({
  CheckIcon: () => <span data-testid="check-icon">✓</span>,
}));

// Mock the cn utility function
vi.mock("../../../lib/utils", () => ({
  cn: (
    ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
  ) => inputs.filter(Boolean).join(" "),
}));

describe("Checkbox", () => {
  it("renders with default props", () => {
    render(<Checkbox />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    expect(checkbox).toHaveAttribute("role", "checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    // Check default classes
    expect(checkbox).toHaveClass("peer");
    expect(checkbox).toHaveClass("border");
    expect(checkbox).toHaveClass("rounded-[4px]");

    // Check that indicator is rendered
    const indicator = screen.getByTestId("checkbox-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("data-slot", "checkbox-indicator");

    // Check that check icon is rendered
    const checkIcon = screen.getByTestId("check-icon");
    expect(checkIcon).toBeInTheDocument();
  });

  it("applies checked state", () => {
    render(<Checkbox checked />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("applies defaultChecked state", () => {
    render(<Checkbox defaultChecked />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("applies disabled state", () => {
    render(<Checkbox disabled />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("disabled");
    expect(checkbox).toHaveClass("disabled:cursor-not-allowed");
    expect(checkbox).toHaveClass("disabled:opacity-50");
  });

  it("applies additional className", () => {
    render(<Checkbox className="custom-class" />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveClass("custom-class");
  });

  it("passes through HTML attributes", () => {
    render(
      <Checkbox
        id="terms"
        name="terms"
        value="accept"
        aria-label="Accept terms"
        required
      />,
    );

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("id", "terms");
    expect(checkbox).toHaveAttribute("name", "terms");
    expect(checkbox).toHaveAttribute("value", "accept");
    expect(checkbox).toHaveAttribute("aria-label", "Accept terms");
    expect(checkbox).toHaveAttribute("required");
  });

  it("calls onCheckedChange when checked state changes", async () => {
    const onCheckedChange = vi.fn();

    render(<Checkbox onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByTestId("checkbox-root");
    fireEvent.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
