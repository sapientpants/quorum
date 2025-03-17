import { describe, it, expect, vi } from "vitest";
import { cn } from "../utils";

// Mock the dependencies
vi.mock("clsx", () => ({
  clsx: (
    inputs: (string | undefined | null | false | Record<string, boolean>)[],
  ) => {
    // Process each input
    return inputs
      .map((input) => {
        // Handle objects by converting them to class strings
        if (input && typeof input === "object") {
          return Object.entries(input)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => key)
            .join(" ");
        }
        return input;
      })
      .filter(Boolean)
      .join(" ");
  },
}));

vi.mock("tailwind-merge", () => ({
  twMerge: (className: string) => className,
}));

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("should filter out falsy values", () => {
    const result = cn("class1", null, undefined, false, "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle conditional classes with objects", () => {
    const result = cn("base-class", {
      "conditional-class": true,
      "disabled-class": false,
    });
    expect(result).toBe("base-class conditional-class");
  });

  it("should handle multiple conditional objects", () => {
    const result = cn(
      "base-class",
      { active: true },
      { disabled: false, highlighted: true },
    );
    expect(result).toBe("base-class active highlighted");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle mixed input types", () => {
    const result = cn(
      "fixed-class",
      null,
      { "conditional-class": true },
      undefined,
      "another-class",
      { disabled: false },
    );
    expect(result).toBe("fixed-class conditional-class another-class");
  });
});
