import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Truck, 
  User, 
  Bell, 
  Settings, 
  MapPin, 
  CheckCircle2,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function VolunteerDashboard({ requests = [], setRequests }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'available_tasks', label: 'Available Pickups', icon: Search },
    { id: 'my_tasks', label: 'My Tasks', icon: Truck },
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

  // For demo, "Pending" requests are available to volunteers
  const availableTasks = requests.filter(r => r.status === 'Pending');
  const myTasks = requests.filter(r => r.status === 'In Transit' || r.status === 'Delivered');

  const filteredTasks = availableTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ngo_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptTask = (id) => {
    if (!setRequests) return;
    const updatedRequests = requests.map(req => {
      if (req.id === id) {
        return { ...req, status: 'In Transit' };
      }
      return req;
    });
    setRequests(updatedRequests);
    alert('Task accepted! Please proceed to pickup.');
  };

  const handleMarkDelivered = (id) => {
    if (!setRequests) return;
    const updatedRequests = requests.map(req => {
      if (req.id === id) {
        return { ...req, status: 'Delivered' };
      }
      return req;
    });
    setRequests(updatedRequests);
    alert('Delivery marked as complete!');
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
            background: 'linear-gradient(135deg, #2E1065 0%, #7C3AED 100%)',
            borderRadius: '20px',
            padding: '2.25rem 2.5rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#DDD6FE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                VOLUNTEER DASHBOARD
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.4rem' }}>
                Welcome back, {user?.name || 'Volunteer'}!
              </h2>
              <p style={{ color: '#EDE9FE', fontSize: '0.95rem' }}>
                Ready to make a difference? Find food pickups near you and help deliver them to NGOs.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => setActiveTab('available_tasks')} style={{ background: '#8B5CF6', border: 'none' }}>
                <Truck size={18} /> Find Pickups
              </button>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <Package size={24} />
              </div>
              <div>
                <div className="stat-value">{availableTasks.length}</div>
                <div className="stat-label">Available Pickups</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                <Truck size={24} />
              </div>
              <div>
                <div className="stat-value">{myTasks.filter(t => t.status === 'In Transit').length}</div>
                <div className="stat-label">Active Tasks</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-value">{myTasks.filter(t => t.status === 'Delivered').length}</div>
                <div className="stat-label">Completed Deliveries</div>
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
                New Pickup Requests ({filteredTasks.length})
              </h3>
              <button className="btn-secondary" onClick={() => setActiveTab('available_tasks')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                View All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Food Description</th>
                    <th style={{ padding: '0.75rem' }}>Target NGO</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No available tasks.</td>
                    </tr>
                  ) : filteredTasks.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{item.title}</td>
                      <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{item.ngo_name}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', background: '#FEF3C7', color: '#B45309' }}>
                          Ready for Pickup
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: '#8B5CF6' }}
                          onClick={() => handleAcceptTask(item.id)}
                        >
                          Accept
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

      {activeTab === 'available_tasks' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Available Pickups</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTasks.map(req => (
              <div key={req.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Deliver to: <strong>{req.ngo_name}</strong></p>
                </div>
                <button className="btn-primary" style={{ background: '#8B5CF6' }} onClick={() => handleAcceptTask(req.id)}>Accept Task</button>
              </div>
            ))}
            {filteredTasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No available tasks matching your search.</p>}
          </div>
        </div>
      )}

      {activeTab === 'my_tasks' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>My Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myTasks.map(req => (
              <div key={req.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Deliver to: <strong>{req.ngo_name}</strong></p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.3rem' }}>Status: {req.status}</p>
                </div>
                {req.status === 'In Transit' && (
                  <button className="btn-primary" onClick={() => handleMarkDelivered(req.id)}>Mark Delivered</button>
                )}
              </div>
            ))}
            {myTasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You don't have any active or completed tasks.</p>}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Volunteer Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h3>
              <span className="tag-badge tag-veg" style={{ marginTop: '0.5rem', display: 'inline-block', background: '#EDE9FE', color: '#6D28D9' }}>{user?.role?.toUpperCase()}</span>
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
                <label className="form-label">Full Name</label>
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
                <label className="form-label">Vehicle Info</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Honda City (GJ-01-AB-1234)"
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure email preferences.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
