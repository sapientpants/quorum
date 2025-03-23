import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import type { Participant } from "../types/participant";
import { useTranslation } from "react-i18next";

interface RoundTableProps {
  readonly participants: Participant[];
  readonly activeParticipantId: string | null;
  readonly onParticipantClick: (id: string) => void;
  readonly className?: string;
}

interface ParticipantNodeProps {
  readonly participant: Participant;
  readonly index: number;
  readonly total: number;
  readonly size: number;
  readonly isActive: boolean;
  readonly onClick: () => void;
  readonly isThinking?: boolean;
}

function ParticipantNode({
  participant,
  index,
  total,
  size = 250,
  isActive,
  onClick,
  isThinking = false,
}: ParticipantNodeProps) {
  const { t } = useTranslation();
  // Calculate position around the circle
  const angle = (index / total) * 2 * Math.PI;
  const radius = size / 2 - 30; // Subtract avatar size / 2

  const x = radius * Math.cos(angle) + size / 2;
  const y = radius * Math.sin(angle) + size / 2;

  const nodeSize = 60;

  const isHuman = participant.type === "human";
  const icon = isHuman ? "solar:user-rounded-linear" : "solar:robot-linear";

  return (
    <div
      className={`absolute transition-all duration-500 ${isActive ? "scale-110" : "scale-100"}`}
      style={{
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
        left: `${x - nodeSize / 2}px`,
        top: `${y - nodeSize / 2}px`,
      }}
    >
      <button
        onClick={onClick}
        className={`
          w-full h-full rounded-full flex items-center justify-center 
          border-4 transition-all
          ${
            isActive
              ? "border-primary bg-primary/10 shadow-lg"
              : "border-base-300 bg-base-100 hover:border-base-content/30"
          }
        `}
        disabled={isActive}
        title={participant.name}
        aria-label={t(
          "roundTable.participant.selectParticipant",
          "Select participant {{name}}",
          { name: participant.name },
        )}
      >
        <div className="relative">
          <Icon icon={icon} className="w-6 h-6" />

          {isThinking && (
            <div className="absolute -top-1 -right-1">
              <div className="animate-pulse flex space-x-0.5">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <div className="w-1 h-1 bg-primary rounded-full animation-delay-200"></div>
                <div className="w-1 h-1 bg-primary rounded-full animation-delay-400"></div>
              </div>
            </div>
          )}
        </div>
      </button>

      <div
        className={`
          absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 
          text-xs font-medium rounded whitespace-nowrap
          ${isActive ? "bg-primary text-primary-content" : "bg-base-200"}
        `}
      >
        {participant.name}
      </div>
    </div>
  );
}

export function RoundTable({
  participants,
  activeParticipantId,
  onParticipantClick,
  className = "",
}: RoundTableProps) {
  const { t } = useTranslation();
  const [size, setSize] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjust size based on container width
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Calculate size based on container width, but keep it within reasonable bounds
        setSize(Math.min(Math.max(width - 40, 250), 500));
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // For demo purposes, show a random participant as "thinking"
  const [thinkingId, setThinkingId] = useState<string | null>(null);

  useEffect(() => {
    // If there's an active participant, simulate "thinking" state
    if (activeParticipantId && participants.length > 1) {
      const thinkingParticipants = participants.filter(
        (p) => p.id !== activeParticipantId && p.type === "llm",
      );

      if (thinkingParticipants.length) {
        const crypto = window.crypto || window.msCrypto;
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const randomIndex = array[0] % thinkingParticipants.length;
        setThinkingId(thinkingParticipants[randomIndex].id);
      }
    } else {
      setThinkingId(null);
    }
  }, [activeParticipantId, participants]);

  return (
    <div className={`${className} flex flex-col items-center`}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">
          {t("roundTable.title", "Round Table")}
        </h2>
        <p className="text-sm opacity-70">
          {t(
            "roundTable.clickToViewDetails",
            "Click on a participant to view details",
          )}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative"
        style={{
          width: "100%",
          height: `${size}px`,
          maxWidth: `${size}px`,
        }}
      >
        {/* Center circle */}
        <div
          className="absolute border-2 border-base-300 rounded-full"
          style={{
            left: `${size / 2 - (size * 0.3) / 2}px`,
            top: `${size / 2 - (size * 0.3) / 2}px`,
            width: `${size * 0.3}px`,
            height: `${size * 0.3}px`,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              icon="solar:users-group-rounded-broken"
              className="w-10 h-10 opacity-30"
            />
          </div>
        </div>

        {/* Participants */}
        {participants.map((participant, index) => (
          <ParticipantNode
            key={participant.id}
            participant={participant}
            index={index}
            total={participants.length}
            size={size}
            isActive={participant.id === activeParticipantId}
            isThinking={participant.id === thinkingId}
            onClick={() => onParticipantClick(participant.id)}
          />
        ))}
      </div>

      {activeParticipantId && (
        <div className="mt-6 text-center">
          <div className="bg-base-200 p-3 rounded-lg max-w-xs mx-auto">
            {(() => {
              const activeParticipant = participants.find(
                (p) => p.id === activeParticipantId,
              );

              if (!activeParticipant) return null;

              return (
                <>
                  <div className="font-medium">{activeParticipant.name}</div>
                  {activeParticipant.type === "llm" && (
                    <>
                      <div className="text-sm opacity-70 mt-1">
                        <span>{activeParticipant.provider}</span> •{" "}
                        <span>{activeParticipant.model}</span>
                      </div>
                      {activeParticipant.roleDescription && (
                        <div className="text-sm mt-2">
                          {activeParticipant.roleDescription}
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
