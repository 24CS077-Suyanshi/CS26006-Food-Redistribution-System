import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  HeartHandshake, 
  User, 
  Bell, 
  Settings, 
  Clock, 
  MapPin, 
  CheckCircle2,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function NGODashboard({ donations = [], requests = [], setRequests }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'available_food', label: 'Browse Food', icon: Search },
    { id: 'my_claims', label: 'My Claims', icon: HeartHandshake },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    address: user?.address || ''
  });

  useEffect(() => {
    setProfileForm({ name: user?.name || '', address: user?.address || '' });
  }, [user?.name, user?.address]);

  const availableDonations = donations.filter(d => d.status === 'Available');
  const myClaims = requests.filter(r => r.ngo_name === user?.name);

  const filteredAvailable = availableDonations.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClaimFood = (donationId, title) => {
    if (!setRequests) return;
    const newRequest = {
      id: Date.now(),
      donation_id: donationId,
      title: title,
      ngo_name: user?.name || 'NGO User',
      status: 'Pending',
      otp_code: Math.floor(1000 + Math.random() * 9000).toString()
    };
    setRequests([newRequest, ...requests]);
    alert(`Successfully submitted claim for ${title}. Wait for approval.`);
  };

  return (
    <DashboardLayout 
      sidebarTabs={sidebarTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #0369A1 100%)',
            borderRadius: '20px',
            padding: '2.25rem 2.5rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#BAE6FD', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                NGO DASHBOARD
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.4rem' }}>
                Welcome, {user?.name || 'NGO Partner'}!
              </h2>
              <p style={{ color: '#E0F2FE', fontSize: '0.95rem' }}>
                Browse available surplus food in your area and claim it for your community.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => setActiveTab('available_food')} style={{ background: '#0EA5E9', border: 'none' }}>
                <Search size={18} /> Find Food
              </button>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                <Utensils size={24} />
              </div>
              <div>
                <div className="stat-value">{availableDonations.length}</div>
                <div className="stat-label">Available Listings</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <HeartHandshake size={24} />
              </div>
              <div>
                <div className="stat-value">{myClaims.length}</div>
                <div className="stat-label">My Active Claims</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFEDD5', color: '#C2410C' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-value">45</div>
                <div className="stat-label">Completed Pickups</div>
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
                Recently Added Food ({filteredAvailable.length})
              </h3>
              <button className="btn-secondary" onClick={() => setActiveTab('available_food')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
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
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvailable.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No available food matching your search.</td>
                    </tr>
                  ) : filteredAvailable.map(item => (
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
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                          onClick={() => handleClaimFood(item.id, item.title)}
                        >
                          Claim
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'available_food' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>Available Food to Claim</h2>
          </div>

          <div className="cards-grid">
            {filteredAvailable.map(item => (
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
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                    onClick={() => handleClaimFood(item.id, item.title)}
                  >
                    Submit Claim Request
                  </button>
                </div>
              </div>
            ))}
            {filteredAvailable.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No food available at the moment.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my_claims' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
            My Claims & Pickup Status
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myClaims.map(req => (
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
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Request ID: #{req.id}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.3rem' }}>
                    Share this OTP with Volunteer: <span style={{ letterSpacing: '0.1em', background: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>{req.otp_code}</span>
                  </div>
                </div>
                <span style={{ padding: '0.4rem 0.85rem', borderRadius: '50px', background: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.8rem' }}>
                  {req.status}
                </span>
              </div>
            ))}
            {myClaims.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>You haven't made any claims yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>NGO Profile</h2>
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
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 2500);
              }}
            >
              <div className="form-group">
                <label className="form-label">NGO Name</label>
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
                <label className="form-label">Shelter/Distribution Address</label>
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

      {activeTab === 'notifications' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Notifications</h2>
          <p style={{ color: 'var(--text-muted)' }}>You have no new notifications.</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Account Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure email preferences.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
