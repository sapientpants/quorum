import { DndContext, DragEndEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { restrictToCircle } from '@dnd-kit/modifiers'
import { useCallback, useMemo, useState } from 'react'
import { ParticipantAvatar } from './ParticipantAvatar'
import { calculateCircularPositions } from './utils'
import type { Participant } from '@/types/participants'
import { Icon } from '@iconify/react'

interface RoundTableProps {
  participants: Participant[]
  activeParticipantId: string | null
  onReorder: (fromIndex: number, toIndex: number) => void
  onParticipantClick: (id: string) => void
}

export function RoundTable({ 
  participants,
  activeParticipantId,
  onReorder,
  onParticipantClick
}: RoundTableProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Configure sensors with better touch handling
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Lower the activation distance to make it easier to start dragging
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Improve the touch sensitivity for mobile
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  )

  // Calculate positions based on the number of participants
  const positions = useMemo(() => 
    calculateCircularPositions(participants.length),
    [participants.length]
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const oldIndex = participants.findIndex(p => p.id === active.id)
    const newIndex = participants.findIndex(p => p.id === over.id)
    
    if (oldIndex !== newIndex) onReorder(oldIndex, newIndex)
  }, [participants, onReorder])

  return (
    <div className="relative w-full md:w-[95%] lg:w-[90%] xl:w-[85%] mx-auto">
      {/* Mobile Collapse/Expand Toggle */}
      <button 
        className="md:hidden absolute -top-12 right-0 z-10 btn btn-sm btn-ghost flex items-center gap-1"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand round table" : "Collapse round table"}
      >
        <Icon 
          icon={isCollapsed ? "solar:square-arrow-down-bold" : "solar:square-arrow-up-bold"} 
          className="w-4 h-4" 
        />
        {isCollapsed ? "Show participants" : "Hide participants"}
      </button>
      
      <div className={`relative ${isCollapsed ? 'h-16' : 'aspect-square'} max-w-3xl mx-auto transition-all duration-300`}>
        <DndContext
          sensors={sensors}
          modifiers={[restrictToCircle]}
          onDragEnd={handleDragEnd}
        >
          <div className="absolute inset-0">
            {isCollapsed ? (
              // Collapsed view - just show active participant
              <div className="flex items-center justify-center h-full">
                {activeParticipantId && (
                  <ParticipantAvatar
                    key={activeParticipantId}
                    participant={participants.find(p => p.id === activeParticipantId) || participants[0]}
                    position={{ x: 50, y: 50 }}
                    isActive={true}
                    onClick={() => setIsCollapsed(false)}
                    isMobileView={true}
                  />
                )}
                {participants.length > 0 && !activeParticipantId && (
                  <div className="text-center">
                    <p className="text-sm">No active participant</p>
                    <button 
                      className="btn btn-xs btn-ghost mt-1"
                      onClick={() => setIsCollapsed(false)}
                    >
                      Show all
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Full view with all participants
              participants.map((participant, index) => (
                <ParticipantAvatar
                  key={participant.id}
                  participant={participant}
                  position={positions[index]}
                  isActive={participant.id === activeParticipantId}
                  onClick={() => onParticipantClick(participant.id)}
                  isMobileView={false}
                />
              ))
            )}
          </div>
        </DndContext>
      </div>
    </div>
  )
} 