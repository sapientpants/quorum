import { useState } from "react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema for the advanced settings
const advancedSettingsSchema = z.object({
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().positive(),
  topP: z.number().min(0).max(1).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
});

type AdvancedSettingsData = z.infer<typeof advancedSettingsSchema>;

interface ParticipantAdvancedSettingsProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialSettings: Partial<AdvancedSettingsData>;
  readonly onSave: (settings: AdvancedSettingsData) => void;
}

export function ParticipantAdvancedSettings({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}: ParticipantAdvancedSettingsProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "experimental">("basic");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdvancedSettingsData>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      temperature: initialSettings.temperature ?? 0.7,
      maxTokens: initialSettings.maxTokens ?? 1000,
      topP: initialSettings.topP ?? 0.9,
      presencePenalty: initialSettings.presencePenalty ?? 0,
      frequencyPenalty: initialSettings.frequencyPenalty ?? 0,
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: AdvancedSettingsData) => {
    onSave(data);
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-1">
          <div className="tabs tabs-boxed justify-center bg-transparent">
            <button
              className={`tab ${activeTab === "basic" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              Basic
            </button>
            <button
              className={`tab ${activeTab === "experimental" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("experimental")}
            >
              Experimental
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-6">
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="temperature"
                    className="block text-sm font-medium mb-1"
                  >
                    Temperature: {watch("temperature")}
                  </label>
                  <input
                    type="range"
                    id="temperature"
                    step="0.1"
                    min="0"
                    max="2"
                    className="range w-full"
                    {...register("temperature", { valueAsNumber: true })}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Precise (0)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (2)</span>
                  </div>
                  {errors.temperature && (
                    <p className="text-error text-sm mt-1">
                      {errors.temperature.message}
                    </p>
                  )}
                  <p className="text-sm mt-3 text-base-content/70">
                    Controls randomness. Lower values make the model more
                    deterministic and focused, while higher values make output
                    more random and creative.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maxTokens"
                    className="block text-sm font-medium mb-1"
                  >
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    id="maxTokens"
                    className="input input-bordered w-full"
                    min={1}
                    {...register("maxTokens", { valueAsNumber: true })}
                  />
                  {errors.maxTokens && (
                    <p className="text-error text-sm mt-1">
                      {errors.maxTokens.message}
                    </p>
                  )}
                  <p className="text-sm mt-1 text-base-content/70">
                    The maximum number of tokens the model will generate. 1
                    token is about 4 characters. A typical sentence is 15-20
                    tokens.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "experimental" && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="topP"
                    className="block text-sm font-medium mb-1"
                  >
                    Top P: {watch("topP")}
                  </label>
                  <input
                    type="range"
                    id="topP"
                    step="0.05"
                    min="0"
                    max="1"
                    className="range w-full"
                    {...register("topP", { valueAsNumber: true })}
                  />
                  {errors.topP && (
                    <p className="text-error text-sm mt-1">
                      {errors.topP.message}
                    </p>
                  )}
                  <p className="text-sm mt-1 text-base-content/70">
                    Controls diversity via nucleus sampling. A value of 0.9
                    means the model considers the top 90% most probable tokens.
                    Lower values increase focus, higher values increase
                    diversity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="presencePenalty"
                      className="block text-sm font-medium mb-1"
                    >
                      Presence Penalty: {watch("presencePenalty")}
                    </label>
                    <input
                      type="range"
                      id="presencePenalty"
                      step="0.1"
                      min="-2"
                      max="2"
                      className="range w-full"
                      {...register("presencePenalty", { valueAsNumber: true })}
                    />
                    {errors.presencePenalty && (
                      <p className="text-error text-sm mt-1">
                        {errors.presencePenalty.message}
                      </p>
                    )}
                    <p className="text-sm mt-1 text-base-content/70">
                      Positive values penalize new tokens based on whether they
                      appear in the text so far, increasing the model's
                      likelihood to talk about new topics.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="frequencyPenalty"
                      className="block text-sm font-medium mb-1"
                    >
                      Frequency Penalty: {watch("frequencyPenalty")}
                    </label>
                    <input
                      type="range"
                      id="frequencyPenalty"
                      step="0.1"
                      min="-2"
                      max="2"
                      className="range w-full"
                      {...register("frequencyPenalty", { valueAsNumber: true })}
                    />
                    {errors.frequencyPenalty && (
                      <p className="text-error text-sm mt-1">
                        {errors.frequencyPenalty.message}
                      </p>
                    )}
                    <p className="text-sm mt-1 text-base-content/70">
                      Positive values penalize new tokens based on their
                      frequency in the text so far, decreasing the model's
                      likelihood to repeat the same line verbatim.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-base-300">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
