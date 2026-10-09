import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Utensils, Zap, Heart, Shield, Check, Flame, Car } from 'lucide-react';
import RecommendationBadge from './RecommendationBadge';
import API from '../services/api';
import { getFullHouseImage } from '../config/pgFacilityImages';

export default function PGCard({ pg, inWishlistInitial = false, onWishlistToggle }) {
  const [isWishlisted, setIsWishlisted] = useState(inWishlistInitial);
  const [loading, setLoading] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await API.post('/wishlist/toggle', { pgId: pg._id });
      if (res.data.success) {
        setIsWishlisted(res.data.inWishlist);
        if (onWishlistToggle) onWishlistToggle(pg._id, res.data.inWishlist);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const photoUrl = getFullHouseImage();

  return (
    <div className="glass-card animate-fade-in" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Image Banner */}
      <div style={{ height: '190px', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <img
          src={photoUrl}
          alt={pg.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, transparent 60%)' }} />

        {/* Gender Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#ffffff', backdropFilter: 'blur(4px)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', border: '1px solid #bfdbfe', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
          {pg.genderPreference || 'co-ed'}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: isWishlisted ? '#dc2626' : '#ffffff',
            border: isWishlisted ? 'none' : '1px solid #fee2e2',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            transition: 'all 0.2s'
          }}
          title="Save to Wishlist"
        >
          <Heart size={18} color={isWishlisted ? '#ffffff' : '#dc2626'} fill={isWishlisted ? '#ffffff' : 'none'} />
        </button>

        {/* Rating Badge */}
        <div style={{ position: 'absolute', bottom: '10px', left: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fef08a', color: '#854d0e', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #fde047' }}>
          <Star size={13} fill="#eab308" color="#eab308" /> {pg.ratingAverage || 4.5}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.75rem' }}>
        
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
            {pg.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.82rem' }}>
            <MapPin size={14} color="#2563eb" />
            <span>{pg.address}</span>
            {pg.distanceKm !== undefined && (
              <span style={{ color: '#2563eb', fontWeight: 700, marginLeft: 'auto' }}>
                {pg.distanceKm} km away
              </span>
            )}
          </div>
        </div>

        {/* Recommendation Score Badge */}
        <RecommendationBadge
          matchScore={pg.matchScore}
          mode={pg.recommendationMode}
          indicators={pg.indicators}
          reason={pg.recommendationReason}
          featureScores={pg.featureScores}
        />

        {/* Amenity Icons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0', color: '#475569', fontSize: '0.78rem' }}>
          {pg.acType !== 'non-ac' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb', fontWeight: 600 }} title="AC Room">
              <Zap size={14} /> AC
            </span>
          )}
          {pg.foodAvailable && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 600 }} title="Food Provided">
              <Utensils size={14} /> Food
            </span>
          )}
          {pg.wifiAvailable && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ca8a04', fontWeight: 600 }} title="High-Speed Wi-Fi">
              <Wifi size={14} /> Wi-Fi
            </span>
          )}
          {pg.parkingType && pg.parkingType !== 'none' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', fontWeight: 600 }} title="Parking">
              <Car size={14} /> Parking
            </span>
          )}
        </div>

        {/* Price & View Details Action */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Monthly Rent</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
              ₹{(pg.rent || 0).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>/mo</span>
            </div>
          </div>

          <Link to={`/pg/${pg._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            View Details
          </Link>
        </div>

      </div>
    </div>
  );
}
