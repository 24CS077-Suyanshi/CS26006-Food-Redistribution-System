import React, { useState, useRef } from 'react';
import { PlusCircle, Utensils, Clock, MapPin, CheckCircle2, ShieldAlert, Cpu, Sparkles, Building2, User, ImagePlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DonorDashboard({ donations, setDonations, requests, setRequests }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Veg',
    quantity: '',
    preparedTime: '1 hour ago',
    expiryHours: 4,
    storageType: 'Room Temperature',
    location: user?.address || 'Downtown Center, Block 4'
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleRunAiPrediction = () => {
    setAiPredicting(true);
    setTimeout(() => {
      let hours = 4;
      if (formData.storageType === 'Refrigerated') hours += 4;
      if (formData.category === 'Non-Veg') hours -= 1;

      setAiResult({
        hours: hours,
        confidence: '94%',
        recommendation: `Recommended shelf-life: Safe for next ${hours} hours under ${formData.storageType}.`
      });
      setFormData(prev => ({ ...prev, expiryHours: hours }));
      setAiPredicting(false);
    }, 600);
  };

  const handleCreateDonation = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.quantity) return;

    const newDonation = {
      id: Date.now(),
      donor_id: user?.id || 1,
      donor_name: user?.name || 'Grand Hyatt Hotel',
      title: formData.title,
      category: formData.category,
      quantity: formData.quantity,
      prepared_time: formData.preparedTime,
      expiry_hours: formData.expiryHours,
      location: formData.location,
      storage_type: formData.storageType,
      status: 'Available',
      image_url: imagePreview || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60'
    };

    setDonations([newDonation, ...donations]);
    setShowModal(false);
    setAiResult(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setFormData({
      title: '',
      category: 'Veg',
      quantity: '',
      preparedTime: '1 hour ago',
      expiryHours: 4,
      storageType: 'Room Temperature',
      location: user?.address || 'Downtown Center, Block 4'
    });
  };

  const myDonations = donations.filter(d => d.donor_id === (user?.id || 1) || true);

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DONOR PORTAL
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Welcome, {user?.name || 'Grand Hyatt Hotel'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            List surplus food, run AI shelf-life checks, and manage NGO pickup requests.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
          <PlusCircle size={20} /> Post Surplus Food
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon"><Utensils size={24} /></div>
          <div>
            <div className="stat-value">{myDonations.length}</div>
            <div className="stat-label">Active Listings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}><CheckCircle2 size={24} /></div>
          <div>
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">NGO Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}><Building2 size={24} /></div>
          <div>
            <div className="stat-value">1,450</div>
            <div className="stat-label">Meals Provided</div>
          </div>
        </div>
      </div>

      {/* Section: My Active Listings Table */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border-light)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--secondary)' }}>
          My Surplus Food Listings
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Food Item</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Quantity</th>
                <th style={{ padding: '0.75rem' }}>AI Safe Window</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myDonations.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem', fontWeight: 700 }}>{item.title}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`tag-badge ${item.category === 'Veg' ? 'tag-veg' : 'tag-nonveg'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ padding: '0.85rem', color: '#059669', fontWeight: 700 }}>
                    In {item.expiry_hours || 4} hours
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: item.status === 'Available' ? '#ecfdf5' : '#dbeafe',
                      color: item.status === 'Available' ? '#047857' : '#1e40af'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Food Modal with AI Predictor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Post Food & Run AI Freshness Check</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateDonation} className="modal-body">

              {/* ── IMAGE UPLOAD ── */}
              <div className="form-group">
                <label className="form-label">Food Photo (Optional)</label>

                {/* Preview */}
                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block', borderRadius: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                        borderRadius: '50%', width: '28px', height: '28px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  /* Upload zone */
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      border: '2px dashed #bbf7d0', borderRadius: '12px', padding: '1.5rem',
                      textAlign: 'center', cursor: 'pointer', background: '#f0fdf4',
                      transition: 'border-color 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#bbf7d0'}
                  >
                    <ImagePlus size={28} color="#22c55e" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>Click to upload a food photo</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>JPG, PNG, WebP • Max 5MB</p>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Food Description / Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Banquet Curry & Rice, Pastries, Packed Meals"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Veg">Vegetarian 🥗</option>
                    <option value="Non-Veg">Non-Vegetarian 🍗</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity / Portions *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 45 Portions or 15 kg"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Storage Condition</label>
                  <select
                    className="form-select"
                    value={formData.storageType}
                    onChange={e => setFormData({ ...formData, storageType: e.target.value })}
                  >
                    <option value="Room Temperature">Room Temperature (25°C)</option>
                    <option value="Refrigerated">Refrigerated (0-4°C)</option>
                    <option value="Hot Storage">Hot Storage (&gt60°C)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preparation Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.preparedTime}
                    onChange={e => setFormData({ ...formData, preparedTime: e.target.value })}
                  />
                </div>
              </div>

              {/* AI Prediction Widget Box */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> AI Expiry Predictor (SIH25060)
                  </span>
                  <button
                    type="button"
                    onClick={handleRunAiPrediction}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: 'white' }}
                  >
                    {aiPredicting ? 'Analyzing ML Model...' : 'Calculate Safe Hours'}
                  </button>
                </div>

                {aiResult && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#14532d', fontWeight: 600 }}>
                    🤖 <strong>AI Output:</strong> Safe window predicted: <strong>{aiResult.hours} Hours</strong> (Confidence {aiResult.confidence})
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Location *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Donation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
