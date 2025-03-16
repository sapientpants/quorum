import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Template, createTemplate } from '../types/template'
import type { Participant } from '../types/participant'

interface TemplatesState {
  templates: Template[]
  
  // CRUD operations
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTemplate: (id: string, updates: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>) => void
  removeTemplate: (id: string) => void
  
  // Helper functions
  getTemplateById: (id: string) => Template | undefined
  getTemplateWithParticipants: (id: string, participants: Participant[]) => {
    template: Template | undefined
    participants: Participant[]
  }
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set, get): TemplatesState => ({
      templates: [],
      
      addTemplate: (templateData) => {
        const template = createTemplate({
          name: templateData.name,
          description: templateData.description,
          participantIds: templateData.participantIds || [],
          defaultConversationStarter: templateData.defaultConversationStarter
        })
        
        set((state) => ({
          templates: [...state.templates, template]
        }))
        
        return template.id
      },
      
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) => 
            template.id === id 
              ? { 
                  ...template, 
                  ...updates, 
                  updatedAt: Date.now() 
                } 
              : template
          )
        }))
      },
      
      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id)
        }))
      },
      
      getTemplateById: (id) => {
        return get().templates.find((template) => template.id === id)
      },
      
      getTemplateWithParticipants: (id, allParticipants) => {
        const template = get().templates.find((t) => t.id === id)
        
        if (!template) {
          return { template: undefined, participants: [] }
        }
        
        // Make sure allParticipants is an array before using find
        const validParticipants = Array.isArray(allParticipants) ? allParticipants : []
        
        const participants = template.participantIds
          .map((id) => validParticipants.find((p) => p.id === id))
          .filter((p): p is Participant => p !== undefined)
        
        return { template, participants }
      }
    }),
    {
      name: 'templates-storage',
      version: 1,
      // Initialize with empty templates array if storage is empty
      partialize: (state) => ({ templates: state.templates })
    }
  )
)
