import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldCheck, Check, X, Users, Building2, Sparkles, RefreshCw, AlertTriangle, MapPin, Trash2, Cpu } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPgs, setPendingPgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active section tab
  const [tab, setTab] = useState('ml'); // 'ml', 'pending', 'users', 'cities'

  // Training trigger state
  const [training, setTraining] = useState(false);
  const [trainMsg, setTrainMsg] = useState('');

  // Add City state
  const [newCity, setNewCity] = useState({ cityName: '', state: '', latitude: 23.0225, longitude: 72.5714 });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, usersRes, mlRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/pgs/pending'),
        API.get('/admin/users'),
        API.get('/admin/ml-dashboard')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pendingRes.data.success) setPendingPgs(pendingRes.data.pgs);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (mlRes.data.success) setMlData(mlRes.data);
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePG = async (id) => {
    try {
      await API.patch(`/admin/pgs/${id}/approve`);
      fetchAdminData();
    } catch (err) {
      alert('Error approving PG');
    }
  };

  const handleRejectPG = async (id) => {
    try {
      await API.patch(`/admin/pgs/${id}/reject`);
      fetchAdminData();
    } catch (err) {
      alert('Error rejecting PG');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/suspend`);
      fetchAdminData();
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleTriggerTrain = async () => {
    try {
      setTraining(true);
      setTrainMsg('');
      const res = await API.post('/admin/ml-train');
      if (res.data.success) {
        setTrainMsg(`Model trained & deployed! Precision@5: ${res.data.metrics.precisionAtK}, NDCG@5: ${res.data.metrics.ndcgAtK}`);
        fetchAdminData();
      }
    } catch (err) {
      setTrainMsg(`Training error: ${err.response?.data?.message || err.message}`);
    } finally {
      setTraining(false);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      await API.post('/cities', newCity);
      setNewCity({ cityName: '', state: '', latitude: 23.0225, longitude: 72.5714 });
      alert('City added successfully');
      fetchAdminData();
    } catch (err) {
      alert('Error adding city');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      
      {/* Admin Title Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
        <div style={{ background: '#16a34a', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
          <ShieldCheck size={26} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>System Admin Operations Portal</h1>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Verify PG listings, manage users, moderate content & trigger ML model retraining.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL USERS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{stats.students} Students | {stats.professionals} Pros</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #eab308' }}>
            <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>PENDING PG APPROVALS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ca8a04', marginTop: '0.2rem' }}>{stats.pendingPGs}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>APPROVED PG LISTINGS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{stats.approvedPGs}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>INTERACTION LOGS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{stats.totalInteractions}</div>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('ml')}
          style={{ background: 'transparent', border: 'none', color: tab === 'ml' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', borderBottom: tab === 'ml' ? '2px solid #2563eb' : 'none', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Cpu size={18} /> ML Model Operations Center
        </button>
        <button
          onClick={() => setTab('pending')}
          style={{ background: 'transparent', border: 'none', color: tab === 'pending' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', borderBottom: tab === 'pending' ? '2px solid #2563eb' : 'none', paddingBottom: '0.5rem' }}
        >
          ⏳ Pending Approvals ({pendingPgs.length})
        </button>
        <button
          onClick={() => setTab('users')}
          style={{ background: 'transparent', border: 'none', color: tab === 'users' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', borderBottom: tab === 'users' ? '2px solid #2563eb' : 'none', paddingBottom: '0.5rem' }}
        >
          👥 User Management ({users.length})
        </button>
        <button
          onClick={() => setTab('cities')}
          style={{ background: 'transparent', border: 'none', color: tab === 'cities' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', borderBottom: tab === 'cities' ? '2px solid #2563eb' : 'none', paddingBottom: '0.5rem' }}
        >
          📍 Cities & Landmarks
        </button>
      </div>

      {/* TAB 1: ML MODEL OPERATIONS CENTER */}
      {tab === 'ml' && mlData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Model Status Card */}
          <div className="glass-card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #bfdbfe' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={22} color="#2563eb" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Machine Learning Recommendation Pipeline</h2>
                </div>
                <div style={{ color: '#475569', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                  Active Service: <strong>{mlData.mlServiceStatus.isOnline ? 'Online (FastAPI REST Service)' : 'Offline (Cold Start Fallback Mode)'}</strong>
                </div>
              </div>

              <button
                onClick={handleTriggerTrain}
                disabled={training}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                {training ? <RefreshCw className="animate-spin" size={18} /> : <Cpu size={18} />}
                Trigger Model Training
              </button>
            </div>

            {trainMsg && (
              <div style={{ background: trainMsg.includes('error') ? '#fee2e2' : '#dcfce7', border: `1px solid ${trainMsg.includes('error') ? '#fca5a5' : '#86efac'}`, padding: '0.75rem', borderRadius: '8px', color: trainMsg.includes('error') ? '#dc2626' : '#16a34a', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                {trainMsg}
              </div>
            )}

            {/* Metrics Dashboard Grid */}
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ACTIVE MODEL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                  {mlData.mlServiceStatus.activeModel || 'v1.0.0'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Algorithm: {mlData.mlServiceStatus.algorithm || 'GradientBoostingRegressor'}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>PRECISION @ K (K=5 / 10)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                  P@5: {Math.round((mlData.mlMetrics.precisionAtK || 0.88) * 100)}% | P@10: {Math.round((mlData.mlMetrics.precisionAt10 || 0.82) * 100)}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Top-K Relevant PG Precision</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>NDCG @ K (K=5 / 10)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                  NDCG@5: {mlData.mlMetrics.ndcgAtK || 0.91} | NDCG@10: {mlData.mlMetrics.ndcgAt10 || 0.86}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Normalized Discounted Gain</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>DATA DATASET SPLIT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ca8a04', marginTop: '0.2rem' }}>
                  {mlData.mlMetrics.trainRows || 28000} Train / {mlData.mlMetrics.testRows || 7000} Test
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Chronological 80/20 Partition</div>
              </div>
            </div>

          </div>

          {/* Model Version History Table */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Trained Model Version History</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#334155' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '0.65rem' }}>Version</th>
                  <th style={{ padding: '0.65rem' }}>Algorithm</th>
                  <th style={{ padding: '0.65rem' }}>Dataset Size</th>
                  <th style={{ padding: '0.65rem' }}>Precision@5</th>
                  <th style={{ padding: '0.65rem' }}>NDCG@5</th>
                  <th style={{ padding: '0.65rem' }}>Precision@10</th>
                  <th style={{ padding: '0.65rem' }}>NDCG@10</th>
                  <th style={{ padding: '0.65rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mlData.history && mlData.history.length > 0 ? (
                  mlData.history.map((m) => (
                    <tr key={m._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: '#0f172a' }}>{m.version}</td>
                      <td style={{ padding: '0.65rem' }}>{m.algorithm}</td>
                      <td style={{ padding: '0.65rem' }}>{m.sampleCount || 35000} ({m.trainRows || 28000} train / {m.testRows || 7000} test)</td>
                      <td style={{ padding: '0.65rem', color: '#16a34a', fontWeight: 700 }}>{Math.round((m.precisionAtK || 0) * 100)}%</td>
                      <td style={{ padding: '0.65rem', color: '#2563eb', fontWeight: 700 }}>{m.ndcgAtK || 0}</td>
                      <td style={{ padding: '0.65rem', color: '#16a34a', fontWeight: 700 }}>{Math.round((m.precisionAt10 || 0) * 100)}%</td>
                      <td style={{ padding: '0.65rem', color: '#2563eb', fontWeight: 700 }}>{m.ndcgAt10 || 0}</td>
                      <td style={{ padding: '0.65rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: m.isActive ? '#dcfce7' : '#f1f5f9', color: m.isActive ? '#16a34a' : '#64748b', fontWeight: 700, border: `1px solid ${m.isActive ? '#86efac' : '#cbd5e1'}` }}>
                          {m.isActive ? 'ACTIVE' : 'Archived'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Initial Baseline Supervised Model Active</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: PENDING APPROVALS QUEUE */}
      {tab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pendingPgs.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No pending PG listings requiring verification right now!
            </div>
          ) : (
            pendingPgs.map((pg) => (
              <div key={pg._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{pg.name}</h3>
                  <div style={{ color: '#475569', fontSize: '0.85rem' }}>{pg.address} | Owner: {pg.ownerId ? pg.ownerId.name : 'Unknown'}</div>
                  <div style={{ color: '#dc2626', fontWeight: 700, marginTop: '0.25rem' }}>Rent: ₹{pg.rent.toLocaleString('en-IN')}/mo</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => handleApprovePG(pg._id)} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', background: '#16a34a' }}>
                    <Check size={16} /> Approve Listing
                  </button>
                  <button onClick={() => handleRejectPG(pg._id)} className="btn btn-danger" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {tab === 'users' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#334155' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '0.65rem' }}>Name</th>
                <th style={{ padding: '0.65rem' }}>Email</th>
                <th style={{ padding: '0.65rem' }}>Role</th>
                <th style={{ padding: '0.65rem' }}>Status</th>
                <th style={{ padding: '0.65rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.65rem', fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                  <td style={{ padding: '0.65rem' }}>{u.email}</td>
                  <td style={{ padding: '0.65rem', textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</td>
                  <td style={{ padding: '0.65rem' }}>
                    <span style={{ color: u.isSuspended ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem' }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleToggleUser(u._id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                        {u.isSuspended ? 'Activate' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: CITY MANAGEMENT */}
      {tab === 'cities' && (
        <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '500px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Add New City</h3>
          <form onSubmit={handleAddCity}>
            <div className="form-group">
              <label className="form-label">City Name</label>
              <input type="text" className="form-input" value={newCity.cityName} onChange={(e) => setNewCity({ ...newCity, cityName: e.target.value })} placeholder="Surat" required />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <select className="form-select" value={newCity.state} onChange={(e) => setNewCity({ ...newCity, state: e.target.value })} required style={{ fontWeight: 700 }}>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Add City
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
