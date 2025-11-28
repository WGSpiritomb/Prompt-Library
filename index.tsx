import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Edit2, Trash2, Copy, Check, X, AlertTriangle, 
  Layout, List, Plus, Image as ImageIcon, Sun, Moon, Search,
  Download, Upload, Grid3x3, ExternalLink, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, RotateCcw, ChevronDown
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================
export interface Mix {
  id: string;
  url: string;
  title: string;
  prompt: string;
  negativePrompt?: string; 
  createdAt: number;
}

export type ViewMode = 'details' | 'grid' | 'list';

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

export interface MixFormData {
  url: string;
  title: string;
  prompt: string;
  negativePrompt: string;
}

// ==========================================
// CONSTANTS
// ==========================================
export const STORAGE_KEY = 'prompt_mix_library_v1';
export const DEFAULT_IMAGE = 'https://picsum.photos/400/300'; // Fallback

// ==========================================
// SERVICES
// ==========================================
export const getMixes = (): Mix[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load mixes', e);
    return [];
  }
};

export const saveMixes = (mixes: Mix[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
  } catch (e) {
    console.error('Failed to save mixes', e);
  }
};

const generateId = (): string => {
  // Use crypto.randomUUID if available (modern browsers, https)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto is not available
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createMix = (data: MixFormData): Mix => {
  return {
    id: generateId(),
    createdAt: Date.now(),
    ...data,
  };
};

// ==========================================
// COMPONENT: CustomSelect
// ==========================================
interface CustomSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options: { label: string; value: SortOption }[];
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} style={{ opacity: 0.6 }} />
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((option) => (
            <div 
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENT: DeleteModal
// ==========================================
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
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

// ==========================================
// COMPONENT: AddEditModal
// ==========================================
interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MixFormData) => void;
  editingMix?: Mix | null;
}

const AddEditModal: React.FC<AddEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingMix 
}) => {
  const [formData, setFormData] = useState<MixFormData>({
    url: '',
    title: '',
    prompt: '',
    negativePrompt: ''
  });

  useEffect(() => {
    if (editingMix) {
      setFormData({
        url: editingMix.url,
        title: editingMix.title,
        prompt: editingMix.prompt,
        negativePrompt: editingMix.negativePrompt || ''
      });
    } else {
      setFormData({ url: '', title: '', prompt: '', negativePrompt: '' });
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
              placeholder="Enter your positive prompt here..."
              value={formData.prompt}
              onChange={e => setFormData({ ...formData, prompt: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="negativePrompt" style={{ color: 'var(--text-secondary)' }}>Negative Prompt</label>
            <textarea
              id="negativePrompt"
              className="form-textarea negative"
              placeholder="Enter negative prompt (what to avoid)..."
              value={formData.negativePrompt}
              onChange={e => setFormData({ ...formData, negativePrompt: e.target.value })}
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

// ==========================================
// COMPONENT: LazyImage
// ==========================================
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const LazyImage: React.FC<LazyImageProps> = ({ className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && imgRef.current) {
          // When intersecting, we ensure the image starts loading if it wasn't already
          // The 'loading="lazy"' attribute on the img tag handles the network request timing,
          // but we use this observer to trigger the fade-in animation class.
          if (imgRef.current.complete) {
             setIsLoaded(true);
          }
        }
      });
    }, { threshold: 0.1 });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (props.onLoad) props.onLoad(e);
  };

  return (
    <img
      ref={imgRef}
      className={`${className} ${isLoaded ? 'loaded' : ''}`}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
};

// ==========================================
// COMPONENT: Lightbox
// ==========================================
interface LightboxProps {
  isOpen: boolean;
  images: Mix[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ 
  isOpen, 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom on image change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || currentIndex < 0 || currentIndex >= images.length) return null;

  const currentMix = images[currentIndex];

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.005;
    setScale(prev => {
        const newScale = Math.min(Math.max(1, prev + delta), 5);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose} onWheel={handleWheel}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close Gallery">
        <X size={24} />
      </button>

      <div className="lightbox-controls-overlay" onClick={e => e.stopPropagation()}>
        <button className="btn-icon" style={{color: 'white', width: '36px', height: '36px'}} onClick={handleZoomOut}>
            <ZoomOut size={20} />
        </button>
        <button className="btn-icon" style={{color: 'white', width: '36px', height: '36px'}} onClick={handleResetZoom}>
            <RotateCcw size={18} />
        </button>
        <button className="btn-icon" style={{color: 'white', width: '36px', height: '36px'}} onClick={handleZoomIn}>
            <ZoomIn size={20} />
        </button>
      </div>

      <button 
        className="lightbox-nav lightbox-prev" 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous Image"
      >
        <ChevronLeft size={32} />
      </button>

      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img 
          src={currentMix.url} 
          alt={currentMix.title} 
          className={`lightbox-image ${isDragging ? 'dragging' : ''} ${scale > 1 ? 'zoomed' : ''}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          draggable={false}
        />
        <div className="lightbox-caption">
          {currentMix.title} {scale > 1 && `(${Math.round(scale * 100)}%)`}
        </div>
      </div>

      <button 
        className="lightbox-nav lightbox-next" 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next Image"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

// ==========================================
// COMPONENT: MixCard
// ==========================================
interface MixCardProps {
  mix: Mix;
  viewMode: ViewMode;
  onEdit: (mix: Mix) => void;
  onDelete: (id: string) => void;
  onImageClick: () => void;
}

const MixCard: React.FC<MixCardProps> = ({ mix, viewMode, onEdit, onDelete, onImageClick }) => {
  const [imgSrc, setImgSrc] = useState(mix.url);
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

  const openLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(mix.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="card">
      <div className="card-image-container" onClick={onImageClick}>
        <LazyImage
          src={imgSrc} 
          alt={mix.title} 
          className="card-image"
          onError={handleError}
        />
      </div>
      
      <div className="card-content">
        <div style={{ flex: 1, minWidth: 0 }} className="prompt-container">
          <h3 className="card-title">
            {mix.title}
          </h3>
          
          {/* Positive Prompt - Hide in Grid (minimal) view */}
          <p className="card-description" title={mix.prompt}>{mix.prompt}</p>
          
          {/* Negative Prompt - Show only in Details view */}
          {mix.negativePrompt && (
            <div className="negative-prompt-display" title={mix.negativePrompt}>
              <span className="negative-label">Negative:</span>
              {mix.negativePrompt}
            </div>
          )}
        </div>
        
        <div className="card-actions">
           {(viewMode === 'list' || viewMode === 'details') && (
              <button 
                type="button"
                onClick={openLink}
                className="btn btn-secondary btn-icon"
                aria-label="Open link"
                title="Open Image Link"
              >
                <ExternalLink size={16} />
              </button>
           )}
           <button 
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary btn-icon"
            aria-label="Copy prompt"
            title="Copy Prompt"
          >
            {copied ? <Check size={16} color={viewMode === 'grid' ? 'var(--text-secondary)' : 'var(--primary)'} /> : <Copy size={16} />}
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
          </button>
        </div>
      </div>
    </article>
  );
};

// ==========================================
// COMPONENT: App
// ==========================================
const App: React.FC = () => {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMix, setEditingMix] = useState<Mix | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Library Name state
  const [libraryName, setLibraryName] = useState('Prompt Library');

  // Search and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Delete state
  const [mixToDelete, setMixToDelete] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // File Import Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // Initialize Library Name
  useEffect(() => {
    const savedName = localStorage.getItem('prompt_mix_library_name');
    if (savedName) setLibraryName(savedName);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setLibraryName(newName);
    localStorage.setItem('prompt_mix_library_name', newName);
  };

  useEffect(() => {
    const loadedMixes = getMixes();
    if (loadedMixes.length === 0) {
        // Seed some data if empty
        const seedData: Mix[] = [
            {
                id: '1',
                url: 'https://picsum.photos/id/1018/800/600',
                title: 'Mountain Cinematic',
                prompt: 'A cinematic wide shot of a mountain range at sunset, golden hour, volumetric lighting, photorealistic, 8k',
                negativePrompt: 'blur, haze, distortion, low quality, pixelated, text, watermark',
                createdAt: Date.now()
            },
            {
                id: '2',
                url: 'https://picsum.photos/id/1015/800/600',
                title: 'River Valley Fantasy',
                prompt: 'Fantasy landscape, river flowing through a lush green valley, floating islands in the sky, dreamlike atmosphere, vivid colors',
                negativePrompt: 'darkness, horror, gloomy, industrial, modern buildings',
                createdAt: Date.now() - 10000
            }
        ];
        setMixes(seedData);
        saveMixes(seedData);
    } else {
        setMixes(loadedMixes);
    }
  }, []);

  const handleSaveMix = (data: MixFormData) => {
    let updatedMixes: Mix[];
    
    if (editingMix) {
      updatedMixes = mixes.map(p => 
        p.id === editingMix.id 
          ? { ...p, ...data } 
          : p
      );
    } else {
      updatedMixes = [createMix(data), ...mixes];
    }

    setMixes(updatedMixes);
    saveMixes(updatedMixes);
    setEditingMix(null);
  };

  const handleRequestDelete = (id: string) => {
    setMixToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (mixToDelete) {
      const updatedMixes = mixes.filter(p => p.id !== mixToDelete);
      setMixes(updatedMixes);
      saveMixes(updatedMixes);
      setMixToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditingMix(null);
    setIsModalOpen(true);
  };

  const openEditModal = (mix: Mix) => {
    setEditingMix(mix);
    setIsModalOpen(true);
  };

  // Export Logic
  const handleExport = () => {
    const exportData = {
      title: libraryName,
      version: 1,
      mixes: mixes
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    
    // Format: (number of items)-(LibraryName)-(date).json
    const count = mixes.length;
    // Sanitize library name: replace spaces with dashes, fallback to 'Library' if empty
    const safeLibName = libraryName.trim().replace(/\s+/g, '-') || 'Library';
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${count}-${safeLibName}-${date}.json`;

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import Logic
  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);
        
        let validMixes: Mix[] = [];
        let importedTitle = '';

        // Handle Array format (Legacy)
        if (Array.isArray(importedData)) {
           validMixes = importedData.filter((m: any) => m.id && m.title);
        } 
        // Handle Object format (New)
        else if (importedData.mixes && Array.isArray(importedData.mixes)) {
           validMixes = importedData.mixes.filter((m: any) => m.id && m.title);
           if (importedData.title) importedTitle = importedData.title;
        } else {
           alert("Invalid file format.");
           return;
        }
           
        if (validMixes.length === 0) {
            alert("No valid mixes found in the file.");
            return;
        }

        // Filter out items that are already in our library (by ID) to avoid dupes
        const existingIds = new Set(mixes.map(m => m.id));
        const newUniqueMixes = validMixes.filter((m: Mix) => !existingIds.has(m.id));
        
        const combined = [...newUniqueMixes, ...mixes];
        setMixes(combined);
        saveMixes(combined);

        // Update library title if present in import
        if (importedTitle) {
          setLibraryName(importedTitle);
          localStorage.setItem('prompt_mix_library_name', importedTitle);
        }
        
        alert(`Import Successful! Added ${newUniqueMixes.length} new mixes. (${validMixes.length - newUniqueMixes.length} duplicates skipped)`);

      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(fileObj);
    // Reset the input value so the same file can be selected again if needed
    event.target.value = ''; 
  };

  // Processing for display
  const getProcessedMixes = () => {
    let result = [...mixes];

    // Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(mix => 
        mix.title.toLowerCase().includes(query) || 
        mix.prompt.toLowerCase().includes(query) ||
        (mix.negativePrompt && mix.negativePrompt.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  };

  const displayedMixes = getProcessedMixes();
  
  // Determine layout class based on viewMode
  const getLayoutClass = () => {
    switch(viewMode) {
      case 'details': return 'gallery-details';
      case 'grid': return 'gallery-grid';
      case 'list': return 'gallery-list';
      default: return 'gallery-grid';
    }
  };

  // Lightbox Handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };
  
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % displayedMixes.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + displayedMixes.length) % displayedMixes.length);
    }
  };

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Title (A-Z)', value: 'a-z' },
    { label: 'Title (Z-A)', value: 'z-a' },
  ];

  return (
    <>
      <header className="app-header">
        <div className="library-title-wrapper" title="Click to edit library name">
            <input 
                className="app-title-input"
                value={libraryName}
                onChange={handleNameChange}
                placeholder="Library Name"
            />
            <Edit2 className="edit-hint-icon" size={16} />
        </div>
        
        <div className="controls">
          <div className="search-wrapper">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              className="search-input"
              placeholder="Search mixes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <CustomSelect 
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={sortOptions}
          />

          <div className="btn-group">
            <button 
              className="btn-group-item"
              onClick={handleExport}
              aria-label="Export JSON"
              title="Export Library to JSON"
            >
              <Upload size={20} />
            </button>
            <button 
              className="btn-group-item"
              onClick={triggerImport}
              aria-label="Import JSON"
              title="Import Library from JSON"
            >
              <Download size={20} />
            </button>
            {/* Hidden Input for File Upload */}
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden-input" 
              onChange={handleImport} 
            />
          </div>

          <button 
            className="btn btn-secondary btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="btn-group">
            <button 
              className={`btn-group-item ${viewMode === 'details' ? 'active' : ''}`}
              onClick={() => setViewMode('details')}
              aria-label="Details view"
              title="Details View"
            >
              <Layout size={20} />
            </button>
            <button 
              className={`btn-group-item ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid View (Images)"
            >
              <Grid3x3 size={20} />
            </button>
            <button 
              className={`btn-group-item ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List View"
            >
              <List size={20} />
            </button>
          </div>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={20} />
            <span>Add Mix</span>
          </button>
        </div>
      </header>

      <main>
        {displayedMixes.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h2>{searchQuery ? 'No matches found' : 'No mixes yet'}</h2>
            <p>{searchQuery ? 'Try adjusting your search terms.' : 'Click "Add Mix" or Import a JSON file to start.'}</p>
          </div>
        ) : (
          <div className={getLayoutClass()}>
            {displayedMixes.map((mix, index) => (
              <MixCard
                key={mix.id}
                mix={mix}
                viewMode={viewMode}
                onEdit={openEditModal}
                onDelete={handleRequestDelete}
                onImageClick={() => openLightbox(index)}
              />
            ))}
          </div>
        )}
      </main>

      <Lightbox 
        isOpen={lightboxIndex !== null}
        images={displayedMixes}
        currentIndex={lightboxIndex || 0}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />

      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMix}
        editingMix={editingMix}
      />
      
      <DeleteModal 
        isOpen={!!mixToDelete}
        onClose={() => setMixToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

// ==========================================
// ROOT RENDER
// ==========================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);