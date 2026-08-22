import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <h1>Notes App</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/new">Add Note</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<NotesList />} />
          <Route path="/new" element={<NoteForm />} />
          <Route path="/edit/:id" element={<NoteForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
