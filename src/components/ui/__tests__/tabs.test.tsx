import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

// Define types for the mock components
type TabsComponentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

// Mock Radix UI Tabs components
vi.mock("@radix-ui/react-tabs", () => ({
  Root: ({
    className,
    children,
    defaultValue,
    id,
    "aria-label": ariaLabel,
    ...props
  }: TabsComponentProps) => (
    <div
      data-testid="tabs-root"
      className={className}
      data-defaultvalue={defaultValue}
      id={id}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </div>
  ),
  List: ({ className, children, ...props }: TabsComponentProps) => (
    <div data-testid="tabs-list" className={className} {...props}>
      {children}
    </div>
  ),
  Trigger: ({
    className,
    children,
    value,
    ...props
  }: TabsComponentProps & { value?: string }) => (
    <button
      data-testid="tabs-trigger"
      className={className}
      data-value={value}
      {...props}
    >
      {children}
    </button>
  ),
  Content: ({
    className,
    children,
    value,
    ...props
  }: TabsComponentProps & { value?: string }) => (
    <div
      data-testid="tabs-content"
      className={className}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (
    ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
  ) => inputs.filter(Boolean).join(" "),
}));

describe("Tabs Components", () => {
  describe("Tabs", () => {
    it("renders the root component with default props", () => {
      render(<Tabs>Tabs content</Tabs>);

      const tabs = screen.getByTestId("tabs-root");
      expect(tabs).toBeInTheDocument();
      expect(tabs).toHaveAttribute("data-slot", "tabs");
      expect(tabs).toHaveClass("flex");
      expect(tabs).toHaveClass("flex-col");
      expect(tabs).toHaveClass("gap-2");
      expect(tabs).toHaveTextContent("Tabs content");
    });

    it("applies additional className to root", () => {
      render(<Tabs className="custom-tabs">Tabs content</Tabs>);

      const tabs = screen.getByTestId("tabs-root");
      expect(tabs).toHaveClass("custom-tabs");
    });

    it("passes through props to root", () => {
      render(
        <Tabs defaultValue="tab1" id="main-tabs" aria-label="Main tabs">
          Tabs content
        </Tabs>,
      );

      const tabs = screen.getByTestId("tabs-root");
      expect(tabs).toHaveAttribute("data-defaultvalue", "tab1");
      expect(tabs).toHaveAttribute("id", "main-tabs");
      expect(tabs).toHaveAttribute("aria-label", "Main tabs");
    });
  });

  describe("TabsList", () => {
    it("renders the list component with default props", () => {
      render(<TabsList>List content</TabsList>);

      const list = screen.getByTestId("tabs-list");
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute("data-slot", "tabs-list");
      expect(list).toHaveClass("bg-muted");
      expect(list).toHaveClass("inline-flex");
      expect(list).toHaveClass("rounded-lg");
      expect(list).toHaveTextContent("List content");
    });

    it("applies additional className to list", () => {
      render(<TabsList className="custom-list">List content</TabsList>);

      const list = screen.getByTestId("tabs-list");
      expect(list).toHaveClass("custom-list");
    });
  });

  describe("TabsTrigger", () => {
    it("renders the trigger component with default props", () => {
      render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>);

      const trigger = screen.getByTestId("tabs-trigger");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("data-slot", "tabs-trigger");
      expect(trigger).toHaveAttribute("data-value", "tab1");
      expect(trigger).toHaveClass("inline-flex");
      expect(trigger).toHaveClass("rounded-md");
      expect(trigger).toHaveTextContent("Tab 1");
    });

    it("applies additional className to trigger", () => {
      render(
        <TabsTrigger className="custom-trigger" value="tab1">
          Tab 1
        </TabsTrigger>,
      );

      const trigger = screen.getByTestId("tabs-trigger");
      expect(trigger).toHaveClass("custom-trigger");
    });

    it("passes through props to trigger", () => {
      render(
        <TabsTrigger value="tab1" disabled aria-controls="panel-1">
          Tab 1
        </TabsTrigger>,
      );

      const trigger = screen.getByTestId("tabs-trigger");
      expect(trigger).toHaveAttribute("disabled");
      expect(trigger).toHaveAttribute("aria-controls", "panel-1");
    });
  });

  describe("TabsContent", () => {
    it("renders the content component with default props", () => {
      render(<TabsContent value="tab1">Content 1</TabsContent>);

      const content = screen.getByTestId("tabs-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-slot", "tabs-content");
      expect(content).toHaveAttribute("data-value", "tab1");
      expect(content).toHaveClass("flex-1");
      expect(content).toHaveClass("outline-none");
      expect(content).toHaveTextContent("Content 1");
    });

    it("applies additional className to content", () => {
      render(
        <TabsContent className="custom-content" value="tab1">
          Content 1
        </TabsContent>,
      );

      const content = screen.getByTestId("tabs-content");
      expect(content).toHaveClass("custom-content");
    });

    it("passes through props to content", () => {
      render(
        <TabsContent value="tab1" id="panel-1" aria-labelledby="tab-1">
          Content 1
        </TabsContent>,
      );

      const content = screen.getByTestId("tabs-content");
      expect(content).toHaveAttribute("id", "panel-1");
      expect(content).toHaveAttribute("aria-labelledby", "tab-1");
    });
  });

  describe("Tabs Integration", () => {
    it("renders a complete tabs component with all parts", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for Tab 1</TabsContent>
          <TabsContent value="tab2">Content for Tab 2</TabsContent>
        </Tabs>,
      );

      // Check that all components are rendered
      expect(screen.getByTestId("tabs-root")).toBeInTheDocument();
      expect(screen.getByTestId("tabs-list")).toBeInTheDocument();

      const triggers = screen.getAllByTestId("tabs-trigger");
      expect(triggers).toHaveLength(2);
      expect(triggers[0]).toHaveTextContent("Tab 1");
      expect(triggers[1]).toHaveTextContent("Tab 2");

      const contents = screen.getAllByTestId("tabs-content");
      expect(contents).toHaveLength(2);
      expect(contents[0]).toHaveTextContent("Content for Tab 1");
      expect(contents[1]).toHaveTextContent("Content for Tab 2");
    });
  });
});
