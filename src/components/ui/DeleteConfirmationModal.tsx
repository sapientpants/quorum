interface DeleteConfirmationModalProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmationModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: DeleteConfirmationModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button 
            className="btn btn-ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button 
            className="btn btn-error"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" data-testid="modal-backdrop" onClick={onCancel}></div>
    </div>
  )
}

export default DeleteConfirmationModal
