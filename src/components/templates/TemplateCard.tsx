import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Template } from "../../types/template";
import type { Participant } from "../../types/participant";
import { useParticipantsStore } from "../../store/participants";

interface TemplateCardProps {
  template: Template;
  onUse: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onShare?: (templateId: string) => void;
}

function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  onShare,
}: TemplateCardProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const participants = useParticipantsStore((state) => state.participants);

  // Get participants for this template
  const validParticipantIds = Array.isArray(template.participantIds)
    ? template.participantIds
    : [];
  const validParticipants = Array.isArray(participants) ? participants : [];

  const templateParticipants = validParticipantIds
    .map((id) => validParticipants.find((p) => p.id === id))
    .filter((p): p is Participant => p !== undefined);

  // Format date
  const formattedDate = new Date(
    template.updatedAt || Date.now(),
  ).toLocaleDateString();

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-xl font-bold">{template.name}</h2>
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {isMenuOpen && (
              <button
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                onClick={() => setIsMenuOpen(false)}
              >
                <ul>
                  <li>
                    <button onClick={() => onUse(template.id)}>
                      {t("Use Template")}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onEdit(template.id)}>
                      {t("Edit")}
                    </button>
                  </li>
                  {onShare && (
                    <li>
                      <button
                        onClick={() => onShare(template.id)}
                        className="w-full text-left"
                      >
                        {t("Share")}
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => onDelete(template.id)}
                      className="w-full text-left text-error"
                    >
                      {t("Delete")}
                    </button>
                  </li>
                </ul>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm opacity-70 mt-2">{template.description}</p>

        <div className="divider my-2"></div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{t("Participants")}:</span>
            <div className="flex -space-x-2">
              {templateParticipants.slice(0, 5).map((participant) => (
                <div
                  key={participant.id}
                  className="avatar placeholder tooltip"
                  data-tip={participant.name}
                >
                  <div className="bg-neutral text-neutral-content w-8 rounded-full">
                    <span className="text-xs">
                      {participant.name.charAt(0)}
                    </span>
                  </div>
                </div>
              ))}
              {templateParticipants.length > 5 && (
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content w-8 rounded-full">
                    <span className="text-xs">
                      +{templateParticipants.length - 5}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {template.defaultConversationStarter && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t("Starter")}:</span>
              <span className="text-sm italic truncate max-w-[200px]">
                "{template.defaultConversationStarter}"
              </span>
            </div>
          )}
        </div>

        <div className="card-actions justify-between items-center mt-4">
          <span className="text-xs opacity-50">
            {t("Updated")}: {formattedDate}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onUse(template.id)}
          >
            {t("Use Template")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateCard;
