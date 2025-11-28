import React, { useState, useEffect } from 'react';
import { Mix, ViewMode, MixFormData, SortOption } from './types';
import { getMixes, saveMixes, createMix } from './services/storageService';
import { MixCard } from './components/PhotoCard';
import { AddEditModal } from './components/AddEditModal';
import { DeleteModal } from './components/DeleteModal';
import { LayoutGrid, List, Plus, Image as ImageIcon, Sun, Moon, Search } from 'lucide-react';

const App: React.FC = () => {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMix, setEditingMix] = useState<Mix | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Search and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Delete state
  const [mixToDelete, setMixToDelete] = useState<string | null>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
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
                createdAt: Date.now()
            },
            {
                id: '2',
                url: 'https://picsum.photos/id/1015/800/600',
                title: 'River Valley Fantasy',
                prompt: 'Fantasy landscape, river flowing through a lush green valley, floating islands in the sky, dreamlike atmosphere, vivid colors',
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

  // Processing for display
  const getProcessedMixes = () => {
    let result = [...mixes];

    // Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(mix => 
        mix.title.toLowerCase().includes(query) || 
        mix.prompt.toLowerCase().includes(query)
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

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Prompt Library</h1>
        
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

          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">Title (A-Z)</option>
            <option value="z-a">Title (Z-A)</option>
          </select>

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
              className={`btn-group-item ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid View"
            >
              <LayoutGrid size={20} />
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
            <p>{searchQuery ? 'Try adjusting your search terms.' : 'Click "Add Mix" to start your library.'}</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'gallery-grid' : 'gallery-list'}>
            {displayedMixes.map(mix => (
              <MixCard
                key={mix.id}
                mix={mix}
                viewMode={viewMode}
                onEdit={openEditModal}
                onDelete={handleRequestDelete}
              />
            ))}
          </div>
        )}
      </main>

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

export default App;