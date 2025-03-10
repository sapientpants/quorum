import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Mock template data - would be replaced with actual data from localStorage or API
const mockTemplates = [
  {
    id: '1',
    name: 'Expert Panel',
    description: 'A panel of experts from different fields',
    participants: ['OpenAI', 'Anthropic', 'Grok'],
    createdAt: new Date('2023-05-15').toISOString(),
  },
  {
    id: '2',
    name: 'Medical Consultation',
    description: 'Medical experts for health-related questions',
    participants: ['OpenAI', 'Anthropic'],
    createdAt: new Date('2023-06-22').toISOString(),
  },
  {
    id: '3',
    name: 'Code Review',
    description: 'Technical experts for code review and suggestions',
    participants: ['OpenAI', 'Anthropic'],
    createdAt: new Date('2023-07-10').toISOString(),
  },
  {
    id: '4',
    name: 'Content Brainstorming',
    description: 'Creative assistants for content ideas',
    participants: ['OpenAI', 'Anthropic', 'Grok'],
    createdAt: new Date('2023-08-05').toISOString(),
  },
]

export function Templates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState(mockTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  
  function handleCreateNew() {
    // Navigate to chat with new template flag
    navigate('/chat?new=true')
  }
  
  function handleUseTemplate() {
    if (selectedTemplate) {
      // Navigate to chat with selected template
      navigate(`/chat?template=${selectedTemplate}`)
    }
  }
  
  function handleDeleteClick(templateId: string) {
    setTemplateToDelete(templateId)
    setShowDeleteModal(true)
  }
  
  function handleConfirmDelete() {
    if (templateToDelete) {
      // Filter out the template to delete
      const updatedTemplates = templates.filter(template => template.id !== templateToDelete)
      setTemplates(updatedTemplates)
      
      // Close modal
      setShowDeleteModal(false)
      setTemplateToDelete(null)
      
      // If the deleted template was selected, clear selection
      if (selectedTemplate === templateToDelete) {
        setSelectedTemplate(null)
      }
    }
  }
  
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Saved Templates</h2>
        <button 
          className="btn btn-primary"
          onClick={handleCreateNew}
        >
          Create New Template
        </button>
      </div>
      
      {templates.length === 0 ? (
        <div className="bg-base-200 p-8 rounded-lg text-center">
          <h3 className="text-xl mb-4">No Templates Yet</h3>
          <p className="mb-6">Save your round table configurations as templates to reuse them later.</p>
          <button 
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div 
              key={template.id}
              className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="card-title">{template.name}</h3>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a onClick={() => handleDeleteClick(template.id)}>Delete</a></li>
                      <li><a>Rename</a></li>
                      <li><a>Duplicate</a></li>
                    </ul>
                  </div>
                </div>
                <p>{template.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.participants.map(participant => (
                    <span key={participant} className="badge badge-outline">{participant}</span>
                  ))}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      handleUseTemplate()
                    }}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedTemplate && (
        <div className="mt-6 flex justify-end">
          <button 
            className="btn btn-primary"
            onClick={handleUseTemplate}
          >
            Use Selected Template
          </button>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteModal(false)
                  setTemplateToDelete(null)
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 