import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/notes\/?$/, '') 
  : 'http://localhost:5000/api';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError(null);
  };

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    const sanitizedPayload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials. Please try again.');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-header">
        <span className="auth-icon">🔐</span>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to access your notes</p>
      </div>

      {serverError && (
        <div className="error-alert" role="alert">
          <span>⚠️ {serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className={fieldErrors.email ? 'input-error' : ''}
            required
            autoFocus
          />
          {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={fieldErrors.password ? 'input-error' : ''}
            required
          />
          {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
          {isLoading ? (
            <span className="btn-loading-content">
              <span className="spinner-small"></span> Logging in...
            </span>
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account? <Link to="/register">Create one now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
