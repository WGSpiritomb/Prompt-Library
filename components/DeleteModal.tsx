import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
            Delete Mix
          </h2>
          <button onClick={onClose} className="btn-icon" type="button">
            <X size={24} />
          </button>
        </div>

        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete this mix? This action cannot be undone.
        </p>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};