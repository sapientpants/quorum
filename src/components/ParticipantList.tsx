import { useState } from 'react'
import { Icon } from '@iconify/react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { ParticipantForm } from './ParticipantForm'
import { useParticipantsStore } from '../store/participants'
import type { Participant } from '../types/participant'

interface ParticipantCardProps {
  participant: Participant
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function ParticipantCard({ participant, onEdit, onDelete }: ParticipantCardProps) {
  const isHuman = participant.type === 'human'
  
  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-base flex items-center gap-2">
            {isHuman ? (
              <Icon icon="solar:user-linear" className="w-5 h-5" />
            ) : (
              <Icon icon="solar:robot-linear" className="w-5 h-5" />
            )}
            {participant.name}
          </h3>
          
          {!isHuman && (
            <div className="badge badge-sm">
              {participant.provider}
            </div>
          )}
        </div>
        
        {!isHuman && (
          <div className="text-xs opacity-70 mt-1">
            <span className="font-medium">Model:</span> {participant.model}
          </div>
        )}
        
        <div className="card-actions justify-end mt-3">
          {!isHuman && (
            <button 
              onClick={() => onEdit(participant.id)} 
              className="btn btn-xs btn-ghost"
            >
              <Icon icon="solar:pen-linear" className="w-4 h-4" />
              Edit
            </button>
          )}
          
          {!isHuman && (
            <button 
              onClick={() => onDelete(participant.id)} 
              className="btn btn-xs btn-ghost text-error"
            >
              <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface SortableParticipantProps extends ParticipantCardProps {
  id: string
}

function SortableParticipant({ id, ...props }: SortableParticipantProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })
  
  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const
  }
  
  return (
    <div ref={setNodeRef} style={style} className="mb-3 group">
      <div 
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-70 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <Icon icon="solar:menu-dots-bold" className="w-5 h-5" />
      </div>
      <div className="pl-8">
        <ParticipantCard {...props} />
      </div>
    </div>
  )
}

interface ConfirmDeleteProps {
  participant: Participant
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDelete({ participant, onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-2">Delete Participant</h3>
      <p className="mb-4">
        Are you sure you want to delete <span className="font-medium">{participant.name}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-error" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </div>
  )
}

export function ParticipantList() {
  const { 
    participants, 
    addParticipant, 
    removeParticipant, 
    updateParticipant,
    reorderParticipants 
  } = useParticipantsStore()
  
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null)
  const [deletingParticipantId, setDeletingParticipantId] = useState<string | null>(null)
  
  const editingParticipant = editingParticipantId 
    ? participants.find(p => p.id === editingParticipantId) 
    : null
    
  const deletingParticipant = deletingParticipantId
    ? participants.find(p => p.id === deletingParticipantId)
    : null
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = participants.findIndex(p => p.id === active.id)
      const newIndex = participants.findIndex(p => p.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderParticipants(oldIndex, newIndex)
      }
    }
  }
  
  function handleEdit(id: string) {
    setEditingParticipantId(id)
  }
  
  function handleDelete(id: string) {
    setDeletingParticipantId(id)
  }
  
  function handleConfirmDelete() {
    if (deletingParticipantId) {
      removeParticipant(deletingParticipantId)
      setDeletingParticipantId(null)
    }
  }
  
  function handleCancelDelete() {
    setDeletingParticipantId(null)
  }
  
  function handleAddParticipant(participant: Omit<Participant, 'id'>) {
    addParticipant(participant)
    setIsAddingParticipant(false)
  }
  
  function handleUpdateParticipant(data: Omit<Participant, 'id'>) {
    if (editingParticipantId) {
      updateParticipant(editingParticipantId, data)
      setEditingParticipantId(null)
    }
  }
  
  if (isAddingParticipant) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-medium mb-4">Add New Participant</h2>
        <ParticipantForm
          onSubmit={handleAddParticipant}
          onCancel={() => setIsAddingParticipant(false)}
        />
      </div>
    )
  }
  
  if (editingParticipant) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-medium mb-4">Edit Participant</h2>
        <ParticipantForm
          initialData={editingParticipant}
          onSubmit={handleUpdateParticipant}
          onCancel={() => setEditingParticipantId(null)}
        />
      </div>
    )
  }
  
  if (deletingParticipant) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <ConfirmDelete
          participant={deletingParticipant}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Participants</h2>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddingParticipant(true)}
        >
          <Icon icon="solar:add-circle-linear" className="w-5 h-5" />
          Add Participant
        </button>
      </div>
      
      <div className="mb-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={participants.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {participants.length === 0 ? (
              <div className="text-center py-8 bg-base-200 rounded-lg">
                <Icon icon="solar:users-group-rounded-linear" className="w-12 h-12 mx-auto opacity-50" />
                <p className="mt-2 text-lg">No participants yet</p>
                <p className="text-sm opacity-70">Add your first participant to get started</p>
              </div>
            ) : (
              <div>
                {participants.map(participant => (
                  <SortableParticipant
                    key={participant.id}
                    id={participant.id}
                    participant={participant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
      
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Icon icon="solar:info-circle-linear" className="w-5 h-5" />
          Tips
        </h3>
        <ul className="text-sm space-y-2 opacity-80">
          <li>• Drag participants to reorder them</li>
          <li>• Each participant can have a unique role and system prompt</li>
          <li>• Human participants cannot be edited or deleted</li>
        </ul>
      </div>
    </div>
  )
} 