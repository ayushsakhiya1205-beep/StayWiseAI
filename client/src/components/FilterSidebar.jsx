import React from 'react';
import { SlidersHorizontal, DollarSign, Shield, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ filters, onChange, onReset }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SlidersHorizontal size={18} color="#2563eb" /> Filter & Sort
        </h3>
        <button
          onClick={onReset}
          style={{ background: 'transparent', border: 'none', color: '#16a34a', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Sort By Option */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Sort Results By</label>
        <select
          className="form-select"
          value={filters.sortBy || 'best_match'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <option value="best_match">✨ AI Best Match Score</option>
          <option value="nearest">📍 Nearest Distance First</option>
          <option value="lowest_rent">💰 Lowest Rent First</option>
          <option value="highest_rated">★ Highest Rated</option>
        </select>
      </div>

      {/* Budget Range */}
      <div>
        <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
          Max Monthly Rent: <strong style={{ color: '#2563eb' }}>₹{(filters.maxRent || 25000).toLocaleString('en-IN')}</strong>
        </label>
        <input
          type="range"
          min="3000"
          max="35000"
          step="500"
          value={filters.maxRent || 25000}
          onChange={(e) => handleChange('maxRent', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <span>₹3,000</span>
          <span>₹35,000+</span>
        </div>
      </div>

      {/* Room Sharing Type */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Room Type / Sharing</label>
        <select
          className="form-select"
          value={filters.roomType || 'any'}
          onChange={(e) => handleChange('roomType', e.target.value)}
        >
          <option value="any">Any Room Type</option>
          <option value="single">Single Private Room</option>
          <option value="double">Double Sharing</option>
          <option value="triple">Triple Sharing</option>
          <option value="dormitory">Dormitory</option>
        </select>
      </div>

      {/* Gender Preference */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Gender Preference</label>
        <select
          className="form-select"
          value={filters.genderPreference || 'any'}
          onChange={(e) => handleChange('genderPreference', e.target.value)}
        >
          <option value="any">Any Gender</option>
          <option value="boys">Boys Only</option>
          <option value="girls">Girls Only</option>
          <option value="co-ed">Co-ed</option>
        </select>
      </div>

      {/* AC Preference */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Air Conditioning</label>
        <select
          className="form-select"
          value={filters.acType || 'any'}
          onChange={(e) => handleChange('acType', e.target.value)}
        >
          <option value="any">Any AC / Non-AC</option>
          <option value="ac">AC Required</option>
          <option value="non-ac">Non-AC Only</option>
        </select>
      </div>

      {/* Checkbox Facilities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <label className="form-label">Key Facilities</label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={!!filters.foodRequired}
            onChange={(e) => handleChange('foodRequired', e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          Hygienic Food Included
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={!!filters.wifiRequired}
            onChange={(e) => handleChange('wifiRequired', e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          High-Speed Wi-Fi
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={!!filters.laundryRequired}
            onChange={(e) => handleChange('laundryRequired', e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          Laundry Service
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={!!filters.geyserRequired}
            onChange={(e) => handleChange('geyserRequired', e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          Geyser / Hot Water
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={!!filters.powerBackupRequired}
            onChange={(e) => handleChange('powerBackupRequired', e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          Power Backup
        </label>
      </div>

    </div>
  );
}
