import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TemplateList from "../components/templates/TemplateList";
import { useTemplatesStore } from "../store/templatesStore";
import { useParticipantsStore } from "../store/participants";

export function Templates() {
  useTranslation(); // Keep translation context for i18n to work
  const navigate = useNavigate();
  const { getTemplateById } = useTemplatesStore();
  const { setActiveParticipant } = useParticipantsStore();

  const handleUseTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);

    if (!template) {
      console.error("Template not found:", templateId);
      return;
    }

    // Set up participants based on the template
    if (template.participantIds.length > 0) {
      // Set the first participant as active
      setActiveParticipant(template.participantIds[0]);
    }

    // Navigate to the chat page
    navigate("/chat");

    // If there's a default conversation starter, we could trigger it here
    // or pass it as state to the chat page
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <TemplateList onUseTemplate={handleUseTemplate} />
    </div>
  );
}
