import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';

function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Modern Glassmorphism Navigation Bar */}
        <header className="navbar">
          <div className="nav-container">
            <NavLink to="/" className="brand-logo">
              <span className="brand-icon">⚡</span>
              <span className="brand-title">Noter<span className="accent">.io</span></span>
            </NavLink>

            <nav className="nav-links">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                All Notes
              </NavLink>
              <NavLink 
                to="/new" 
                className={({ isActive }) => `nav-item btn-nav-cta ${isActive ? 'active' : ''}`}
              >
                + New Note
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<NotesList />} />
            <Route path="/new" element={<NoteForm />} />
            <Route path="/edit/:id" element={<NoteForm />} />
          </Routes>
        </main>

        {/* Compact Footer */}
        <footer className="footer">
          <p>
            Full-Stack React & Express Notes App • Demonstrating Closures, Event Loop, Hoisting, Promises vs Callbacks
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
