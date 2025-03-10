import { useDraggable } from '@dnd-kit/core'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import type { Participant } from '@/types/participants'
import type { CircularPosition } from './utils'

interface ParticipantAvatarProps {
  participant: Participant
  position: CircularPosition
  isActive: boolean
  onClick: () => void
}

export function ParticipantAvatar({
  participant,
  position,
  isActive,
  onClick
}: ParticipantAvatarProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: participant.id
  })

  const providerIcon = {
    openai: 'simple-icons:openai',
    anthropic: 'simple-icons:anthropic',
    grok: 'solar:robot-bold'
  }[participant.type === 'llm' ? participant.provider : ''] || 'solar:user-bold'

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    left: `${position.x}%`,
    top: `${position.y}%`
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${
        isActive ? 'z-10' : 'z-0'
      }`}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
      }}
      onClick={onClick}
    >
      <div 
        className={`
          relative flex items-center justify-center
          w-16 h-16 rounded-full bg-base-200
          ${isActive ? 'ring-2 ring-primary' : ''}
        `}
      >
        <Icon 
          icon={providerIcon}
          className="w-8 h-8 text-base-content"
        />
        {participant.type === 'llm' && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-content rounded-full p-1">
            <Icon 
              icon="solar:cpu-bold" 
              className="w-4 h-4"
            />
          </div>
        )}
      </div>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm">
        {participant.name}
      </div>
    </motion.div>
  )
} 