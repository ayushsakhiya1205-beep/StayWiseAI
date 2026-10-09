import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import RecommendationBadge from '../components/RecommendationBadge';
import PGFacilityGallery from '../components/PGFacilityGallery';
import { MapPin, Star, Phone, Mail, User, Shield, Check, Utensils, Wifi, Zap, Car, Flame, MessageSquare, Heart, Send } from 'lucide-react';

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [pg, setPg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Enquiry modal state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchPGDetails();
    // Log VIEW interaction event for ML training
    API.post('/interactions', { pgId: id, eventType: 'VIEW' }).catch(() => {});
  }, [id]);

  const fetchPGDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/pgs/${id}`);
      if (res.data.success) {
        setPg(res.data.pg);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Fetch PG details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await API.post('/enquiries', { pgId: id, message: enquiryMsg });
      if (res.data.success) {
        setEnquirySent(true);
        setTimeout(() => {
          setShowEnquiryModal(false);
          setEnquirySent(false);
          setEnquiryMsg('');
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending enquiry');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await API.post('/reviews', { pgId: id, rating: newRating, comment: newComment });
      if (res.data.success) {
        setNewComment('');
        fetchPGDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0', color: '#94a3b8' }}>
        <h2>Loading PG Details...</h2>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: '#fff' }}>
        <h2>PG Listing Not Found</h2>
        <button onClick={() => navigate('/search')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      
      {/* PG Facilities & Gallery Section */}
      <PGFacilityGallery />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Title Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{pg.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef08a', color: '#854d0e', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.95rem', border: '1px solid #fde047' }}>
                <Star size={18} fill="#eab308" color="#eab308" /> {pg.ratingAverage || 4.5} ({pg.ratingCount || 0} reviews)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              <MapPin size={18} color="#2563eb" />
              <span>{pg.address}, {pg.cityId ? pg.cityId.cityName : ''}</span>
            </div>

            {/* Recommendation Explanation Pill */}
            <RecommendationBadge
              matchScore={pg.matchScore || 92}
              mode={pg.recommendationMode || 'Smart Match'}
              indicators={pg.indicators}
              reason={pg.recommendationReason}
            />
          </div>

          {/* Description */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>About this Accommodation</h3>
            <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '0.95rem' }}>{pg.description}</p>
          </div>

          {/* Amenities Grid */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Facilities & Amenities</h3>
            
            <div className="grid-3">
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: pg.acType !== 'non-ac' ? '#2563eb' : '#64748b' }}>
                <Zap size={20} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>AC Rooms</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pg.acType.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: pg.foodAvailable ? '#16a34a' : '#64748b' }}>
                <Utensils size={20} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Food Facility</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pg.foodAvailable ? 'Meals Included' : 'Not Included'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: pg.wifiAvailable ? '#eab308' : '#64748b' }}>
                <Wifi size={20} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Wi-Fi Fiber</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pg.wifiAvailable ? 'High Speed' : 'No'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: pg.parkingType !== 'none' ? '#dc2626' : '#64748b' }}>
                <Car size={20} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Parking</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pg.parkingType ? pg.parkingType.toUpperCase() : 'Available'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: pg.geyserAvailable ? '#dc2626' : '#64748b' }}>
                <Flame size={20} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Hot Water Geyser</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pg.geyserAvailable ? 'Available 24/7' : 'No'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#2563eb' }}>
                <Shield size={20} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Furnishing</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pg.furnishingType}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Reviews Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Ratings & Reviews</h3>
            
            {/* Add Review Form */}
            {user && (
              <form onSubmit={handleAddReview} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Write a Review</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= newRating ? '#eab308' : '#cbd5e1'}
                      fill={star <= newRating ? '#eab308' : 'none'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setNewRating(star)}
                    />
                  ))}
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Share your experience staying at this PG..."
                  rows="3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                  required
                />
                <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                  Submit Review
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No reviews yet. Be the first to leave a review!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((r) => (
                  <div key={r._id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{r.userId ? r.userId.name : 'Verified Tenant'}</span>
                      <div style={{ display: 'flex', color: '#eab308' }}>
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#eab308" color="#eab308" />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.85rem' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Pricing & Owner Contact Action Drawer */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Monthly Rent</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>
                ₹{(pg.rent || 0).toLocaleString('en-IN')}
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/month</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#2563eb', marginTop: '0.2rem', fontWeight: 600 }}>
                Security Deposit: ₹{(pg.deposit || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={() => setShowEnquiryModal(true)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
            >
              <MessageSquare size={18} /> Enquire Now
            </button>

            {/* Owner Details */}
            {pg.ownerId && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>LISTED BY OWNER</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{pg.ownerId.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontSize: '0.88rem', marginTop: '0.4rem', fontWeight: 600 }}>
                  <Phone size={14} /> {pg.ownerId.mobile}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Send Enquiry Modal */}
      {showEnquiryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Send Enquiry to PG Owner</h3>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Ask about room vacancy, visiting hours, or room booking details.</p>

            {enquirySent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#16a34a', fontWeight: 700 }}>
                <Check size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                Enquiry sent successfully! The owner will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry}>
                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                    placeholder="Hi, I am interested in booking a room at this PG. Is a double sharing AC room available?"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowEnquiryModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} /> Send Enquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
