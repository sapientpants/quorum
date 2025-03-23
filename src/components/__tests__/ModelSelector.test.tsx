import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ModelSelector from "../ModelSelector";
import type { LLMModel } from "../../types/llm";
import { createTranslationMock } from "../../../vitest.setup";

// Set up translations for tests
beforeEach(() => {
  createTranslationMock({
    "modelSelector.selectModel": "Select Model",
    "modelSelector.placeholder": "Select a model",
    "modelSelector.selectAModel": "Select a model",
  });
});

describe("ModelSelector", () => {
  const mockModels: LLMModel[] = ["gpt-4o", "gpt-3.5-turbo", "claude-3-opus"];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the model selector with options", () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={null as unknown as LLMModel}
        onSelect={mockOnSelect}
      />,
    );

    // Check that the label is rendered
    expect(screen.getByText("Select Model")).toBeInTheDocument();

    // Check that the select element is rendered
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    // Check that the default option is rendered
    expect(screen.getByText("Select a model")).toBeInTheDocument();

    // Check that all model options are rendered
    mockModels.forEach((model) => {
      expect(screen.getByText(model)).toBeInTheDocument();
    });
  });

  it("selects the active model", () => {
    const activeModel: LLMModel = "gpt-4o";

    render(
      <ModelSelector
        models={mockModels}
        selectedModel={activeModel}
        onSelect={mockOnSelect}
      />,
    );

    // Check that the select element has the correct value
    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    expect(selectElement.value).toBe(activeModel);
  });

  it("calls onSelect when a model is selected", () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={null as unknown as LLMModel}
        onSelect={mockOnSelect}
      />,
    );

    // Select a model
    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "gpt-3.5-turbo" } });

    // Check that onSelect was called with the correct model
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith("gpt-3.5-turbo");
  });

  it("renders nothing when models array is empty", () => {
    const { container } = render(
      <ModelSelector models={[]} selectedModel={undefined} onSelect={mockOnSelect} />,
    );

    // Check that nothing is rendered
    expect(container.firstChild).toBeNull();
  });
});
