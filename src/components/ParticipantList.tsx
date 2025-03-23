import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { ParticipantForm } from "./ParticipantForm";
import { useParticipantsStore } from "../store/participants";
import type { Participant } from "../types/participant";

interface ParticipantCardProps {
  readonly participant: Participant;
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

function ParticipantCard({
  participant,
  onEdit,
  onDelete,
}: ParticipantCardProps) {
  const isHuman = participant.type === "human";

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow border border-base-300">
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
            <div className="badge badge-sm">{participant.provider}</div>
          )}
        </div>

        {!isHuman && (
          <>
            <div className="text-xs opacity-70 mt-1 space-y-1">
              <div>
                <span className="font-medium">Model:</span> {participant.model}
              </div>
              {participant.roleDescription && (
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  {participant.roleDescription}
                </div>
              )}
            </div>
            <div className="text-xs mt-2 line-clamp-2 opacity-60 italic">
              {participant.systemPrompt || "No system prompt defined"}
            </div>
          </>
        )}

        <div className="card-actions justify-end mt-3">
          {!isHuman && (
            <button
              onClick={() => onEdit(participant.id)}
              className="btn btn-xs btn-ghost gap-1"
            >
              <Icon icon="solar:pen-linear" className="w-4 h-4" />
              Edit
            </button>
          )}

          {!isHuman && (
            <button
              onClick={() => onDelete(participant.id)}
              className="btn btn-xs btn-ghost text-error gap-1"
            >
              <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SortableParticipantProps extends ParticipantCardProps {
  readonly id: string;
}

function SortableParticipant({ id, ...props }: SortableParticipantProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: "relative" as const,
  };

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
  );
}

interface ConfirmDeleteProps {
  readonly participant: Participant;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function ConfirmDelete({
  participant,
  onConfirm,
  onCancel,
}: ConfirmDeleteProps) {
  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-2">Delete Participant</h3>
      <p className="mb-4">
        Are you sure you want to delete{" "}
        <span className="font-medium">{participant.name}</span>? This action
        cannot be undone.
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
  );
}

export function ParticipantList() {
  const {
    participants,
    addParticipant,
    removeParticipant,
    updateParticipant,
    reorderParticipants,
  } = useParticipantsStore();

  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<
    string | null
  >(null);
  const [deletingParticipantId, setDeletingParticipantId] = useState<
    string | null
  >(null);

  const editingParticipant = editingParticipantId
    ? participants.find((p) => p.id === editingParticipantId)
    : null;

  const deletingParticipant = deletingParticipantId
    ? participants.find((p) => p.id === deletingParticipantId)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = participants.findIndex((p) => p.id === active.id);
      const newIndex = participants.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderParticipants(oldIndex, newIndex);
      }
    }
  }

  function handleEdit(id: string) {
    setEditingParticipantId(id);
  }

  function handleDelete(id: string) {
    setDeletingParticipantId(id);
  }

  function handleConfirmDelete() {
    if (deletingParticipantId) {
      removeParticipant(deletingParticipantId);
      setDeletingParticipantId(null);
    }
  }

  function handleCancelDelete() {
    setDeletingParticipantId(null);
  }

  function handleAddParticipant(participant: Omit<Participant, "id">) {
    addParticipant(participant);
    setIsAddingParticipant(false);
  }

  function handleUpdateParticipant(data: Omit<Participant, "id">) {
    if (editingParticipantId) {
      updateParticipant(editingParticipantId, data);
      setEditingParticipantId(null);
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
    );
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
    );
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
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Participants</h2>
        <button
          onClick={() => setIsAddingParticipant(true)}
          className="btn btn-primary gap-2"
        >
          <Icon icon="solar:add-circle-linear" className="w-5 h-5" />
          Add Participant
        </button>
      </div>

      <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <Icon icon="solar:info-circle-linear" className="w-5 h-5 text-info" />
          <p>
            Configure AI participants to join your round table conversation.
            Each participant can have a specific role, personality, and
            expertise.
          </p>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-10 bg-base-200 rounded-lg">
          <Icon
            icon="solar:users-group-rounded-broken"
            className="w-16 h-16 mx-auto mb-4 opacity-50"
          />
          <h3 className="text-lg font-medium mb-2">No Participants Yet</h3>
          <p className="text-sm max-w-md mx-auto mb-4">
            Add your first participant to start creating your round table
            conversation.
          </p>
          <button
            onClick={() => setIsAddingParticipant(true)}
            className="btn btn-primary btn-sm"
          >
            Add Participant
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <div className="mb-4 bg-base-100 p-3 rounded-lg border border-base-300 flex items-center gap-2">
            <Icon
              icon="solar:sort-by-time-linear"
              className="w-5 h-5 opacity-70"
            />
            <p className="text-sm">
              Drag to reorder participants. This order will be used in round
              table conversations.
            </p>
          </div>

          <SortableContext
            items={participants.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {participants.map((participant) => (
                <SortableParticipant
                  key={participant.id}
                  id={participant.id}
                  participant={participant}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
