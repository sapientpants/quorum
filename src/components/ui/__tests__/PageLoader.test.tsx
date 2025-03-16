import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PageLoader } from "../PageLoader";

describe("PageLoader", () => {
  it("renders the loading spinner", () => {
    const { container } = render(<PageLoader />);

    // Check that the container has the correct classes
    const loaderContainer = container.firstChild as HTMLElement;
    expect(loaderContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "w-full",
      "h-full",
    );
    expect(loaderContainer).toHaveClass("min-h-[50vh]");

    // Check that the spinner has the correct classes
    const spinner = loaderContainer.firstChild as HTMLElement;
    expect(spinner).toHaveClass("animate-spin", "rounded-full", "h-12", "w-12");
    expect(spinner).toHaveClass("border-t-2", "border-b-2", "border-primary");
  });

  it("has the correct structure", () => {
    const { container } = render(<PageLoader />);

    // Check that the component has the correct structure
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.firstChild).toBeInTheDocument();

    // Check that there are no unexpected elements
    expect(container.firstChild?.childNodes.length).toBe(1);
  });
});
