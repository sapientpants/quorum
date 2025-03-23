import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { Participant } from "../types/participant";
import type { LLMProviderId } from "../types/llm";
import { LLM_PROVIDERS } from "../types/llm";
import { useTranslation } from "react-i18next";

interface ParticipantFormProps {
  readonly initialData?: Partial<Participant>;
  readonly onSubmit: (data: Omit<Participant, "id">) => void;
  readonly onCancel: () => void;
}

// Default values remain the same since they're not displayed text
const defaultValues = {
  name: "",
  provider: "openai" as LLMProviderId,
  model: "",
  roleDescription: "",
  systemPrompt: "",
  settings: {
    temperature: 0.7,
    maxTokens: 2048,
  },
};

export function ParticipantForm({
  initialData,
  onSubmit,
  onCancel,
}: ParticipantFormProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const sortedProviders = [...LLM_PROVIDERS].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  // Create form schema with translated validation messages
  const formSchema = z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    provider: z.enum(["openai", "anthropic", "grok", "google"] as const),
    model: z.string().min(1, t("validation.modelRequired")),
    roleDescription: z.string().optional(),
    systemPrompt: z.string().min(1, t("validation.systemPromptRequired")),
    settings: z.object({
      temperature: z.number().min(0).max(2),
      maxTokens: z.number().positive(),
    }),
  });

  type FormData = z.infer<typeof formSchema>;

  // Detect mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  const providerID = watch("provider") as LLMProviderId;
  const selectedProvider = LLM_PROVIDERS.find((p) => p.id === providerID);
  const models = selectedProvider
    ? [...selectedProvider.models].sort((a, b) => a.localeCompare(b))
    : [];

  function onFormSubmit(data: FormData) {
    onSubmit({
      ...data,
      type: "llm",
    });
  }

  // Helper function to determine icon based on advanced settings state
  const getAdvancedSettingsIcon = () => {
    if (showAdvanced) {
      return "solar:alt-arrow-up-linear";
    }
    return "solar:alt-arrow-down-linear";
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 bg-base-100 p-3 sm:p-5 rounded-lg shadow-sm max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">
          Participant Configuration
        </h2>

        {/* Mobile-optimized form navigation */}
        {isMobileView && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-sm btn-ghost"
              aria-label={t("common.actions.cancel")}
            >
              <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("participantForm.name")}
            <input
              type="text"
              className="input input-bordered w-full p-3 text-base mt-1"
              placeholder={t("participantForm.namePlaceholder")}
              {...register("name")}
            />
          </label>
          {errors.name && (
            <p className="text-error text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("participantForm.provider")}
              <select
                className="select select-bordered w-full p-3 text-base h-auto min-h-12 mt-1"
                {...register("provider")}
              >
                {sortedProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </label>
            {errors.provider && (
              <p className="text-error text-sm mt-1">
                {errors.provider.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("participantForm.model")}
              <select
                className="select select-bordered w-full p-3 text-base h-auto min-h-12 mt-1"
                {...register("model")}
              >
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
            {errors.model && (
              <p className="text-error text-sm mt-1">{errors.model.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Role Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("participantForm.roleDescription")}
          <textarea
            className="textarea textarea-bordered w-full h-28 mt-1"
            placeholder={t("participantForm.roleDescriptionPlaceholder")}
            {...register("roleDescription")}
          />
        </label>
        {errors.roleDescription && (
          <p className="text-error text-sm mt-1">
            {errors.roleDescription.message}
          </p>
        )}
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium">
          {t("participantForm.systemPrompt")}
          <div className="mt-1">
            <div className="mb-2 text-sm opacity-70">
              {t("participantForm.systemPromptDescription")}
            </div>
            <textarea
              className="textarea textarea-bordered w-full h-40"
              placeholder={t("participantForm.systemPromptPlaceholder")}
              {...register("systemPrompt")}
            />
          </div>
        </label>
        {errors.systemPrompt && (
          <p className="text-error text-sm mt-1">
            {errors.systemPrompt.message}
          </p>
        )}
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-2 h-auto py-2 px-3"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Icon icon={getAdvancedSettingsIcon()} className="w-4 h-4" />
          {t("participantForm.advancedSettings")}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-base-200 rounded-lg">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("participantForm.temperature")} (
                  {watch("settings.temperature").toFixed(1)})
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    className="range range-primary mt-1"
                    value={watch("settings.temperature")}
                    onChange={(e) => {
                      setValue(
                        "settings.temperature",
                        parseFloat(e.target.value),
                      );
                    }}
                  />
                </label>
                <div className="flex justify-between text-xs opacity-70">
                  <span>{t("participantForm.temperatureOptions.precise")}</span>
                  <span>
                    {t("participantForm.temperatureOptions.balanced")}
                  </span>
                  <span>
                    {t("participantForm.temperatureOptions.creative")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("participantForm.maxTokens")} (
                  {watch("settings.maxTokens")})
                  <input
                    type="range"
                    min="500"
                    max="16000"
                    step="500"
                    className="range range-primary mt-1"
                    value={watch("settings.maxTokens")}
                    onChange={(e) => {
                      setValue("settings.maxTokens", parseInt(e.target.value));
                    }}
                  />
                </label>
                <div className="flex justify-between text-xs opacity-70">
                  <span>{t("participantForm.maxTokensOptions.short")}</span>
                  <span>{t("participantForm.maxTokensOptions.medium")}</span>
                  <span>{t("participantForm.maxTokensOptions.long")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-300">
        {!isMobileView && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost order-2 sm:order-1 h-auto py-3"
          >
            {t("common.buttons.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex-1 order-1 sm:order-2 h-auto py-3"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t("common.buttons.saving")}
            </>
          ) : initialData?.name ? (
            t("participantForm.buttons.update")
          ) : (
            t("participantForm.buttons.create")
          )}
        </button>
      </div>
    </form>
  );
}
