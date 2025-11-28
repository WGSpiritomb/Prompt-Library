import React, { useState } from 'react';
import { Mix, ViewMode } from '../types';
import { Edit2, Trash2, Copy, Check } from 'lucide-react';
import { DEFAULT_IMAGE } from '../constants';

interface MixCardProps {
  mix: Mix;
  viewMode: ViewMode;
  onEdit: (mix: Mix) => void;
  onDelete: (id: string) => void;
}

export const MixCard: React.FC<MixCardProps> = ({ mix, viewMode, onEdit, onDelete }) => {
  const [imgSrc, setImgSrc] = React.useState(mix.url);
  const [copied, setCopied] = useState(false);

  const handleError = () => {
    setImgSrc(DEFAULT_IMAGE);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mix.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="card">
      <div className="card-image-container">
        <img 
          src={imgSrc} 
          alt={mix.title} 
          className="card-image"
          onError={handleError}
          loading="lazy"
        />
      </div>
      
      <div className="card-content">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="card-title">{mix.title}</h3>
          <p className="card-description" title={mix.prompt}>{mix.prompt}</p>
        </div>
        
        <div className="card-actions">
           <button 
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary btn-icon"
            aria-label="Copy prompt"
            title="Copy Prompt"
          >
            {copied ? <Check size={16} color="var(--primary)" /> : <Copy size={16} />}
            {viewMode === 'list' && <span>{copied ? 'Copied' : 'Copy'}</span>}
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(mix);
            }} 
            className="btn btn-secondary btn-icon"
            aria-label="Edit mix"
            title="Edit Mix"
          >
            <Edit2 size={16} />
            {viewMode === 'list' && <span>Edit</span>}
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(mix.id);
            }} 
            className="btn btn-danger btn-icon"
            aria-label="Delete mix"
            title="Delete Mix"
          >
            <Trash2 size={16} />
            {viewMode === 'list' && <span>Delete</span>}
          </button>
        </div>
      </div>
    </article>
  );
};