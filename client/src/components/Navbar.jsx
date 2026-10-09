import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CityContext } from '../context/CityContext';
import { MapPin, Heart, MessageSquare, User, ShieldCheck, LogOut, Search, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cities, citiesByState, selectedCity, changeCity } = useContext(CityContext);
  const navigate = useNavigate();

  return (
    <header style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/staywise-logo.png"
            alt="StayWise Logo"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(135deg, #2563eb 0%, #16a34a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StayWise
            </span>
            <span style={{ fontSize: '0.7rem', display: 'block', color: '#16a34a', fontWeight: 700, letterSpacing: '0.05em' }}>
              FINDING YOUR ACCOMODATION, WISER
            </span>
          </div>
        </Link>

        {/* City Selector Pill */}
        {cities && cities.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.4rem 0.85rem', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
            <MapPin size={16} color="#2563eb" />
            <select
              value={selectedCity ? selectedCity._id : ''}
              onChange={(e) => changeCity(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', outline: 'none' }}
            >
              {citiesByState && Object.keys(citiesByState).length > 0 ? (
                Object.entries(citiesByState).map(([stateName, stateCities]) => (
                  <optgroup key={stateName} label={`📍 ${stateName} State (${stateCities.length} Districts)`}>
                    {stateCities.map((c) => (
                      <option key={c._id} value={c._id} style={{ background: '#ffffff', color: '#0f172a' }}>
                        {c.cityName}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                cities.map((c) => (
                  <option key={c._id} value={c._id} style={{ background: '#ffffff', color: '#0f172a' }}>
                    {c.cityName}, {c.state}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Navigation Links & Action Controls */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/search" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.88rem' }}>
            <Search size={16} color="#2563eb" /> Find My PG
          </Link>

          {user && (user.role === 'student' || user.role === 'working_professional') && (
            <>
              <Link to="/wishlist" style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <Heart size={18} color="#dc2626" fill="#dc2626" /> Wishlist
              </Link>
              <Link to="/enquiries" style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <MessageSquare size={18} color="#2563eb" /> Enquiries
              </Link>
            </>
          )}

          {user && (user.role === 'pg_owner' || user.role === 'admin') && (
            <Link to="/owner-dashboard" className="btn btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
              <PlusCircle size={16} /> Owner Hub
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin-dashboard" className="btn btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderColor: '#16a34a', color: '#16a34a' }}>
              <ShieldCheck size={16} /> Admin Portal
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</div>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem' }} title="Logout">
                <LogOut size={16} color="#dc2626" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.88rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.88rem' }}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
