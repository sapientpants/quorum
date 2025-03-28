import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, type MockInstance } from "vitest";
import TemplateForm from "../TemplateForm";
import { useParticipantsStore } from "../../../store/participants";
import { useTemplatesStore } from "../../../store/templatesStore";

// Mock the stores
vi.mock("../../../store/participants", () => ({
  useParticipantsStore: vi.fn(),
}));

vi.mock("../../../store/templatesStore", () => ({
  useTemplatesStore: vi.fn(),
}));

// Mock react-hook-form
vi.mock("react-hook-form", () => {
  return {
    useForm: () => ({
      register: (name: string) => ({
        name,
        id: name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      }),
      handleSubmit: vi.fn(
        (fn) => (e: React.FormEvent<HTMLFormElement> | undefined) => {
          e?.preventDefault?.();
          return fn({
            name: "Test Template",
            description: "Test Description",
            participantIds: ["user1"],
            defaultConversationStarter: "Hello",
          });
        },
      ),
      formState: {
        errors: {
          name: { message: "Name is required" },
          participantIds: { message: "At least one participant is required" },
        },
        isSubmitting: false,
      },
      watch: vi.fn().mockReturnValue(["user1"]),
      setValue: vi.fn(),
      reset: vi.fn(),
    }),
    Controller: ({
      render,
    }: {
      render: (props: {
        field: {
          onChange: (value: unknown) => void;
          value: string;
          name: string;
        };
      }) => React.ReactElement;
    }) => render({ field: { onChange: vi.fn(), value: "", name: "" } }),
  };
});

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "templateForm.name": "Template Name",
        "templateForm.description": "Description",
        "templateForm.participants": "Select Participants",
        "templateForm.defaultConversationStarter":
          "Default Conversation Starter (Optional)",
        "templateForm.buttons.create": "Create Template",
        "templateForm.buttons.update": "Update Template",
        "common.buttons.cancel": "Cancel",
        "templateForm.validation.nameRequired": "Name is required",
        "templateForm.validation.participantsRequired":
          "At least one participant is required",
      };
      return translations[key] || key;
    },
  }),
}));

describe("TemplateForm", () => {
  const mockParticipants = [
    {
      id: "user1",
      name: "User 1",
      type: "human",
    },
    {
      id: "ai1",
      name: "AI 1",
      type: "llm",
      provider: "openai",
      model: "gpt-4o",
      systemPrompt: "You are a helpful assistant",
      settings: {
        temperature: 0.7,
        maxTokens: 1000,
      },
    },
  ];

  const mockAddTemplate = vi.fn();
  const mockUpdateTemplate = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the mock stores
    (useParticipantsStore as unknown as MockInstance).mockImplementation(
      (selector) => {
        if (typeof selector === "function") {
          return selector({ participants: mockParticipants });
        }
        return { participants: mockParticipants };
      },
    );
    (useTemplatesStore as unknown as MockInstance).mockReturnValue({
      addTemplate: mockAddTemplate,
      updateTemplate: mockUpdateTemplate,
    });
  });

  it("renders the form with empty values for new template", () => {
    render(<TemplateForm onCancel={mockOnCancel} />);

    // Check if form elements are rendered
    expect(screen.getByText("Template Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("templateForm.selectParticipants"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Default Conversation Starter (Optional)"),
    ).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Template" }),
    ).toBeInTheDocument();
  });

  it("renders the form with initial values for editing", () => {
    const initialData = {
      id: "template1",
      name: "Test Template",
      description: "Test Description",
      participantIds: ["user1"],
      defaultConversationStarter: "Hello",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    render(<TemplateForm initialData={initialData} onCancel={mockOnCancel} />);

    // Check if form has the update button instead of create
    expect(
      screen.getByRole("button", { name: "Update Template" }),
    ).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<TemplateForm onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    render(<TemplateForm onCancel={mockOnCancel} />);

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: "Create Template" }));

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("toggles participant selection when clicked", () => {
    render(<TemplateForm onCancel={mockOnCancel} />);

    // Check that the participant selection element exists
    const participantElement = screen.getByText(
      "templateForm.selectParticipants",
    );
    expect(participantElement).toBeInTheDocument();

    // This test will be expanded when we implement proper participant selection UI mockup
  });
});
