import { DndContext, DragEndEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { restrictToCircle } from '@dnd-kit/modifiers'
import { useCallback, useMemo } from 'react'
import { ParticipantAvatar } from './ParticipantAvatar'
import { calculateCircularPositions } from './utils'
import type { Participant } from '@/types/participants'

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
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  )

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
    <div className="relative w-full aspect-square max-w-3xl mx-auto">
      <DndContext
        sensors={sensors}
        modifiers={[restrictToCircle]}
        onDragEnd={handleDragEnd}
      >
        <div className="absolute inset-0">
          {participants.map((participant, index) => (
            <ParticipantAvatar
              key={participant.id}
              participant={participant}
              position={positions[index]}
              isActive={participant.id === activeParticipantId}
              onClick={() => onParticipantClick(participant.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
} 