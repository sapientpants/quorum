import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParticipantsStore } from "../../store/participants";
import { useTemplatesStore } from "../../store/templatesStore";
import type { Template, TemplateFormData } from "../../types/template";

// Form validation schema
const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  participantIds: z
    .array(z.string())
    .min(1, "At least one participant is required"),
  defaultConversationStarter: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  initialData?: Template;
  onCancel: () => void;
  onSuccess?: () => void;
}

function TemplateForm({ initialData, onCancel, onSuccess }: TemplateFormProps) {
  const { t } = useTranslation();
  const participants =
    useParticipantsStore((state) => state.participants) || [];
  const { addTemplate, updateTemplate } = useTemplatesStore();

  // Ensure participants is an array
  const validParticipants = Array.isArray(participants) ? participants : [];

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      participantIds: initialData?.participantIds || [],
      defaultConversationStarter: initialData?.defaultConversationStarter || "",
    },
  });

  // Watch selected participants for UI updates
  const selectedParticipantIds = watch("participantIds");

  // Handle form submission
  const onSubmit = async (data: TemplateFormValues) => {
    try {
      if (initialData) {
        // Update existing template
        updateTemplate(initialData.id, data);
      } else {
        // Create new template
        addTemplate(data as TemplateFormData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        onCancel();
      }
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  // Toggle participant selection
  const toggleParticipant = (participantId: string) => {
    const currentIds = [...selectedParticipantIds];
    const index = currentIds.indexOf(participantId);

    if (index === -1) {
      // Add participant
      setValue("participantIds", [...currentIds, participantId]);
    } else {
      // Remove participant
      currentIds.splice(index, 1);
      setValue("participantIds", currentIds);
    }
  };

  // Check if a participant is selected
  const isParticipantSelected = (participantId: string) => {
    return selectedParticipantIds.includes(participantId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Template Name */}
      <div className="form-control">
        <label className="block">
          <span className="label-text font-medium">
            {t("templateForm.name")}
          </span>
          <input
            type="text"
            className={`input input-bordered w-full mt-2 ${errors.name ? "input-error" : ""}`}
            placeholder={t("templateForm.namePlaceholder")}
            {...register("name")}
          />
        </label>
        {errors.name && (
          <div className="mt-1">
            <span className="label-text-alt text-error">
              {errors.name.message}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="form-control">
        <label className="block">
          <span className="label-text font-medium">
            {t("templateForm.description")}
          </span>
          <textarea
            className="textarea textarea-bordered h-24 w-full mt-2"
            placeholder={t("templateForm.descriptionPlaceholder")}
            {...register("description")}
          />
        </label>
      </div>

      {/* Participants Selection */}
      <div className="form-control">
        <label className="block">
          <span className="label-text font-medium">
            {t("templateForm.selectParticipants")}
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {validParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                isParticipantSelected(participant.id)
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              }`}
              onClick={() => toggleParticipant(participant.id)}
            >
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div
                    className={`bg-neutral text-neutral-content rounded-full w-10 ${
                      isParticipantSelected(participant.id) ? "bg-primary" : ""
                    }`}
                  >
                    <span>{participant.name.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{participant.name}</h3>
                  {participant.type === "llm" && (
                    <p className="text-xs opacity-70">
                      {participant.provider} / {participant.model}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <label
                    className="cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={isParticipantSelected(participant.id)}
                      onChange={() => toggleParticipant(participant.id)}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.participantIds && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.participantIds.message}
            </span>
          </label>
        )}

        {participants.length === 0 && (
          <div className="alert alert-warning mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{t("templateForm.noParticipantsWarning")}</span>
          </div>
        )}
      </div>

      {/* Default Conversation Starter */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            {t("templateForm.defaultConversationStarter")}
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder={t("templateForm.conversationStarterPlaceholder")}
          {...register("defaultConversationStarter")}
        />
        <label className="label">
          <span className="label-text-alt opacity-70">
            {t("templateForm.conversationStarterDescription")}
          </span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {t("common.buttons.cancel")}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              {t("common.buttons.saving")}
            </>
          ) : initialData ? (
            t("templateForm.buttons.update")
          ) : (
            t("templateForm.buttons.create")
          )}
        </button>
      </div>
    </form>
  );
}

export default TemplateForm;
