import { Link } from 'react-router-dom';

const NoteItem = ({ note, onDelete }) => {
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <p>{note.content}</p>
      <div className="note-actions">
        <Link to={`/edit/${note._id}`}>
          <button className="primary">Edit</button>
        </Link>
        <button className="danger" onClick={() => onDelete(note._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteItem;
