import React, { useState, useEffect } from 'react';
import API from '../services/api';
import PGCard from '../components/PGCard';
import { Heart, RefreshCw } from 'lucide-react';

export default function Wishlist() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await API.get('/wishlist');
      if (res.data.success) {
        setPgs(res.data.pgs);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (pgId, inWishlist) => {
    if (!inWishlist) {
      setPgs((prev) => prev.filter((p) => p._id !== pgId));
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
        <Heart size={28} color="#dc2626" fill="#dc2626" />
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Your Saved Wishlist</h1>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>PG accommodations saved for quick comparison and future booking.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#475569' }}>
          <RefreshCw className="animate-spin" size={32} color="#2563eb" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600, color: '#0f172a' }}>Loading Wishlist...</p>
        </div>
      ) : pgs.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Heart size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>No Saved PGs Yet</h3>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Click the heart icon on any PG card during your search to save it here.</p>
        </div>
      ) : (
        <div className="grid-3">
          {pgs.map((pg) => (
            <PGCard key={pg._id} pg={pg} inWishlistInitial={true} onWishlistToggle={handleToggle} />
          ))}
        </div>
      )}

    </div>
  );
}
