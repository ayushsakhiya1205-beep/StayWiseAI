import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { MessageSquare, Clock, CheckCircle2, Phone, Mail, Building2 } from 'lucide-react';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await API.get('/enquiries/my');
      if (res.data.success) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      console.error('Enquiries fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
        <MessageSquare size={28} color="#2563eb" />
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Your Sent Enquiries</h1>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Track responses and status of your PG booking enquiries.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#475569' }}>Loading Enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <MessageSquare size={48} color="#2563eb" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>No Sent Enquiries</h3>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>When you enquire about a PG, your conversation history will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {enquiries.map((enq) => (
            <div key={enq._id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={18} color="#2563eb" /> {enq.pgId ? enq.pgId.name : 'PG Accommodation'}
                  </h3>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {enq.pgId ? enq.pgId.address : ''}
                  </div>
                </div>

                {/* Status Pill */}
                <div style={{
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: enq.status === 'Contacted' ? '#dcfce7' : enq.status === 'Closed' ? '#fee2e2' : '#fef3c7',
                  color: enq.status === 'Contacted' ? '#16a34a' : enq.status === 'Closed' ? '#dc2626' : '#d97706',
                  border: `1px solid ${enq.status === 'Contacted' ? '#86efac' : enq.status === 'Closed' ? '#fca5a5' : '#fde047'}`
                }}>
                  Status: {enq.status}
                </div>
              </div>

              {/* Message Box */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>YOUR ENQUIRY MESSAGE</div>
                <p style={{ color: '#0f172a', fontSize: '0.9rem' }}>"{enq.message}"</p>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Sent on {new Date(enq.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Owner Reply if available */}
              {enq.replyMessage && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginBottom: '0.2rem' }}>OWNER RESPONSE</div>
                  <p style={{ color: '#0f172a', fontSize: '0.9rem' }}>"{enq.replyMessage}"</p>
                </div>
              )}

              {/* Owner Contact info if provided */}
              {enq.pgId && enq.pgId.ownerId && (
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontWeight: 600 }}>
                    <Phone size={14} /> Owner Phone: <strong>{enq.pgId.ownerId.mobile}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Mail size={14} /> Owner Email: {enq.pgId.ownerId.email}
                  </span>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
