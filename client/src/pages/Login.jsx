import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (res.user.role === 'pg_owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/search');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.25rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src="/staywise-logo.png" 
            alt="StayWise Logo" 
            style={{ height: '52px', width: 'auto', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block', borderRadius: '10px' }} 
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Welcome Back</h2>
          <p style={{ color: '#475569', fontSize: '0.88rem' }}>Log in to access your StayWise recommendations & dashboard</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@pgfinder.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
            <LogIn size={18} /> {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#475569' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>
            Register Now
          </Link>
        </div>

        {/* Demo Credentials Quick Fill */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>DEMO ACCOUNTS CLICK TO FILL:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button type="button" onClick={() => { setEmail('student1@pgfinder.com'); setPassword('student123'); }} style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#16a34a', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>🎓 Student</button>
            <button type="button" onClick={() => { setEmail('pro1@pgfinder.com'); setPassword('pro123'); }} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>💼 Professional</button>
            <button type="button" onClick={() => { setEmail('owner1@pgfinder.com'); setPassword('owner123'); }} style={{ background: '#fef3c7', border: '1px solid #fde047', color: '#d97706', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>🏢 PG Owner</button>
            <button type="button" onClick={() => { setEmail('admin@pgfinder.com'); setPassword('admin123'); }} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>🛡️ Admin</button>
          </div>
        </div>

      </div>
    </div>
  );
}
