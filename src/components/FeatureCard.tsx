import { ReactNode } from "react";
import { Icon } from "@iconify/react";

interface FeatureCardProps{
  readonly title: string;
  readonly description: string;
  readonly icon?: string | ReactNode;
  readonly iconColor?: string;
  readonly badgeText?: string;
  readonly badgeColor?: string;
  readonly className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  iconColor = "#9333ea",
  badgeText,
  badgeColor = "#9333ea",
  className = "",
}: FeatureCardProps) {
  // Helper function to render the appropriate icon
  const renderIcon = () => {
    if (!icon) {
      return null;
    }

    if (typeof icon === "string") {
      return (
        <div className="feature-icon">
          <Icon
            icon={icon}
            width="24"
            height="24"
            style={{ color: iconColor }}
          />
        </div>
      );
    }

    return <div className="feature-icon">{icon}</div>;
  };

  return (
    <div
      className={`feature-card card-glow relative bg-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10 border border-white/10 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 -z-10"></div>
      <div className="p-6 flex flex-col gap-4">
        {badgeText && (
          <div
            className="feature-badge"
            style={{ backgroundColor: badgeColor }}
          >
            {badgeText}
          </div>
        )}

        {renderIcon()}

        <h2 className="feature-title">{title}</h2>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );
}
