// Client-side routing: Link component for declarative path transitions
import { Link } from 'react-router-dom';
import { processNoteMetadata } from '../utils/helpers';

const NoteItem = ({ note, onDelete, isSelected, onToggleSelect }) => {
  const { formattedDate, readingTime } = processNoteMetadata(note);

  return (
    <div className={`note-card ${isSelected ? 'selected' : ''}`}>
      <div className="note-card-header">
        <div className="note-select-wrapper">
          <input
            type="checkbox"
            className="note-checkbox"
            checked={Boolean(isSelected)}
            onChange={() => onToggleSelect(note._id)}
            aria-label={`Select ${note.title}`}
          />
          <span className="note-date">{formattedDate}</span>
        </div>
        <span className="note-badge">{readingTime}</span>
      </div>
      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content}</p>
      <div className="note-actions">
        {/* Client-side routing: Dynamic link navigating to note edit route */}
        <Link to={`/edit/${note._id}`} className="btn-edit" aria-label="Edit Note">
          <span className="icon">✏️</span> Edit
        </Link>
        <button 
          className="btn-delete" 
          onClick={() => onDelete(note._id)} 
          aria-label="Delete Note"
        >
          <span className="icon">🗑️</span> Delete
        </button>
      </div>
    </div>
  );
};

export default NoteItem;
