import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Sparkles, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '3.5rem 0 2rem 0', marginTop: '5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <img 
                src="/staywise-logo.png" 
                alt="StayWise Logo" 
                style={{ height: '34px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>StayWise</span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.6' }}>
              AI/ML-based smart PG recommendation engine for students and working professionals. Multi-factor matching considering budget, facilities, and proximity.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>For Searchers</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: '#475569' }}>
              <li><Link to="/search?role=student">Student PG Recommendations</Link></li>
              <li><Link to="/search?role=working_professional">Working Professional PGs</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/enquiries">Enquiry Status Tracker</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>For PG Owners</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: '#475569' }}>
              <li><Link to="/register?role=pg_owner">List Your PG</Link></li>
              <li><Link to="/owner-dashboard">Owner Hub & Stats</Link></li>
              <li><Link to="/owner-dashboard">Manage Vacancies</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>AI Model System</h4>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Powered by Python FastAPI, Scikit-learn RandomForest & Cold-Start fallback scoring.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600 }}>
              <Sparkles size={14} color="#2563eb" /> Dual-Phase Learning Active
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: '#64748b', fontSize: '0.82rem' }}>
          <div>© {new Date().getFullYear()} StayWise Inc. Final Year AI/ML Project. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
