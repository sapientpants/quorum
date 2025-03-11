import * as React from 'react'
import { Icon } from '@iconify/react'

interface FeatureCardProps {
  icon: string
  iconColor: string
  badgeText: string
  badgeColor: string
  title: string
  description: string
}

export function FeatureCard({
  icon,
  iconColor,
  badgeText,
  badgeColor,
  title,
  description
}: FeatureCardProps) {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 shadow-lg rounded-xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 -z-10"></div>
      <div className="w-12 h-12 rounded-lg bg-opacity-10 flex items-center justify-center mb-4" style={{ backgroundColor: `${badgeColor}10` }}>
        <Icon icon={icon} width="24" height="24" style={{ color: iconColor }} />
      </div>
      <div
        className="text-sm font-medium px-2 py-1 rounded-full inline-block mb-2"
        style={{
          backgroundColor: `${badgeColor}10`,
          color: badgeColor
        }}
      >
        {badgeText}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-300">
        {description}
      </p>
    </div>
  )
}