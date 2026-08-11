import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  HeartHandshake, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Sparkles,
  PieChart,
  Calendar,
  AlertCircle,
  ImagePlus,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ donations = [], setDonations, requests = [], setRequests }) {
  const { user, logout, updateUser } = useAuth();
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

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

  // Controlled profile form — stays in sync with user context
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    address: user?.address || ''
  });

  // Keep form in sync if user changes (e.g. after login)
  React.useEffect(() => {
    setProfileForm({ name: user?.name || '', address: user?.address || '' });
  }, [user?.name, user?.address]);

  // Form State for Add Donation
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

    if (setDonations) setDonations([newDonation, ...donations]);
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

  // Filter donations based on search query
  const filteredDonations = donations.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: '1.75rem',
      minHeight: '82vh'
    }}>
      
      {/* --- LEFT SIDEBAR --- */}
      <aside style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid var(--border-subtle)',
        padding: '1.5rem 1rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MAIN MENU
            </span>
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'donations', label: 'Donations', icon: Utensils },
            { id: 'requests', label: 'Requests', icon: HeartHandshake },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const active = activeSidebarTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarTab(item.id)}
                style={{
                  border: 'none',
                  background: active ? '#F0FDF4' : 'transparent',
                  color: active ? 'var(--primary-dark)' : 'var(--text-muted)',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.9rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'var(--transition)',
                  borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent'
                }}
              >
                <Icon size={18} color={active ? 'var(--primary)' : 'var(--text-muted)'} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <button
          onClick={logout}
          style={{
            border: '1px solid #FEE2E2',
            background: '#FEF2F2',
            color: '#EF4444',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'var(--transition)'
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* --- RIGHT MAIN AREA --- */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* TOP NAVIGATION BAR */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '0.9rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '360px' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '4rem', fontSize: '0.88rem' }}
              placeholder="Search donations, NGOs, or pickup locations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#F1F5F9',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              color: 'var(--text-muted)'
            }}>
              Ctrl K
            </span>
          </div>

          {/* Top Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveSidebarTab('notifications')}>
              <Bell size={20} color="var(--text-muted)" />
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#EF4444',
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                2
              </span>
            </div>

            <div className="user-profile-badge" onClick={() => setActiveSidebarTab('profile')} style={{ cursor: 'pointer' }}>
              <div className="avatar">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div>
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role?.toUpperCase() || 'DONOR'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- DASHBOARD TAB CONTENT --- */}
        {activeSidebarTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* WELCOME CARD BANNER */}
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
                  OVERVIEW DASHBOARD
                </span>
                <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.4rem' }}>
                  Welcome back, {user?.name || 'Partner'}!
                </h2>
                <p style={{ color: '#DCFCE7', fontSize: '0.95rem' }}>
                  Let's help reduce food waste today. Review active food listings and pending requests below.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  <PlusCircle size={18} /> Add Donation
                </button>
              </div>
            </div>

            {/* DASHBOARD STAT METRICS (4 CARDS) */}
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                  <Utensils size={24} />
                </div>
                <div>
                  <div className="stat-value">142</div>
                  <div className="stat-label">Total Donations</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                  <HeartHandshake size={24} />
                </div>
                <div>
                  <div className="stat-value">18</div>
                  <div className="stat-label">Active Requests</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#FFEDD5', color: '#C2410C' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="stat-value">3,850</div>
                  <div className="stat-label">Meals Shared</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#F3E8FF', color: '#6D28D9' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="stat-value">8</div>
                  <div className="stat-label">Nearby Requests</div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '1.25rem 1.5rem',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                ⚡ Quick Actions
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}>
                  <PlusCircle size={16} /> Add Donation
                </button>
                <button className="btn-secondary" onClick={() => setActiveSidebarTab('requests')} style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}>
                  <HeartHandshake size={16} /> View Requests
                </button>
                <button className="btn-secondary" onClick={() => setActiveSidebarTab('profile')} style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}>
                  <User size={16} /> My Profile
                </button>
              </div>
            </div>

            {/* ANALYTICS & RECENT ACTIVITY GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
              
              {/* ANALYTICS CHART CARD */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                      Weekly Food Redistribution Activity
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Surplus meals saved & transferred per day</span>
                  </div>
                  <span style={{ background: '#F0FDF4', color: '#15803D', padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                    +24% this week
                  </span>
                </div>

                {/* Interactive SVG Bar Chart Visual */}
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1.2rem', padding: '1rem 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  {[
                    { day: 'Mon', count: 45, height: '55%' },
                    { day: 'Tue', count: 62, height: '75%' },
                    { day: 'Wed', count: 38, height: '45%' },
                    { day: 'Thu', count: 85, height: '95%' },
                    { day: 'Fri', count: 52, height: '65%' },
                    { day: 'Sat', count: 78, height: '88%' },
                    { day: 'Sun', count: 90, height: '100%' }
                  ].map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{bar.count}</span>
                      <div style={{
                        width: '100%',
                        height: bar.height,
                        background: i === 6 ? 'linear-gradient(to top, #16A34A, #22C55E)' : '#E2E8F0',
                        borderRadius: '8px 8px 0 0',
                        transition: 'var(--transition)'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT ACTIVITY TIMELINE CARD */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
                  Recent Activity Log
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { title: 'Surplus Buffet Posted', desc: '45 Portions by Grand Hyatt', time: '10 mins ago', color: '#22C55E' },
                    { title: 'Pickup Claim Accepted', desc: 'Hope Shelter NGO accepted #103', time: '45 mins ago', color: '#0EA5E9' },
                    { title: 'Volunteer Delivery Completed', desc: 'Alex Smith delivered 25kg bread', time: '2 hours ago', color: '#8B5CF6' },
                    { title: 'AI Freshness Alert Flagged', desc: 'Listing #101 safe window < 3 hours', time: '4 hours ago', color: '#F97316' }
                  ].map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: act.color, marginTop: '0.35rem', flexShrink: 0 }}></div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>{act.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{act.desc}</div>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '0.15rem' }}>{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RECENT DONATIONS TABLE VIEW */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Active Food Donations ({filteredDonations.length})
                </h3>
                <button className="btn-secondary" onClick={() => setActiveSidebarTab('donations')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
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
                    {filteredDonations.map(item => (
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

        {/* --- DONATIONS TAB --- */}
        {activeSidebarTab === 'donations' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>All Surplus Food Listings</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <PlusCircle size={18} /> Post New Food Listing
              </button>
            </div>

            <div className="cards-grid">
              {donations.map(item => (
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
            </div>
          </div>
        )}

        {/* --- REQUESTS TAB --- */}
        {activeSidebarTab === 'requests' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
              NGO Claims & Volunteer Pickup Requests
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map(req => (
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
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title}</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Requested by <strong>{req.ngo_name}</strong></p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.3rem' }}>
                      Verification OTP: <span style={{ letterSpacing: '0.1em', background: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>{req.otp_code}</span>
                    </div>
                  </div>
                  <span style={{ padding: '0.4rem 0.85rem', borderRadius: '50px', background: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.8rem' }}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeSidebarTab === 'profile' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>User Profile & Organization Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              {/* Left avatar card — always shows the SAVED name from user context */}
              <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h3>
                <span className="tag-badge tag-veg" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user?.role?.toUpperCase()}</span>
              </div>

              {/* Right form — controlled inputs */}
              <form
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                onSubmit={e => {
                  e.preventDefault();
                  updateUser({ name: profileForm.name.trim(), address: profileForm.address.trim() });
                  setProfileSaved(true);
                  setTimeout(() => setProfileSaved(false), 2500);
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
                  {profileSaved && (
                    <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      ✓ Profile updated successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- NOTIFICATIONS TAB --- */}
        {activeSidebarTab === 'notifications' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Notification Center</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', background: '#F0FDF4', borderLeft: '4px solid #22C55E' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-dark)' }}>Food Claim Accepted</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hope Shelter NGO accepted "Surplus Banquet Meals"</span>
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', background: '#F8FAFC', borderLeft: '4px solid #CBD5E1' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-dark)' }}>Volunteer Assigned</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Volunteer Alex Smith assigned to pickup task #201</span>
              </div>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeSidebarTab === 'settings' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Account & System Settings</h2>
            <p style={{ color: 'var(--text-muted)' }}>Configure email preferences, notification alerts, and API key settings.</p>
          </div>
        )}

      </main>

      {/* POST FOOD MODAL WITH AI PREDICTOR */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Post Food Listing & AI Check</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateDonation} className="modal-body">

              {/* ── IMAGE UPLOAD ── */}
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
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#bbf7d0'}
                  >
                    <ImagePlus size={28} color="#22c55e" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>Click to upload a food photo</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>JPG, PNG, WebP • Max 5MB</p>
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
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

    </div>
  );
}
