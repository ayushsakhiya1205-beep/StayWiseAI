import React from 'react';
import { MapPin, Navigation, Building2, X } from 'lucide-react';

export default function MapView({ landmark, pgs, onClose }) {
  const centerLat = landmark ? landmark.latitude : 23.0225;
  const centerLng = landmark ? landmark.longitude : 72.5714;
  const landmarkName = landmark ? landmark.name : 'Target Landmark';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={18} color="#2563eb" /> Map Proximity View
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#475569' }}>
              Showing nearby PGs relative to: <strong>{landmarkName}</strong> ({centerLat.toFixed(3)}, {centerLng.toFixed(3)})
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Map Interactive Canvas */}
        <div style={{ flexGrow: 1, background: '#f8fafc', position: 'relative', overflow: 'hidden', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Simulated Geographic Grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', opacity: 0.6 }} />

          {/* Central Target Landmark Marker */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', margin: 'auto 0' }}>
            <div style={{ width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 70%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <div style={{ background: '#2563eb', padding: '0.6rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
                <Building2 size={24} color="#ffffff" />
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '2px solid #2563eb', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              🎯 {landmarkName}
            </div>
          </div>

          {/* PG Markers Around Landmark */}
          <div style={{ width: '100%', maxWidth: '800px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem', zIndex: 10 }}>
            {pgs && pgs.slice(0, 6).map((pg, idx) => (
              <div key={pg._id || idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>#{pg.rank || idx + 1} {pg.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>📍 {pg.distanceKm || 1.2} km</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{pg.matchScore}% Match</span>
                </div>
                <div style={{ color: '#dc2626', fontWeight: 800, marginTop: '0.2rem' }}>
                  ₹{(pg.rent || 0).toLocaleString('en-IN')}/mo
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
