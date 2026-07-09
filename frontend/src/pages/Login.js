import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      setMessage('Please enter a valid email address');
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!validateForm()) return;

    const result = await login(form);
    if (result.ok) {
      navigate('/');
      return;
    }
    setMessage(result.message);
  };

  const handleGoogleCallback = async (response) => {
    setMessage('');
    const result = await loginWithGoogle(response.credential);
    if (result.ok) {
      navigate('/');
    } else {
      setMessage(result.message);
    }
  };

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large", width: "350" }
      );
    }
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-circle">
            <img 
              src="/Dark_Logo.png" 
              alt="EcoMarket Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} 
            />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your EcoMarket account</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 4 10 8 10-8"></path></svg>
              </span>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <button type="button" className="forgot-password text-btn" disabled>
            Forgot password?
          </button>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message ? <p className="form-message error">{message}</p> : null}

        <div className="divider">OR CONTINUE WITH</div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div id="googleSignInButton"></div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
        </div>
        
        <Link to="/" className="back-link">&larr; Back to home</Link>
      </div>
    </div>
  );
};

export default Login;