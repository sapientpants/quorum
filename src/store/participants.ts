import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Participant, createParticipant } from '../types/participant'

interface ParticipantsState {
  participants: Participant[]
  activeParticipantId: string | null
  addParticipant: (participant: Omit<Participant, 'id'>) => void
  removeParticipant: (id: string) => void
  updateParticipant: (id: string, updates: Partial<Omit<Participant, 'id' | 'type'>>) => void
  setActiveParticipant: (id: string | null) => void
  reorderParticipants: (fromIndex: number, toIndex: number) => void
}

export const useParticipantsStore = create<ParticipantsState>()(
  persist(
    (set) => ({
      participants: [
        createParticipant({
          id: 'user',
          name: 'You',
          type: 'human'
        })
      ],
      activeParticipantId: null,

      addParticipant: (participant) => 
        set((state) => ({
          participants: [...state.participants, createParticipant({
            ...participant,
            id: crypto.randomUUID()
          })]
        })),

      removeParticipant: (id) =>
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
          activeParticipantId: state.activeParticipantId === id ? null : state.activeParticipantId
        })),

      updateParticipant: (id, updates) =>
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        })),

      setActiveParticipant: (id) =>
        set({ activeParticipantId: id }),

      reorderParticipants: (fromIndex, toIndex) =>
        set((state) => {
          const newParticipants = [...state.participants]
          const [removed] = newParticipants.splice(fromIndex, 1)
          newParticipants.splice(toIndex, 0, removed)
          return { participants: newParticipants }
        })
    }),
    {
      name: 'participants-storage'
    }
  )
) 