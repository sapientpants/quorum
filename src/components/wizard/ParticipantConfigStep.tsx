import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { ParticipantForm } from "../ParticipantForm";
import { useParticipantsStore } from "../../store/participants";
import type { Participant } from "../../types/participant";
import { v4 as uuidv4 } from "uuid";

interface ParticipantConfigStepProps {
  readonly onNext: () => void;
  readonly onBack: () => void;
}

export function ParticipantConfigStep({
  onNext,
  onBack,
}: ParticipantConfigStepProps) {
  const { t } = useTranslation();
  const { participants, addParticipant } = useParticipantsStore();
  const [showForm, setShowForm] = useState(participants.length === 0);
  const [formKey, setFormKey] = useState(0); // Used to reset the form

  // Check if there's at least one non-user participant
  const hasNonUserParticipant = participants.some((p) => p.type === "llm");

  function handleAddParticipant(participantData: Omit<Participant, "id">) {
    // Add an ID to the participant data
    const participant = {
      ...participantData,
      id: uuidv4(),
    } as Participant;

    addParticipant(participant);
    setShowForm(false);
    // Increment the key to reset the form for next use
    setFormKey((prev) => prev + 1);
  }

  function handleAddAnother() {
    setShowForm(true);
  }

  function handleComplete() {
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {t("wizard.participants.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("wizard.participants.description")}
        </p>
      </div>

      {participants.length > 0 && !showForm && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("wizard.participants.currentParticipants")}
          </h3>

          <div className="space-y-3">
            {participants.map((participant) => {
              // Only LLM participants have provider and model
              const isLLM = participant.type === "llm";
              const llmParticipant = isLLM ? participant : null;

              return (
                <div
                  key={participant.id}
                  className="p-4 rounded-lg border border-border bg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                      <span className="text-white font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{participant.name}</h4>
                      {isLLM && llmParticipant?.roleDescription && (
                        <p className="text-sm text-muted-foreground">
                          {llmParticipant.roleDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {isLLM && llmParticipant && (
                    <div className="text-sm text-muted-foreground">
                      {llmParticipant.provider} / {llmParticipant.model}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="mt-4 flex items-center gap-2"
            onClick={handleAddAnother}
          >
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            {t("wizard.participants.addParticipant")}
          </Button>
        </div>
      )}

      {participants.length === 0 && !showForm && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {t("wizard.participants.noParticipants")}
          </p>

          <Button
            className="flex items-center gap-2 mx-auto"
            onClick={handleAddAnother}
          >
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            {t("wizard.participants.addFirst")}
          </Button>
        </div>
      )}

      {showForm && (
        <div className="border border-border rounded-lg p-4">
          <ParticipantForm
            key={formKey}
            onSubmit={handleAddParticipant}
            onCancel={() => participants.length > 0 && setShowForm(false)}
          />
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          {t("wizard.navigation.back")}
        </Button>

        <Button
          onClick={handleComplete}
          disabled={!hasNonUserParticipant || showForm}
          variant="default"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {t("wizard.participants.complete")}
        </Button>
      </div>
    </div>
  );
}
