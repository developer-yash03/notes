import { Link } from 'react-router-dom';
import { processNoteMetadata } from '../utils/helpers';

const NoteItem = ({ note, onDelete }) => {
  // Uses hoisted functions inside processNoteMetadata to calculate metadata
  const { formattedDate, readingTime } = processNoteMetadata(note);

  return (
    <div className="note-card">
      <div className="note-card-header">
        <span className="note-date">{formattedDate}</span>
        <span className="note-badge">{readingTime}</span>
      </div>
      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content}</p>
      <div className="note-actions">
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
