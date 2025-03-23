import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { LocalizedText, LocalizedList } from "../LocalizedText";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params) {
        let result = key;
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{{${param}}}`, String(value));
        });
        return result;
      }
      return key;
    },
  }),
}));

describe("LocalizedText", () => {
  it("renders text with the correct translation key", () => {
    render(<LocalizedText textKey="welcome.message" />);
    expect(screen.getByText("welcome.message")).toBeInTheDocument();
  });

  it("renders text with params correctly", () => {
    render(<LocalizedText textKey="greeting" params={{ name: "John" }} />);
    expect(screen.getByText("greeting")).toBeInTheDocument();
  });

  it("renders with custom HTML element", () => {
    render(<LocalizedText textKey="privacy.notice" as="p" />);
    expect(screen.getByText("privacy.notice").tagName).toBe("P");
  });

  it("applies custom className correctly", () => {
    render(<LocalizedText textKey="test.key" className="custom-class" />);
    expect(screen.getByText("test.key")).toHaveClass("custom-class");
  });

  it("renders children after the text", () => {
    render(
      <LocalizedText textKey="form.label">
        <input data-testid="child-input" />
      </LocalizedText>,
    );
    expect(screen.getByText("form.label")).toBeInTheDocument();
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
  });
});

describe("LocalizedList", () => {
  it("renders a list with string items", () => {
    render(
      <LocalizedList items={["first", "second", "third"]} keyPrefix="list" />,
    );
    expect(screen.getByText("list.first")).toBeInTheDocument();
    expect(screen.getByText("list.second")).toBeInTheDocument();
    expect(screen.getByText("list.third")).toBeInTheDocument();
  });

  it("renders a list with numeric indices", () => {
    render(<LocalizedList items={[0, 1, 2]} keyPrefix="list.items" />);
    expect(screen.getByText("list.items.0")).toBeInTheDocument();
    expect(screen.getByText("list.items.1")).toBeInTheDocument();
    expect(screen.getByText("list.items.2")).toBeInTheDocument();
  });

  it("renders with custom container and item elements", () => {
    render(
      <LocalizedList
        items={["first", "second"]}
        keyPrefix="nav"
        as="nav"
        itemAs="a"
      />,
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav.children[0].tagName).toBe("A");
    expect(nav.children[1].tagName).toBe("A");
  });

  it("applies custom className to container and items", () => {
    render(
      <LocalizedList
        items={["item1", "item2"]}
        keyPrefix="list"
        className="list-container"
        itemClassName="list-item"
      />,
    );
    const container = screen.getByText("list.item1").parentElement;
    expect(container).toHaveClass("list-container");
    expect(screen.getByText("list.item1")).toHaveClass("list-item");
    expect(screen.getByText("list.item2")).toHaveClass("list-item");
  });
});
