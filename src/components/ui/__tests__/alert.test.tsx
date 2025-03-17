import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "../alert";

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (
    ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
  ) => inputs.filter(Boolean).join(" "),
}));

describe("Alert", () => {
  it("renders with default props", () => {
    render(<Alert>Alert content</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Alert content");

    // Check default classes
    expect(alert).toHaveClass("bg-background");
    expect(alert).toHaveClass("text-foreground");
  });

  it("renders with destructive variant", () => {
    render(<Alert variant="destructive">Destructive alert</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass("text-destructive-foreground");
  });

  it("applies additional className prop", () => {
    render(<Alert className="custom-class">Custom alert</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-class");
  });

  it("passes through HTML attributes", () => {
    render(
      <Alert data-testid="custom-alert" aria-labelledby="alert-title">
        Alert with attributes
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-testid", "custom-alert");
    expect(alert).toHaveAttribute("aria-labelledby", "alert-title");
  });

  it("renders with data-slot attribute", () => {
    render(<Alert>Alert with data slot</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-slot", "alert");
  });
});

describe("AlertTitle", () => {
  it("renders correctly", () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
      </Alert>,
    );

    const title = screen.getByText("Alert Title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute("data-slot", "alert-title");
    expect(title).toHaveClass("font-medium");
    expect(title).toHaveClass("tracking-tight");
  });

  it("applies additional className prop", () => {
    render(
      <Alert>
        <AlertTitle className="custom-title-class">Custom Title</AlertTitle>
      </Alert>,
    );

    const title = screen.getByText("Custom Title");
    expect(title).toHaveClass("custom-title-class");
  });
});

describe("AlertDescription", () => {
  it("renders correctly", () => {
    render(
      <Alert>
        <AlertDescription>Alert description text</AlertDescription>
      </Alert>,
    );

    const description = screen.getByText("Alert description text");
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute("data-slot", "alert-description");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("applies additional className prop", () => {
    render(
      <Alert>
        <AlertDescription className="custom-desc-class">
          Custom description
        </AlertDescription>
      </Alert>,
    );

    const description = screen.getByText("Custom description");
    expect(description).toHaveClass("custom-desc-class");
  });
});

describe("Alert with all components", () => {
  it("renders a complete alert with title and description", () => {
    render(
      <Alert>
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          This is an important message that requires your attention.
        </AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    const title = screen.getByText("Important Notice");
    const description = screen.getByText(
      "This is an important message that requires your attention.",
    );

    expect(alert).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // Check that title and description are children of the alert
    expect(alert).toContainElement(title);
    expect(alert).toContainElement(description);
  });
});
