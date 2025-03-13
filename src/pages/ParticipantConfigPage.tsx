import { useState } from 'react'
import { Icon } from '@iconify/react'
import { ParticipantList } from '../components/ParticipantList'
import { ParticipantForm } from '../components/ParticipantForm'
import { RoundTable } from '../components/RoundTable'
import { ParticipantAdvancedSettings } from '../components/ParticipantAdvancedSettings'
import { useParticipantsStore } from '../store/participants'

// Define a type for the advanced settings
interface AdvancedSettings {
  temperature: number
  maxTokens: number
  topP?: number
  presencePenalty?: number
  frequencyPenalty?: number
}

export function ParticipantConfigPage() {
  const { 
    participants,
    activeParticipantId,
    setActiveParticipant,
    addParticipant,
    updateParticipant
  } = useParticipantsStore()
  
  const [view, setView] = useState<'list' | 'roundTable'>('list')
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  
  const editingParticipant = editingParticipantId 
    ? participants.find(p => p.id === editingParticipantId) 
    : null
  
  function handleAddParticipant(participant: Omit<typeof participants[0], 'id'>) {
    addParticipant(participant)
    setIsAddingParticipant(false)
  }
  
  function handleUpdateParticipant(data: Omit<typeof participants[0], 'id'>) {
    if (editingParticipantId) {
      updateParticipant(editingParticipantId, data)
      setEditingParticipantId(null)
    }
  }
  
  function handleParticipantClick(id: string) {
    setActiveParticipant(id)
  }
  
  function handleAdvancedSettingsSave(settings: AdvancedSettings) {
    if (editingParticipantId) {
      updateParticipant(editingParticipantId, {
        settings: {
          ...settings
        }
      })
    }
  }
  
  if (isAddingParticipant) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New Participant</h2>
        <ParticipantForm
          onSubmit={handleAddParticipant}
          onCancel={() => setIsAddingParticipant(false)}
        />
      </div>
    )
  }
  
  if (editingParticipant) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Edit Participant</h2>
        <ParticipantForm
          initialData={editingParticipant}
          onSubmit={handleUpdateParticipant}
          onCancel={() => setEditingParticipantId(null)}
        />
        
        <div className="mt-4 text-center">
          <button 
            className="btn btn-ghost btn-sm gap-1"
            onClick={() => setShowAdvancedSettings(true)}
          >
            <Icon icon="solar:settings-minimalistic-linear" className="w-4 h-4" />
            Advanced Settings
          </button>
        </div>
        
        <ParticipantAdvancedSettings
          isOpen={showAdvancedSettings}
          onClose={() => setShowAdvancedSettings(false)}
          initialSettings={editingParticipant.type === 'llm' ? editingParticipant.settings : {}}
          onSave={handleAdvancedSettingsSave}
        />
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Participant Configuration</h1>
        
        <div className="join">
          <button 
            className={`join-item btn ${view === 'list' ? 'btn-active' : ''}`}
            onClick={() => setView('list')}
          >
            <Icon icon="solar:list-linear" className="w-5 h-5" />
            List
          </button>
          <button 
            className={`join-item btn ${view === 'roundTable' ? 'btn-active' : ''}`}
            onClick={() => setView('roundTable')}
          >
            <Icon icon="solar:slider-horizontal-minimalistic-linear" className="w-5 h-5" />
            Round Table
          </button>
        </div>
      </div>
      
      {view === 'list' ? (
        <div className="mb-8">
          <ParticipantList />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-base-100 p-6 rounded-lg shadow-sm border border-base-300">
            <RoundTable 
              participants={participants}
              activeParticipantId={activeParticipantId}
              onParticipantClick={handleParticipantClick}
            />
          </div>
          
          <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-300">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            
            {!activeParticipantId ? (
              <div className="text-center py-8">
                <Icon icon="solar:hand-pointing-linear" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a participant from the round table to view details</p>
              </div>
            ) : (
              (() => {
                const participant = participants.find(p => p.id === activeParticipantId)
                
                if (!participant) return null
                
                return (
                  <div>
                    <div className="mb-4 p-4 bg-base-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon 
                          icon={participant.type === 'human' ? "solar:user-rounded-linear" : "solar:robot-linear"} 
                          className="w-5 h-5" 
                        />
                        <h3 className="font-medium">{participant.name}</h3>
                      </div>
                      
                      {participant.type === 'llm' && (
                        <>
                          <div className="text-sm mb-3">
                            <span className="badge badge-sm">{participant.provider}</span>
                            <span className="ml-2 opacity-70">{participant.model}</span>
                          </div>
                          
                          {participant.roleDescription && (
                            <div className="mb-3">
                              <div className="text-xs font-medium uppercase opacity-70">Role</div>
                              <p className="text-sm">{participant.roleDescription}</p>
                            </div>
                          )}
                          
                          <div>
                            <div className="text-xs font-medium uppercase opacity-70">System Prompt</div>
                            <p className="text-sm line-clamp-3">{participant.systemPrompt}</p>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <button 
                              className="btn btn-sm btn-ghost"
                              onClick={() => setEditingParticipantId(participant.id)}
                            >
                              <Icon icon="solar:pen-linear" className="w-4 h-4" />
                              Edit
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="p-4 bg-base-200 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Active Participant</h3>
                      <p className="text-xs opacity-70">
                        This participant is currently selected and will be highlighted in the round table view.
                      </p>
                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-ghost w-full"
                          onClick={() => setActiveParticipant(null)}
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}
    </div>
  )
} 