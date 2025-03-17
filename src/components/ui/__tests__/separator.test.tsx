import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Separator } from "../separator";

// Define types for the mock components
type SeparatorComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

// Mock Radix UI Separator components
vi.mock("@radix-ui/react-separator", () => ({
  Root: React.forwardRef(
    (
      { className, orientation, decorative, ...props }: SeparatorComponentProps,
      ref: React.Ref<HTMLDivElement>,
    ) => (
      <div
        data-testid="separator-root"
        className={className}
        data-orientation={orientation}
        data-decorative={decorative}
        ref={ref}
        {...props}
      />
    ),
  ),
}));

// Mock the cn utility function
vi.mock("../../lib/utils", () => ({
  cn: (
    ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
  ) => inputs.filter(Boolean).join(" "),
}));

describe("Separator", () => {
  it("renders with default props", () => {
    render(<Separator />);

    const separator = screen.getByTestId("separator-root");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).toHaveAttribute("data-decorative", "true");

    // Check default classes
    expect(separator).toHaveClass("shrink-0");
    expect(separator).toHaveClass("bg-border");
    expect(separator).toHaveClass("h-[1px]");
    expect(separator).toHaveClass("w-full");
  });

  it("renders with vertical orientation", () => {
    render(<Separator orientation="vertical" />);

    const separator = screen.getByTestId("separator-root");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator).toHaveClass("h-full");
    expect(separator).toHaveClass("w-[1px]");
  });

  it("renders with non-decorative attribute", () => {
    render(<Separator decorative={false} />);

    const separator = screen.getByTestId("separator-root");
    expect(separator).toHaveAttribute("data-decorative", "false");
  });

  it("applies additional className", () => {
    render(<Separator className="custom-class" />);

    const separator = screen.getByTestId("separator-root");
    expect(separator).toHaveClass("custom-class");
  });

  it("passes through HTML attributes", () => {
    render(
      <Separator
        id="main-separator"
        aria-label="Content separator"
        data-section="main"
      />,
    );

    const separator = screen.getByTestId("separator-root");
    expect(separator).toHaveAttribute("id", "main-separator");
    expect(separator).toHaveAttribute("aria-label", "Content separator");
    expect(separator).toHaveAttribute("data-section", "main");
  });

  it("forwards ref to the separator element", () => {
    const refCallback = vi.fn();

    render(<Separator ref={refCallback} />);

    expect(refCallback).toHaveBeenCalled();
  });
});
