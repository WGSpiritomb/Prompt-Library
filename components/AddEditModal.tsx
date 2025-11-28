import React, { useEffect, useState } from 'react';
import { Mix, MixFormData } from '../types';
import { X } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MixFormData) => void;
  editingMix?: Mix | null;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingMix 
}) => {
  const [formData, setFormData] = useState<MixFormData>({
    url: '',
    title: '',
    prompt: ''
  });

  useEffect(() => {
    if (editingMix) {
      setFormData({
        url: editingMix.url,
        title: editingMix.title,
        prompt: editingMix.prompt
      });
    } else {
      setFormData({ url: '', title: '', prompt: '' });
    }
  }, [editingMix, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingMix ? 'Edit Mix' : 'Add New Mix'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Mix Name</label>
            <input
              id="title"
              type="text"
              required
              className="form-input"
              placeholder="e.g., Cyberpunk Cityscape"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="url">Image URL</label>
            <input
              id="url"
              type="url"
              required
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              className="form-textarea"
              placeholder="Enter your prompt details here..."
              value={formData.prompt}
              onChange={e => setFormData({ ...formData, prompt: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMix ? 'Update Mix' : 'Add Mix'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};