import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";

// Define types for the mock components
type DialogComponentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
};

// Mock Radix UI Dialog components
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, ...props }: DialogComponentProps) => (
    <div data-testid="dialog-root" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: DialogComponentProps) => (
    <div data-testid="dialog-portal" {...props}>
      {children}
    </div>
  ),
  Overlay: ({ className, ...props }: DialogComponentProps) => (
    <div data-testid="dialog-overlay" className={className} {...props} />
  ),
  Content: ({ className, children, ...props }: DialogComponentProps) => (
    <div data-testid="dialog-content" className={className} {...props}>
      {children}
    </div>
  ),
  Close: ({ className, children, ...props }: DialogComponentProps) => (
    <button data-testid="dialog-close" className={className} {...props}>
      {children}
    </button>
  ),
  Title: ({ className, ...props }: DialogComponentProps) => (
    <h2 data-testid="dialog-title" className={className} {...props} />
  ),
  Description: ({ className, ...props }: DialogComponentProps) => (
    <p data-testid="dialog-description" className={className} {...props} />
  ),
}));

// Mock the cn utility function
vi.mock("../../../lib/utils", () => ({
  cn: (
    ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
  ) => inputs.filter(Boolean).join(" "),
}));

// Mock the XIcon from lucide-react
vi.mock("lucide-react", () => ({
  XIcon: () => <span data-testid="x-icon">X</span>,
}));

describe("Dialog Components", () => {
  describe("Dialog", () => {
    it("renders the root component with props", () => {
      render(<Dialog open={true} />);

      const dialogRoot = screen.getByTestId("dialog-root");
      expect(dialogRoot).toBeInTheDocument();
      expect(dialogRoot).toHaveAttribute("data-slot", "dialog");
    });
  });

  describe("DialogContent", () => {
    it("renders content with default classes", () => {
      render(
        <DialogContent>
          <div data-testid="dialog-children">Content</div>
        </DialogContent>,
      );

      const dialogContent = screen.getByTestId("dialog-content");
      expect(dialogContent).toBeInTheDocument();
      expect(dialogContent).toHaveAttribute("data-slot", "dialog-content");
      expect(dialogContent).toHaveClass("bg-background");
      expect(dialogContent).toHaveClass("rounded-lg");

      // Check that children are rendered
      expect(screen.getByTestId("dialog-children")).toBeInTheDocument();

      // Check that close button is rendered
      expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("applies additional className to content", () => {
      render(<DialogContent className="custom-class">Content</DialogContent>);

      const dialogContent = screen.getByTestId("dialog-content");
      expect(dialogContent).toHaveClass("custom-class");
    });
  });

  describe("DialogHeader", () => {
    it("renders header with default classes", () => {
      render(<DialogHeader data-testid="header">Header Content</DialogHeader>);

      const header = screen.getByTestId("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("data-slot", "dialog-header");
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("flex-col");
      expect(header).toHaveClass("gap-2");
    });

    it("applies additional className to header", () => {
      render(
        <DialogHeader className="custom-header" data-testid="header">
          Header Content
        </DialogHeader>,
      );

      const header = screen.getByTestId("header");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("DialogFooter", () => {
    it("renders footer with default classes", () => {
      render(<DialogFooter data-testid="footer">Footer Content</DialogFooter>);

      const footer = screen.getByTestId("footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute("data-slot", "dialog-footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("flex-col-reverse");
    });

    it("applies additional className to footer", () => {
      render(
        <DialogFooter className="custom-footer" data-testid="footer">
          Footer Content
        </DialogFooter>,
      );

      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("custom-footer");
    });
  });

  describe("DialogTitle", () => {
    it("renders title with default classes", () => {
      render(<DialogTitle>Dialog Title</DialogTitle>);

      const title = screen.getByTestId("dialog-title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("data-slot", "dialog-title");
      expect(title).toHaveClass("text-lg");
      expect(title).toHaveClass("font-semibold");
    });

    it("applies additional className to title", () => {
      render(<DialogTitle className="custom-title">Dialog Title</DialogTitle>);

      const title = screen.getByTestId("dialog-title");
      expect(title).toHaveClass("custom-title");
    });
  });

  describe("DialogDescription", () => {
    it("renders description with default classes", () => {
      render(<DialogDescription>Dialog Description</DialogDescription>);

      const description = screen.getByTestId("dialog-description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute("data-slot", "dialog-description");
      expect(description).toHaveClass("text-muted-foreground");
      expect(description).toHaveClass("text-sm");
    });

    it("applies additional className to description", () => {
      render(
        <DialogDescription className="custom-description">
          Dialog Description
        </DialogDescription>,
      );

      const description = screen.getByTestId("dialog-description");
      expect(description).toHaveClass("custom-description");
    });
  });

  describe("Dialog Integration", () => {
    it("renders a complete dialog with all components", () => {
      render(
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Example Dialog</DialogTitle>
              <DialogDescription>
                This is a dialog description
              </DialogDescription>
            </DialogHeader>
            <div data-testid="dialog-body">Dialog body content</div>
            <DialogFooter>
              <button data-testid="dialog-action">Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      // Check that all components are rendered
      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByText("Example Dialog")).toBeInTheDocument();
      expect(
        screen.getByText("This is a dialog description"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-action")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
    });
  });
});
