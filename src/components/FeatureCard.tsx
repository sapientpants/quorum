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
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        {badgeText && (
          <div className="badge" style={{ backgroundColor: badgeColor, color: 'white' }}>
            {badgeText}
          </div>
        )}
        
        {icon && typeof icon === 'string' ? (
          <div className="card-icon">
            <Icon icon={icon} width="24" height="24" style={{ color: iconColor }} />
          </div>
        ) : icon ? (
          <div className="card-icon">{icon}</div>
        ) : null}
        
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default FeatureCard