import { useState, useEffect } from 'react'
import { RoundTable } from '../components/RoundTable'
import { usePreferencesStore } from '../store/preferencesStore'
import { useParticipantsStore } from '../store/participants'
import { TopBar } from '../components/TopBar'

export function RoundTablePage() {
  const { setWizardCompleted } = usePreferencesStore()
  const { participants } = useParticipantsStore()
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null)
  
  // Ensure the wizard is marked as completed when this page is accessed
  useEffect(() => {
    setWizardCompleted(true)
  }, [setWizardCompleted])
  
  // Set the first participant as active if none is selected
  useEffect(() => {
    if (participants.length > 0 && !activeParticipantId) {
      setActiveParticipantId(participants[0].id)
    }
  }, [participants, activeParticipantId])
  
  function handleParticipantClick(id: string) {
    setActiveParticipantId(id)
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Round Table</h1>
          
          {participants.length > 0 ? (
            <RoundTable 
              participants={participants}
              activeParticipantId={activeParticipantId}
              onParticipantClick={handleParticipantClick}
            />
          ) : (
            <div className="text-center py-12 bg-base-200 rounded-lg">
              <p className="text-lg mb-4">No participants configured yet.</p>
              <p>Go to the Settings page to add participants.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default RoundTablePage
