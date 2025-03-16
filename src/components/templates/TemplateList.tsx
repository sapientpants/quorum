import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTemplatesStore } from '../../store/templatesStore'
import TemplateCard from './TemplateCard'
import TemplateForm from './TemplateForm'
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal'

interface TemplateListProps {
  onUseTemplate: (templateId: string) => void
}

function TemplateList({ onUseTemplate }: TemplateListProps) {
  const { t } = useTranslation()
  const templates = useTemplatesStore((state) => state.templates) || []
  const { removeTemplate } = useTemplatesStore()
  
  // Ensure templates is an array
  const validTemplates = Array.isArray(templates) ? templates : []
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)
  
  const editingTemplate = editingTemplateId 
    ? validTemplates.find(t => t.id === editingTemplateId) 
    : null
  
  const handleCreateTemplate = () => {
    setIsCreateModalOpen(true)
  }
  
  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId)
  }
  
  const handleDeleteTemplate = (templateId: string) => {
    setDeletingTemplateId(templateId)
  }
  
  const confirmDeleteTemplate = () => {
    if (deletingTemplateId) {
      removeTemplate(deletingTemplateId)
      setDeletingTemplateId(null)
    }
  }
  
  const closeEditModal = () => {
    setEditingTemplateId(null)
  }
  
  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('Templates')}</h1>
        <button 
          className="btn btn-primary"
          onClick={handleCreateTemplate}
        >
          {t('Create Template')}
        </button>
      </div>
      
      {validTemplates.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">{t('No Templates Yet')}</h3>
          <p className="text-base-content/70 mb-6">
            {t('Create your first template to save your favorite round table configurations.')}
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleCreateTemplate}
          >
            {t('Create Your First Template')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={onUseTemplate}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}
      
      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">{t('Create New Template')}</h3>
            <TemplateForm
              onCancel={closeCreateModal}
            />
          </div>
          <div className="modal-backdrop" onClick={closeCreateModal}></div>
        </div>
      )}
      
      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">{t('Edit Template')}</h3>
            <TemplateForm
              initialData={editingTemplate}
              onCancel={closeEditModal}
            />
          </div>
          <div className="modal-backdrop" onClick={closeEditModal}></div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deletingTemplateId && (
        <DeleteConfirmationModal
          title={t('Delete Template')}
          message={t('Are you sure you want to delete this template? This action cannot be undone.')}
          confirmLabel={t('Delete')}
          cancelLabel={t('Cancel')}
          onConfirm={confirmDeleteTemplate}
          onCancel={() => setDeletingTemplateId(null)}
        />
      )}
    </div>
  )
}

export default TemplateList 