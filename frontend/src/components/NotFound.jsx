// Client-side routing: Link component for internal navigation
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="empty-state">
      <div className="empty-icon">🧭</div>
      <h3>404 - Page Not Found</h3>
      <p>The page you are looking for does not exist or has been moved.</p>
      {/* Client-side routing: Link to navigate back to the home route */}
      <Link to="/" className="btn-primary btn-large">
        Return to All Notes
      </Link>
    </div>
  );
};

export default NotFound;
