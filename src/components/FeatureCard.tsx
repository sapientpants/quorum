import { ReactNode } from 'react'
import { Icon } from '@iconify/react'

interface FeatureCardProps {
  title: string
  description: string
  icon?: string | ReactNode
  iconColor?: string
  badgeText?: string
  badgeColor?: string
  className?: string
}

export function FeatureCard({
  title,
  description,
  icon,
  iconColor = '#9333ea',
  badgeText,
  badgeColor = '#9333ea',
  className = ''
}: FeatureCardProps) {
  return (
    <div className={`feature-card card-glow relative bg-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10 border border-white/10 ${className}`}>
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
        
        {icon && typeof icon === 'string' ? (
          <div className="feature-icon">
            <Icon icon={icon} width="24" height="24" style={{ color: iconColor }} />
          </div>
        ) : icon ? (
          <div className="feature-icon">
            {icon}
          </div>
        ) : null}
        
        <h2 className="feature-title">{title}</h2>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  )
}

export default FeatureCard