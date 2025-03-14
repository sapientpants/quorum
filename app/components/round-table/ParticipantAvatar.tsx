import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import type { Participant } from '@/types/participants'
import type { CircularPosition } from './utils'

interface ParticipantAvatarProps {
  participant: Participant
  position: CircularPosition
  isActive: boolean
  onClick: () => void
  isMobileView?: boolean
}

export function ParticipantAvatar({
  participant,
  position,
  isActive,
  onClick,
  isMobileView = false
}: ParticipantAvatarProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: participant.id,
    // Disable dragging in mobile view
    disabled: isMobileView
  })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: participant.id
  })

  // Set up a combined ref function
  const setCombinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    setDroppableRef(node)
  }

  const providerIcon = {
    openai: 'simple-icons:openai',
    anthropic: 'simple-icons:anthropic',
    grok: 'solar:robot-bold',
    google: 'simple-icons:google'
  }[participant.type === 'llm' ? participant.provider : ''] || 'solar:user-bold'

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    left: `${position.x}%`,
    top: `${position.y}%`
  }

  const avatarSizeClasses = isMobileView 
    ? 'w-14 h-14 md:w-16 md:h-16' // Slightly smaller size on very small mobile, normal on larger mobile
    : 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16' // Responsive sizing based on screen size

  const iconSizeClasses = isMobileView
    ? 'w-7 h-7 md:w-8 md:h-8'
    : 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8'

  return (
    <motion.div
      ref={setCombinedRef}
      style={style}
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${
        isMobileView ? '' : 'cursor-grab active:cursor-grabbing'
      } ${
        isActive ? 'z-10' : 'z-0'
      }`}
      {...(isMobileView ? {} : attributes)}
      {...(isMobileView ? {} : listeners)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
      }}
      onClick={onClick}
      aria-label={`${participant.name} ${isActive ? '(active)' : ''}`}
    >
      <div 
        className={`
          relative flex items-center justify-center
          ${avatarSizeClasses} rounded-full bg-base-200
          ${isActive ? 'ring-2 ring-primary' : ''}
          touch-manipulation
        `}
      >
        <Icon 
          icon={providerIcon}
          className={`${iconSizeClasses} text-base-content`}
        />
        {participant.type === 'llm' && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-content rounded-full p-1">
            <Icon 
              icon="solar:cpu-bold" 
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </div>
        )}
      </div>
      <div className={`absolute top-full mt-1 sm:mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs sm:text-sm ${isMobileView ? 'font-medium' : ''}`}>
        {isMobileView 
          ? participant.name 
          : (window.innerWidth < 640 && participant.name.length > 10 
              ? `${participant.name.substring(0, 8)}...` 
              : participant.name)}
      </div>
    </motion.div>
  )
} 