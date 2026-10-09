import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        if (formData.role === 'pg_owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/search');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.25rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src="/staywise-logo.png" 
            alt="StayWise Logo" 
            style={{ height: '52px', width: 'auto', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block', borderRadius: '10px' }} 
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Create Your Account</h2>
          <p style={{ color: '#475569', fontSize: '0.88rem' }}>Join StayWise AI Recommendation Platform</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">I am registering as</label>
            <select className="form-select" name="role" value={formData.role} onChange={handleChange} style={{ fontWeight: 700 }}>
              <option value="student">🎓 Student searching for PG near College</option>
              <option value="working_professional">💼 Working Professional searching near Office</option>
              <option value="pg_owner">🏢 PG Owner listing property</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Aarav Shah" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="aarav@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input type="tel" className="form-input" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="9876543210" required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register'}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
