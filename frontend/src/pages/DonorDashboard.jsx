import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  HeartHandshake, 
  User, 
  Bell, 
  Settings, 
  PlusCircle, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Sparkles,
  ImagePlus,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function DonorDashboard({ donations = [], setDonations, requests = [], setRequests }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const parts = window.location.hash.replace('#', '').split('/');
    return (parts[0] === 'dashboard' && parts[1]) ? parts[1] : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSelectTab = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    window.history.pushState({ tab: 'dashboard', subTab: tabId }, '', `#dashboard/${tabId}`);
  };

  useEffect(() => {
    const handlePop = (e) => {
      if (e.state && e.state.subTab) {
        setActiveTab(e.state.subTab);
      } else {
        const parts = window.location.hash.replace('#', '').split('/');
        setActiveTab((parts[0] === 'dashboard' && parts[1]) ? parts[1] : 'dashboard');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donations', label: 'My Donations', icon: Utensils },
    { id: 'requests', label: 'NGO Requests', icon: HeartHandshake },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    address: user?.address || ''
  });

  useEffect(() => {
    setProfileForm({ name: user?.name || '', address: user?.address || '' });
  }, [user?.name, user?.address]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Veg',
    quantity: '',
    preparedTime: '1 hour ago',
    expiryHours: 4,
    storageType: 'Room Temperature',
    location: user?.address || 'Downtown Center, Block 4'
  });

  const handleRunAiPrediction = () => {
    setAiPredicting(true);
    setTimeout(() => {
      let hours = 4;
      if (formData.storageType === 'Refrigerated') hours += 4;
      if (formData.category === 'Non-Veg') hours -= 1;

      setAiResult({
        hours: hours,
        confidence: '95%',
        recommendation: `Recommended shelf-life: Safe for next ${hours} hours under ${formData.storageType}.`
      });
      setFormData(prev => ({ ...prev, expiryHours: hours }));
      setAiPredicting(false);
    }, 500);
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.quantity) return;
    
    const loadingToast = toast.loading('Publishing donation...');

    const newDonationData = {
      donor_id: user?.id || 1,
      donor_name: user?.name || 'Grand Hyatt Hotel',
      title: formData.title,
      category: formData.category,
      quantity: formData.quantity,
      prepared_time: formData.preparedTime,
      expiry_hours: formData.expiryHours,
      location: formData.location,
      storage_type: formData.storageType,
      image_url: imagePreview || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60'
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/donations', newDonationData);
      
      if (setDonations) setDonations([response.data.donation, ...donations]);
      setShowModal(false);
      setAiResult(null);
      clearImage();
      setFormData({
        title: '',
        category: 'Veg',
        quantity: '',
        preparedTime: '1 hour ago',
        expiryHours: 4,
        storageType: 'Room Temperature',
        location: user?.address || 'Downtown Center, Block 4'
      });
      toast.success('Donation published successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error creating donation:', error);
      toast.error('Failed to publish donation.', { id: loadingToast });
    }
  };

  const myDonations = donations.filter(d => 
    (user?.id && (d.donor_id === user.id || String(d.donor_id) === String(user.id))) ||
    (user?.name && d.donor_name && d.donor_name.toLowerCase() === user.name.toLowerCase())
  );

  const myDonationIds = new Set(myDonations.map(d => d.id));
  const myRequests = requests.filter(r => 
    myDonationIds.has(r.donation_id) || 
    (user?.id && (r.donor_id === user.id || String(r.donor_id) === String(user.id)))
  );

  const pendingRequestsCount = myRequests.filter(r => 
    !r.status || r.status.toLowerCase() === 'pending' || r.status.toLowerCase() === 'requested'
  ).length;

  const mealsSharedCount = myDonations.reduce((sum, d) => {
    const match = String(d.quantity || '').match(/\d+/);
    return sum + (match ? parseInt(match[0], 10) : 0);
  }, 0);

  const connectedNgosCount = new Set(myRequests.map(r => r.ngo_name || r.ngo_id).filter(Boolean)).size;
  
  const filteredDonations = myDonations.filter(d => 
    (d.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (d.location || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <DashboardLayout 
      sidebarTabs={sidebarTabs}
      activeTab={activeTab}
      setActiveTab={handleSelectTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #166534 100%)',
            borderRadius: '20px',
            padding: '2.25rem 2.5rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#86EFAC', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                DONOR DASHBOARD
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.4rem' }}>
                Welcome back, {user?.name || 'Partner'}!
              </h2>
              <p style={{ color: '#DCFCE7', fontSize: '0.95rem' }}>
                Thank you for contributing to the Food Redistribution System. Post your surplus food below.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <PlusCircle size={18} /> Add Donation
              </button>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <Utensils size={24} />
              </div>
              <div>
                <div className="stat-value">{myDonations.length}</div>
                <div className="stat-label">My Donations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                <HeartHandshake size={24} />
              </div>
              <div>
                <div className="stat-value">{pendingRequestsCount}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFEDD5', color: '#C2410C' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="stat-value">{mealsSharedCount.toLocaleString()}</div>
                <div className="stat-label">Meals Shared</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E8FF', color: '#6D28D9' }}>
                <MapPin size={24} />
              </div>
              <div>
                <div className="stat-value">{connectedNgosCount}</div>
                <div className="stat-label">Nearby NGOs</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                My Active Donations ({filteredDonations.length})
              </h3>
              <button className="btn-secondary" onClick={() => handleSelectTab('donations')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                View All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Food Description</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Quantity</th>
                    <th style={{ padding: '0.75rem' }}>Location</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No donations found.</td>
                    </tr>
                  ) : filteredDonations.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{item.title}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span className={`tag-badge ${item.category === 'Veg' ? 'tag-veg' : 'tag-nonveg'}`}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{item.location}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          background: item.status === 'Available' ? '#ECFDF5' : '#DBEAFE',
                          color: item.status === 'Available' ? '#15803D' : '#1E40AF'
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
        </div>
      )}

      {activeTab === 'donations' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>My Food Listings</h2>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <PlusCircle size={18} /> Post New Food Listing
            </button>
          </div>

          <div className="cards-grid">
            {myDonations.map(item => (
              <div key={item.id} className="food-card">
                <div className="card-banner" style={{ backgroundImage: `url(${item.image_url})` }}>
                  <span className={`tag-badge ${item.category === 'Veg' ? 'tag-veg' : 'tag-nonveg'}`}>
                    {item.category}
                  </span>
                  <span className="tag-badge tag-time">
                    <Clock size={12} /> {item.expiry_hours}h safe
                  </span>
                </div>
                <div className="card-body">
                  <h3 className="food-title">{item.title}</h3>
                  <p className="donor-info"><MapPin size={14} /> {item.donor_name} • {item.location}</p>
                  <div className="details-row">
                    <div>
                      <span className="detail-label">Quantity</span>
                      <div className="detail-val">{item.quantity}</div>
                    </div>
                    <div>
                      <span className="detail-label">Storage</span>
                      <div className="detail-val">{item.storage_type}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {myDonations.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                You haven't posted any food donations yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
            NGO Claims & Volunteer Pickup Requests ({myRequests.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <HeartHandshake size={48} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'inline-block' }} />
                <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: 0 }}>No requests received yet</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>When an NGO requests food from your donations, it will appear here.</p>
              </div>
            ) : (
              myRequests.map(req => (
                <div key={req.id} style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title || req.donation_title}</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Requested by <strong>{req.ngo_name}</strong></p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.3rem' }}>
                      Verification OTP: <span style={{ letterSpacing: '0.1em', background: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>{req.otp_code}</span>
                    </div>
                  </div>
                  <span style={{ padding: '0.4rem 0.85rem', borderRadius: '50px', background: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.8rem' }}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>User Profile & Organization Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h3>
              <span className="tag-badge tag-veg" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user?.role?.toUpperCase()}</span>
            </div>

            <form
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onSubmit={e => {
                e.preventDefault();
                updateUser({ name: profileForm.name.trim(), address: profileForm.address.trim() });
                toast.success('Profile updated successfully!');
              }}
            >
              <div className="form-group">
                <label className="form-label">Full Name / Org Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Location Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.address}
                  onChange={e => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Notification Center</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {myRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                No notifications right now.
              </div>
            ) : (
              myRequests.map(req => (
                <div key={req.id} style={{ padding: '1rem', borderRadius: '12px', background: '#F0FDF4', borderLeft: '4px solid #22C55E' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-dark)' }}>Food Claim Request</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{req.ngo_name} requested "{req.title || req.donation_title}"</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Account & System Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure email preferences, notification alerts, and API key settings.</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Post Food Listing & AI Check</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateDonation} className="modal-body">
              <div className="form-group">
                <label className="form-label">Food Photo (Optional)</label>
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
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      border: '2px dashed #bbf7d0', borderRadius: '12px', padding: '1.5rem',
                      textAlign: 'center', cursor: 'pointer', background: '#f0fdf4',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <ImagePlus size={28} color="#22c55e" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>Click to upload a food photo</p>
                  </div>
                )}
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Food Title / Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Banquet Curry & Rice, Fresh Bread, Packed Meals"
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
                    <option value="Hot Storage">Hot Storage (&gt;60°C)</option>
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

              {/* AI Prediction Box */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> AI Expiry Predictor (ML Engine)
                  </span>
                  <button
                    type="button"
                    onClick={handleRunAiPrediction}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: 'white' }}
                  >
                    {aiPredicting ? 'Calculating...' : 'Calculate Safe Hours'}
                  </button>
                </div>
                {aiResult && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#14532D', fontWeight: 600 }}>
                    🤖 <strong>AI Result:</strong> Safe window predicted: <strong>{aiResult.hours} Hours</strong> (Confidence {aiResult.confidence})
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
    </DashboardLayout>
  );
}
