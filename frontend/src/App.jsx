// Client-side routing: Importing React Router primitives for declarative navigation
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';
import Register from './components/Register';
import Login from './components/Login';
import NotFound from './components/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Client-side routing: Declarative brand link */}
        <NavLink to="/" className="brand-logo">
          <span className="brand-icon">⚡</span>
          <span className="brand-title">Noter<span className="accent">.io</span></span>
        </NavLink>

        <nav className="nav-links">
          {/* Client-side routing: Active route matching with NavLink */}
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
      {/* Client-side routing: Top-level Router provider managing URL history */}
      <Router>
        <div className="app-layout">
          <Navigation />

          <main className="main-content">
            {/* Client-side routing: Route matching table with dynamic params and 404 fallback */}
            <Routes>
              <Route path="/" element={<NotesList />} />
              <Route path="/new" element={<NoteForm />} />
              <Route path="/edit/:id" element={<NoteForm />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>
              Full-Stack React & Express Notes App • Demonstrating Client-Side Routing & JavaScript Hoisting
            </p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
