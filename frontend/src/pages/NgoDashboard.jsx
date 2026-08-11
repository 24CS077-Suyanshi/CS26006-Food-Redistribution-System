import React, { useState } from 'react';
import { HeartHandshake, MapPin, Clock, CheckCircle2, Filter, PackageCheck, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NgoDashboard({ donations, setDonations, requests, setRequests }) {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  const handleClaimFood = (item) => {
    // Update donation status
    setDonations(prev => prev.map(d => {
      if (d.id === item.id) {
        return { ...d, status: 'Claimed', claimedBy: user?.name || 'Hope Shelter NGO' };
      }
      return d;
    }));

    // Create Request
    const newReq = {
      id: Date.now(),
      donation_id: item.id,
      title: item.title,
      ngo_name: user?.name || 'Hope Shelter NGO',
      status: 'Pending',
      otp_code: Math.floor(1000 + Math.random() * 9000).toString()
    };
    setRequests([newReq, ...requests]);

    setToastMessage(`🎉 Request submitted for "${item.title}"! Pickup OTP Code: ${newReq.otp_code}`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const filteredDonations = donations.filter(item => {
    if (filterType === 'Veg') return item.category === 'Veg';
    if (filterType === 'Non-Veg') return item.category === 'Non-Veg';
    if (filterType === 'Available') return item.status === 'Available';
    return true;
  });

  return (
    <div>
      {/* NGO Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <span style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          NGO / SHELTER PORTAL
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
          Welcome, {user?.name || 'Hope Shelter NGO'}
        </h2>
        <p style={{ color: '#d1fae5', fontSize: '0.95rem' }}>
          Explore nearby fresh surplus food listings, claim items for distribution, and manage volunteer pickups.
        </p>
      </div>

      {toastMessage && (
        <div className="toast-success">
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <PackageCheck size={26} color="var(--primary)" />
            Available Surplus Food Feed
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time listings from nearby verified donors.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.3rem', borderRadius: '10px' }}>
          {['All', 'Available', 'Veg', 'Non-Veg'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '7px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: filterType === type ? 'white' : 'transparent',
                color: filterType === type ? 'var(--secondary)' : 'var(--text-muted)',
                boxShadow: filterType === type ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="cards-grid">
        {filteredDonations.map(item => (
          <div key={item.id} className="food-card">
            <div className="card-banner" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${item.image_url})` }}>
              <span className={`tag-badge ${item.category === 'Veg' ? 'tag-veg' : 'tag-nonveg'}`}>
                {item.category}
              </span>
              <span className="tag-badge tag-time">
                <Clock size={12} /> Safe for {item.expiry_hours || 4}h
              </span>
            </div>

            <div className="card-body">
              <h3 className="food-title">{item.title}</h3>
              <div className="donor-info">
                <Building2 size={14} /> {item.donor_name}
              </div>

              <div className="details-row">
                <div className="detail-item">
                  <span className="detail-label">Quantity</span>
                  <span className="detail-val">{item.quantity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-val" style={{ color: item.status === 'Available' ? '#059669' : '#2563eb' }}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} /> {item.location}
                </div>

                {item.status === 'Available' ? (
                  <button className="btn-primary" onClick={() => handleClaimFood(item)}>
                    Claim Food
                  </button>
                ) : (
                  <button className="btn-secondary" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                    <CheckCircle2 size={16} color="#2563eb" /> Claimed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
