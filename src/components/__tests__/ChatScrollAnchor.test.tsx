import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ChatScrollAnchor } from "../ChatScrollAnchor";

describe("ChatScrollAnchor", () => {
  // Mock scrollIntoView function
  const scrollIntoViewMock = vi.fn();

  // Mock the ref implementation
  beforeEach(() => {
    // Reset the mock before each test
    scrollIntoViewMock.mockReset();

    // Mock Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  it("renders an empty div with a ref", () => {
    const { container } = render(<ChatScrollAnchor />);

    // Check that a div is rendered
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);

    // Check that the div is empty
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("calls scrollIntoView on the ref when rendered", () => {
    render(<ChatScrollAnchor />);

    // Check that scrollIntoView was called
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    // Check that scrollIntoView was called with the correct options
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("calls scrollIntoView on re-render", () => {
    const { rerender } = render(<ChatScrollAnchor />);

    // Check that scrollIntoView was called once
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    // Re-render the component
    rerender(<ChatScrollAnchor />);

    // Check that scrollIntoView was called again
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });

  it("handles case where scrollIntoView is not available", () => {
    // Mock scrollIntoView to be undefined
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Element.prototype.scrollIntoView = undefined as any;

    // Render should not throw an error
    expect(() => render(<ChatScrollAnchor />)).not.toThrow();

    // Restore the original scrollIntoView
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });
});
