import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import NoteItem from './NoteItem';
import { 
  createDebouncedSearch, 
  scheduleToastNotification, 
  createStatsTracker 
} from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/notes';

const sessionTracker = createStatsTracker();

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });

  const debouncedHandler = useRef(
    createDebouncedSearch((query) => {
      setDebouncedSearch(query);
    }, 300)
  ).current;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedHandler(value);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      
      const statusMsg = sessionTracker.trackAction('Deleted Note');
      scheduleToastNotification(`Note removed successfully! • ${statusMsg}`, setToast);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSelectNote = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotes.map(n => n._id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected notes?`)) return;

    setIsDeletingBulk(true);
    try {
      const response = await fetch(`${API_URL}/batch-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotes(prev => prev.filter(note => !selectedIds.includes(note._id)));
      const count = selectedIds.length;
      setSelectedIds([]);
      
      const statusMsg = sessionTracker.trackAction(`Bulk Deleted ${count} Notes`);
      scheduleToastNotification(`Successfully deleted ${count} notes! • ${statusMsg}`, setToast);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const filteredNotes = useMemo(() => {
    return filterNotesList(notes, debouncedSearch);
  }, [notes, debouncedSearch]);

  const handleExport = () => {
    const exportData = selectedIds.length > 0
      ? notes.filter(n => selectedIds.includes(n._id))
      : notes;

    const blob = createNoteExportBlob(exportData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    scheduleToastNotification(
      selectedIds.length > 0 
        ? `Exported ${selectedIds.length} selected notes!`
        : 'Notes exported as JSON backup!',
      setToast
    );
  };

  return (
    <div className="notes-container">
      {toast.visible && (
        <div className="toast-notification" role="status">
          <span className="toast-icon">✨</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="control-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search notes"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn" 
              onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="action-buttons">
          <button onClick={handleExport} className="btn-secondary" title="Export notes as JSON">
            📥 {selectedIds.length > 0 ? `Export (${selectedIds.length})` : 'Export Backup'}
          </button>
          <Link to="/new" className="btn-primary">
            ➕ Create Note
          </Link>
        </div>
      </div>

      <div className="status-strip">
        <div className="status-left">
          <span className="count-pill">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
          </span>
          {debouncedSearch && (
            <span className="filter-tag">
              Filter: "{debouncedSearch}"
            </span>
          )}
        </div>

        {filteredNotes.length > 0 && (
          <button onClick={toggleSelectAll} className="btn-select-all">
            {selectedIds.length === filteredNotes.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-action-bar">
          <div className="bulk-info">
            <span className="bulk-badge">{selectedIds.length} selected</span>
          </div>
          <div className="bulk-buttons">
            <button 
              onClick={() => setSelectedIds([])} 
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleBatchDelete} 
              disabled={isDeletingBulk}
              className="btn-danger-action"
            >
              {isDeletingBulk ? 'Deleting...' : `🗑️ Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>{searchTerm ? 'No matching notes found' : 'No notes yet!'}</h3>
          <p>
            {searchTerm 
              ? 'Try refining your search keyword.' 
              : 'Capture your thoughts, ideas, and meeting notes in one place.'}
          </p>
          {!searchTerm && (
            <Link to="/new" className="btn-primary btn-large">
              Create Your First Note
            </Link>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => (
            <NoteItem 
              key={note._id} 
              note={note} 
              onDelete={handleDelete}
              isSelected={selectedIds.includes(note._id)}
              onToggleSelect={toggleSelectNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function filterNotesList(notesList, query) {
  if (!query || !query.trim()) return notesList;
  const term = query.toLowerCase();
  return notesList.filter(
    note => note.title.toLowerCase().includes(term) || note.content.toLowerCase().includes(term)
  );
}

function createNoteExportBlob(notesData) {
  return new Blob([JSON.stringify(notesData, null, 2)], { type: 'application/json' });
}

export default NotesList;
