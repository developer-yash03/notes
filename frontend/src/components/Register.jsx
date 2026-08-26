import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/notes\/?$/, '') 
  : 'http://localhost:5000/api';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const Register = () => {
  // Controlled inputs state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Controlled input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear inline error on typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError(null);
  };

  // Client-side Form Validation
  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const parsedAge = parseInt(formData.age, 10);

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    if (!formData.age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      errors.age = 'Please enter a valid age between 1 and 120.';
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side validation check
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    // 2. Input Sanitization: Trim strings and format email
    const sanitizedPayload = {
      name: formData.name.trim(),
      age: parseInt(formData.age, 10),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // 3. JWT Handling: Save token and log user in
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
        <span className="auth-icon">🚀</span>
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join Noter.io to manage your notes securely</p>
      </div>

      {serverError && (
        <div className="error-alert" role="alert">
          <span>⚠️ {serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Name Input */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className={fieldErrors.name ? 'input-error' : ''}
            required
            autoFocus
          />
          {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
        </div>

        {/* Age Input */}
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="25"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleChange}
            className={fieldErrors.age ? 'input-error' : ''}
            required
          />
          {fieldErrors.age && <span className="field-error-msg">{fieldErrors.age}</span>}
        </div>

        {/* Email Input */}
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
          />
          {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Password (min 6 chars)</label>
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

        {/* Submit Button with Loading State */}
        <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
          {isLoading ? (
            <span className="btn-loading-content">
              <span className="spinner-small"></span> Creating Account...
            </span>
          ) : (
            'Register & Get Started'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
