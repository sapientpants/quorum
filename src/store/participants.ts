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
    (set): ParticipantsState => ({
      participants: [
        createParticipant({
          id: 'user',
          name: 'You',
          type: 'human'
        })
      ],
      activeParticipantId: null,

      addParticipant: (participant: Omit<Participant, 'id'>) => 
        set((state: ParticipantsState) => ({
          participants: [...state.participants, createParticipant({
            ...participant,
            id: crypto.randomUUID()
          })]
        })),

      removeParticipant: (id: string) =>
        set((state: ParticipantsState) => ({
          participants: state.participants.filter((p: Participant) => p.id !== id),
          activeParticipantId: state.activeParticipantId === id ? null : state.activeParticipantId
        })),

      updateParticipant: (id: string, updates: Partial<Omit<Participant, 'id' | 'type'>>) =>
        set((state: ParticipantsState) => ({
          participants: state.participants.map((p: Participant) =>
            p.id === id ? { ...p, ...updates } : p
          )
        })),

      setActiveParticipant: (id: string | null) =>
        set({ activeParticipantId: id }),

      reorderParticipants: (fromIndex: number, toIndex: number) =>
        set((state: ParticipantsState) => {
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