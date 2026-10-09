import React, { useState } from 'react';
import { pgFacilityImages } from '../config/pgFacilityImages';
import { Sparkles, Check } from 'lucide-react';

export default function PGFacilityGallery() {
  const [selectedFacility, setSelectedFacility] = useState(pgFacilityImages[0]);
  const [isFading, setIsFading] = useState(false);

  const handleSelect = (facility) => {
    if (facility.id === selectedFacility.id) return;
    setIsFading(true);
    setTimeout(() => {
      setSelectedFacility(facility);
      setIsFading(false);
    }, 150);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            PG Facilities & Gallery
          </h2>
          <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.15rem' }}>
            Explore verified room photos, dining hall, bathroom, and property exterior views.
          </p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
          <Sparkles size={14} color="#2563eb" /> Showing: {selectedFacility.title}
        </span>
      </div>

      {/* Main Image Display Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          borderRadius: '14px',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          marginBottom: '1.25rem'
        }}
      >
        <img
          src={selectedFacility.image}
          alt={selectedFacility.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.25s ease-in-out, transform 0.3s ease-out',
            opacity: isFading ? 0.3 : 1,
            transform: isFading ? 'scale(0.99)' : 'scale(1)'
          }}
        />

        {/* Overlay Label Badge on Main Image */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
          {selectedFacility.title}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Select Facility Category
        </div>

        {/* Responsive Thumbnail Bar */}
        <div
          className="pg-gallery-thumbnails"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.75rem',
            width: '100%'
          }}
        >
          {pgFacilityImages.map((item) => {
            const isActive = selectedFacility.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                type="button"
                style={{
                  border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.4rem',
                  background: isActive ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 5px rgba(0,0,0,0.03)',
                  outline: 'none',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(37,99,235,0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  }
                }}
              >
                {/* Thumbnail Image */}
                <div style={{ height: '70px', width: '100%', borderRadius: '6px', overflow: 'hidden', position: 'relative', marginBottom: '0.35rem' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isActive && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', background: '#2563eb', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#ffffff" />
                    </div>
                  )}
                </div>

                {/* Category Label */}
                <div style={{ fontSize: '0.8rem', fontWeight: isActive ? 800 : 600, color: isActive ? '#1e40af' : '#334155', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
