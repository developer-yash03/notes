import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';
import Register from './components/Register';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
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

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <span className="user-pill" title={`${user?.email} (${user?.age} y/o)`}>
                👤 <span className="user-name">{user?.name}</span>
              </span>
              <button onClick={logout} className="btn-logout" title="Log Out">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-nav-group">
              <NavLink 
                to="/login" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                Log In
              </NavLink>
              <NavLink 
                to="/register" 
                className={({ isActive }) => `nav-item btn-register ${isActive ? 'active' : ''}`}
              >
                Register
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navigation />

          {/* Main Content Area */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<NotesList />} />
              <Route path="/new" element={<NoteForm />} />
              <Route path="/edit/:id" element={<NoteForm />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>

          {/* Compact Footer */}
          <footer className="footer">
            <p>
              Full-Stack React & Express Notes App • Demonstrating Authentication, JWT, Password Hashing, Input Sanitization & Validations
            </p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
