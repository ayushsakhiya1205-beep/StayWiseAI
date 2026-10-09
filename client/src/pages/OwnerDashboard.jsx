import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { CityContext } from '../context/CityContext';
import { Building2, PlusCircle, CheckCircle2, Clock, MessageSquare, Star, Edit, ToggleLeft, ToggleRight, X, Send } from 'lucide-react';

export default function OwnerDashboard() {
  const { cities, citiesByState } = useContext(CityContext);

  const [stats, setStats] = useState(null);
  const [pgs, setPgs] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('pgs'); // 'pgs', 'enquiries'

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPgId, setEditingPgId] = useState(null);
  const [formData, setFormData] = useState({
    cityId: '',
    name: '',
    description: '',
    address: '',
    latitude: 23.0225,
    longitude: 72.5714,
    rent: 8500,
    deposit: 8500,
    sharingType: 'Double Sharing',
    genderPreference: 'co-ed',
    acType: 'ac',
    parkingType: 'bike',
    foodAvailable: true,
    wifiAvailable: true,
    laundryAvailable: true,
    powerBackup: true,
    geyserAvailable: true,
    furnishingType: 'furnished',
    photos: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
  });

  // Reply enquiry state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pgsRes, enqRes] = await Promise.all([
        API.get('/owner/stats'),
        API.get('/owner/pgs'),
        API.get('/owner/enquiries')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pgsRes.data.success) setPgs(pgsRes.data.pgs);
      if (enqRes.data.success) setEnquiries(enqRes.data.enquiries);
    } catch (err) {
      console.error('Owner dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVacancy = async (id) => {
    try {
      const res = await API.patch(`/owner/pgs/${id}/availability`);
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert('Error updating vacancy status');
    }
  };

  const handleSavePG = async (e) => {
    e.preventDefault();
    try {
      const photoArray = typeof formData.photos === 'string' ? formData.photos.split(',').map((s) => s.trim()) : formData.photos;
      const payload = {
        ...formData,
        photos: photoArray,
        roomTypes: ['single', 'double']
      };

      if (editingPgId) {
        await API.put(`/owner/pgs/${editingPgId}`, payload);
      } else {
        await API.post('/owner/pgs', payload);
      }

      setShowModal(false);
      setEditingPgId(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving PG listing');
    }
  };

  const handleReplyEnquiry = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      await API.put(`/owner/enquiries/${selectedEnquiry._id}`, {
        status: 'Contacted',
        replyMessage: replyText
      });
      setSelectedEnquiry(null);
      setReplyText('');
      fetchDashboardData();
    } catch (err) {
      alert('Error responding to enquiry');
    }
  };

  const openAddModal = () => {
    setEditingPgId(null);
    setFormData({
      cityId: cities && cities.length > 0 ? cities[0]._id : '',
      name: '',
      description: '',
      address: '',
      latitude: 23.0225,
      longitude: 72.5714,
      rent: 8500,
      deposit: 8500,
      sharingType: 'Double Sharing',
      genderPreference: 'co-ed',
      acType: 'ac',
      parkingType: 'bike',
      foodAvailable: true,
      wifiAvailable: true,
      laundryAvailable: true,
      powerBackup: true,
      geyserAvailable: true,
      furnishingType: 'furnished',
      photos: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    });
    setShowModal(true);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      
      {/* Header & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>PG Owner Management Hub</h1>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Manage your property listings, availability and tenant enquiries.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <PlusCircle size={18} /> Add New PG Listing
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL PROPERTIES</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>{stats.totalPGs}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>APPROVED LISTINGS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{stats.approvedPGs}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #eab308' }}>
            <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>PENDING REVIEW</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ca8a04', marginTop: '0.2rem' }}>{stats.pendingPGs}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>TENANT ENQUIRIES</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{stats.totalEnquiries}</div>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('pgs')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'pgs' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', borderBottom: activeTab === 'pgs' ? '2px solid #2563eb' : 'none', paddingBottom: '0.5rem' }}
        >
          🏢 My Property Listings ({pgs.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'enquiries' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', borderBottom: activeTab === 'enquiries' ? '2px solid #2563eb' : 'none', paddingBottom: '0.5rem' }}
        >
          💬 Tenant Enquiries ({enquiries.length})
        </button>
      </div>

      {/* TAB 1: MY PGS */}
      {activeTab === 'pgs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pgs.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No PG listings created yet. Click "Add New PG Listing" to get started!
            </div>
          ) : (
            pgs.map((pg) => (
              <div key={pg._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={pg.photos[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200'} alt={pg.name} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{pg.name}</h3>
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{pg.address}</div>
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: pg.status === 'approved' ? '#dcfce7' : '#fef3c7', color: pg.status === 'approved' ? '#16a34a' : '#d97706', fontWeight: 700, border: `1px solid ${pg.status === 'approved' ? '#86efac' : '#fde047'}` }}>
                        {pg.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 700 }}>₹{pg.rent.toLocaleString('en-IN')}/mo</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Vacancy Toggle */}
                  <button
                    onClick={() => handleToggleVacancy(pg._id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', color: pg.availability ? '#16a34a' : '#dc2626', fontWeight: 700 }}
                  >
                    {pg.availability ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {pg.availability ? 'Available' : 'Full / Occupied'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingPgId(pg._id);
                      setFormData({ ...pg, photos: pg.photos ? pg.photos.join(', ') : '' });
                      setShowModal(true);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <Edit size={16} /> Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {enquiries.map((enq) => (
            <div key={enq._id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>From: {enq.userId ? enq.userId.name : 'Searcher'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Phone: {enq.userId ? enq.userId.mobile : ''} | Email: {enq.userId ? enq.userId.email : ''}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>Status: {enq.status}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                "{enq.message}"
              </div>

              {enq.replyMessage && (
                <div style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Your Reply: "{enq.replyMessage}"
                </div>
              )}

              <button
                onClick={() => { setSelectedEnquiry(enq); setReplyText(enq.replyMessage || ''); }}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
              >
                Reply / Update Status
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PG MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '650px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {editingPgId ? 'Edit PG Listing' : 'Add New PG Listing'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePG}>
              
              <div className="form-group">
                <label className="form-label">Select State & District City</label>
                <select className="form-select" value={formData.cityId} onChange={(e) => setFormData({ ...formData, cityId: e.target.value })} required style={{ fontWeight: 700 }}>
                  <option value="">Select District City</option>
                  {citiesByState && Object.entries(citiesByState).map(([stateName, stateCities]) => (
                    <optgroup key={stateName} label={`📍 ${stateName} State (${stateCities.length} Districts)`}>
                      {stateCities.map((c) => (
                        <option key={c._id} value={c._id}>{c.cityName}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">PG Accommodation Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Patel Luxury Student PG" required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Full Street Address</label>
                <input type="text" className="form-input" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Monthly Rent (₹)</label>
                  <input type="number" className="form-input" value={formData.rent} onChange={(e) => setFormData({ ...formData, rent: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit (₹)</label>
                  <input type="number" className="form-input" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Latitude Coords</label>
                  <input type="number" step="any" className="form-input" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude Coords</label>
                  <input type="number" step="any" className="form-input" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender Preference</label>
                  <select className="form-select" value={formData.genderPreference} onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                    <option value="co-ed">Co-ed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">AC Type</label>
                  <select className="form-select" value={formData.acType} onChange={(e) => setFormData({ ...formData, acType: e.target.value })}>
                    <option value="ac">AC Rooms</option>
                    <option value="non-ac">Non-AC Rooms</option>
                    <option value="both">Both Available</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Photo Image URLs (comma separated)</label>
                <input type="text" className="form-input" value={formData.photos} onChange={(e) => setFormData({ ...formData, photos: e.target.value })} placeholder="https://..." required />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save PG Listing</button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* REPLY ENQUIRY MODAL */}
      {selectedEnquiry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Respond to Tenant Enquiry</h3>
            <form onSubmit={handleReplyEnquiry}>
              <div className="form-group">
                <label className="form-label">Your Reply</label>
                <textarea className="form-textarea" rows="3" value={replyText} onChange={(e) => setReplyText(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedEnquiry(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Send size={16} /> Send Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
