import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { readNoteFileWithPromise } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/notes';

const NoteForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const note = await response.json();
      setTitle(note.title);
      setContent(note.content);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const noteData = { title: title.trim(), content: content.trim() };
    const url = isEditing ? `${API_URL}/${id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await readNoteFileWithPromise(file);
      const parsedData = JSON.parse(fileContent);

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        setTitle(parsedData[0].title || '');
        setContent(parsedData[0].content || '');
      } else if (parsedData.title && parsedData.content) {
        setTitle(parsedData.title);
        setContent(parsedData.content);
      } else {
        throw new Error('Invalid JSON structure. Expected title and content fields.');
      }
      setError(null);
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="form-card-container">
      <div className="form-header">
        <Link to="/" className="back-link">
          ← Back to Notes
        </Link>
        <h2>{isEditing ? '✏️ Edit Note' : '✨ Create New Note'}</h2>
        <p className="form-subtitle">
          {isEditing 
            ? 'Update your note content below.' 
            : 'Capture your thoughts or import from a JSON backup.'}
        </p>
      </div>

      {error && (
        <div className="error-alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="note-form-element">
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="title">Note Title</label>
            <span className="char-count">{title.length}/100</span>
          </div>
          <input 
            type="text" 
            id="title" 
            placeholder="e.g. Project Architecture Plan"
            value={title} 
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)} 
            required 
            autoFocus
          />
        </div>

        <div className="form-group">
          <div className="label-row">
            <label htmlFor="content">Content</label>
            <span className="char-count">{content.length} chars</span>
          </div>
          <textarea 
            id="content" 
            placeholder="Write your note markdown or thoughts here... (Tip: Press Ctrl+Enter to save)"
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
        </div>

        <div className="form-actions">
          <div className="import-wrapper">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json,.txt" 
              onChange={handleImportJson} 
              style={{ display: 'none' }} 
              id="file-import-input"
            />
            <button 
              type="button" 
              className="btn-text"
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON note data using Promise-wrapped FileReader"
            >
              📄 Autofill from JSON
            </button>
          </div>

          <div className="submit-buttons">
            <Link to="/" className="btn-secondary">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Saving...' 
                : isEditing ? '💾 Update Note' : '🚀 Save Note'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
