import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RecommendationBadge({ matchScore, mode, indicators, reason, featureScores }) {
  const [showExplanation, setShowExplanation] = useState(false);

  const isHigh = matchScore >= 80;
  const isMedium = matchScore >= 65;
  const badgeClass = isHigh ? 'badge-match-high' : isMedium ? 'badge-match-medium' : 'badge-secondary';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Match Percentage Pill */}
        <div className={`badge ${badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
          <Sparkles size={14} /> {matchScore || 85}% Match
        </div>

        {/* Mode Indicator Pill */}
        <div className="badge badge-mode" style={{ fontSize: '0.75rem' }}>
          {mode || 'Smart Match'}
        </div>

        {/* Info Toggle button */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.78rem',
            padding: '0.2rem',
            fontWeight: 600
          }}
          title="Why this match score?"
        >
          <Info size={14} color="#2563eb" /> Explain Score
        </button>
      </div>

      {/* Feature Breakdown Indicators */}
      {indicators && (
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#334155' }}>
            📍 Dist: <strong style={{ color: '#0f172a' }}>{indicators.distance || 'Near'}</strong>
          </span>
          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#334155' }}>
            💰 Budget: <strong style={{ color: '#0f172a' }}>{indicators.budget || 'Fits'}</strong>
          </span>
          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#334155' }}>
            ⚡ Amenities: <strong style={{ color: '#0f172a' }}>{indicators.amenities || 'High'}</strong>
          </span>
          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#334155' }}>
            ★ Rating: <strong style={{ color: '#ca8a04' }}>{indicators.rating || '4.5 ★'}</strong>
          </span>
        </div>
      )}

      {/* Modal Explanation Expandable Drawer */}
      {showExplanation && (
        <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#334155' }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={15} color="#16a34a" /> AI Match Explanation
          </div>
          <p style={{ lineHeight: '1.5', marginBottom: '0.5rem' }}>
            {reason || 'This score is calculated using distance from your landmark, budget suitability, matched amenities, and PG user ratings.'}
          </p>

          {featureScores && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.3rem', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
              <div>Distance Weight Score: <strong style={{ color: '#0f172a' }}>{Math.round((featureScores.distanceScore || 0.8) * 100)}%</strong></div>
              <div>Price Fit Score: <strong style={{ color: '#0f172a' }}>{Math.round((featureScores.priceFitScore || 1.0) * 100)}%</strong></div>
              <div>Amenity Match: <strong style={{ color: '#0f172a' }}>{Math.round((featureScores.amenityMatchPct || 0.9) * 100)}%</strong></div>
              <div>Rating Score: <strong style={{ color: '#0f172a' }}>{Math.round((featureScores.ratingScore || 0.8) * 100)}%</strong></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
