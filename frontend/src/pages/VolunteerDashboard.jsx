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
  Package,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function VolunteerDashboard({ requests = [], setRequests, donations = [], setDonations }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const parts = window.location.hash.replace('#', '').split('/');
    return (parts[0] === 'dashboard' && parts[1]) ? parts[1] : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Re-fetch fresh requests and donations when volunteer dashboard loads
  useEffect(() => {
    const refreshData = async () => {
      try {
        const [reqRes, donRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/requests'),
          axios.get('http://127.0.0.1:5000/api/donations')
        ]);
        if (setRequests && Array.isArray(reqRes.data)) setRequests(reqRes.data);
        if (setDonations && Array.isArray(donRes.data)) setDonations(donRes.data);
      } catch (err) {
        console.error('Error refreshing volunteer data:', err);
      }
    };
    refreshData();
  }, []);

  // 1. Pending NGO delivery requests
  const pendingRequests = requests.filter(r => 
    (!r.volunteer_id || r.volunteer_id === null || String(r.volunteer_id).trim() === '') &&
    (
      String(r.status || '').toLowerCase() === 'pending' || 
      String(r.status || '').toLowerCase() === 'requested' || 
      String(r.status || '').toLowerCase() === 'approved' ||
      String(r.status || '').toLowerCase() === 'available'
    )
  );

  // 2. Also map any available food donations so volunteer can pick them up directly
  const claimedDonationIds = new Set(requests.map(r => String(r.donation_id)));
  const unclaimedDonations = (donations || [])
    .filter(d => (d.status === 'Available' || String(d.status).toLowerCase() === 'available') && !claimedDonationIds.has(String(d.id)))
    .map(d => ({
      id: `don_${d.id}`,
      donation_id: d.id,
      title: d.title,
      donation_title: d.title,
      quantity: d.quantity,
      location: d.location,
      ngo_name: 'Hope Shelter NGO',
      status: 'Pending',
      is_direct_donation: true
    }));

  const availableTasks = [...pendingRequests, ...unclaimedDonations];

  const myTasks = requests.filter(r => 
    r.status === 'In Transit' || 
    r.status === 'Delivered' || 
    (r.volunteer_id && (String(r.volunteer_id) === String(user?.id) || r.volunteer_name === user?.name))
  );

  const filteredTasks = availableTasks.filter(t => 
    (t.title || t.donation_title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (t.ngo_name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  // 1. Accept Task with Backend API Sync
  const handleAcceptTask = async (id) => {
    const loadingToast = toast.loading('Accepting delivery task...');
    try {
      let taskId = id;
      if (String(id).startsWith('don_')) {
        const donationId = Number(String(id).replace('don_', ''));
        const createRes = await axios.post('http://127.0.0.1:5000/api/requests', {
          donation_id: donationId,
          ngo_name: 'Hope Shelter NGO',
          ngo_id: 2,
          ngo_email: 'ngo@frs.org'
        });
        taskId = createRes.data?.request?.id || donationId;
      }

      const response = await axios.put(`http://127.0.0.1:5000/api/requests/${taskId}/accept`, {
        volunteer_id: user?.id || 3,
        volunteer_name: user?.name || 'Alex Smith'
      });

      const updatedReq = response.data.request;

      if (setRequests) {
        setRequests(prev => [
          updatedReq,
          ...prev.filter(req => String(req.id) !== String(id) && String(req.id) !== String(taskId))
        ]);
      }

      if (setDonations && updatedReq?.donation_id) {
        setDonations(prev => prev.map(d => String(d.id) === String(updatedReq.donation_id) ? { ...d, status: 'Picked Up' } : d));
      }

      toast.success('Task accepted! Proceed to pickup location.', { id: loadingToast });
      handleSelectTab('my_tasks');
    } catch (error) {
      console.error('Error accepting task:', error);
      // Local fallback if server unreachable
      if (setRequests) {
        setRequests(prev => prev.map(req => String(req.id) === String(id) ? { ...req, status: 'In Transit', volunteer_name: user?.name || 'Volunteer' } : req));
      }
      toast.success('Task accepted (Local Mode)!', { id: loadingToast });
      handleSelectTab('my_tasks');
    }
  };

  // 2. Open OTP Modal
  const handleOpenOtpModal = (task) => {
    setSelectedTask(task);
    setOtpInput('');
    setOtpError('');
    setShowOtpModal(true);
  };

  // 3. Verify OTP Handshake with Backend API
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setOtpError('Please enter the 4-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    setOtpError('');
    const loadingToast = toast.loading('Verifying pickup OTP with NGO...');

    try {
      const response = await axios.post(`http://127.0.0.1:5000/api/requests/${selectedTask.id}/verify-otp`, {
        otp: otpInput.trim()
      });

      const updatedReq = response.data.request;

      if (setRequests) {
        setRequests(prev => prev.map(req => String(req.id) === String(selectedTask.id) ? { ...req, ...updatedReq, status: 'Delivered' } : req));
      }

      if (setDonations && response.data.donation_id) {
        setDonations(prev => prev.map(d => String(d.id) === String(response.data.donation_id) ? { ...d, status: 'Delivered' } : d));
      }

      toast.success('🎉 Handshake Verified! Food marked as Delivered.', { id: loadingToast });
      setShowOtpModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('OTP Error:', error);
      const errMsg = error.response?.data?.error || 'Invalid OTP code. Please ask the NGO for their 4-digit code.';
      setOtpError(errMsg);
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setIsVerifying(false);
    }
  };


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
              <button className="btn-primary" onClick={() => handleSelectTab('available_tasks')} style={{ background: '#8B5CF6', border: 'none' }}>
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
                New Pickup Requests
              </h3>
              <button className="btn-secondary" onClick={() => handleSelectTab('available_tasks')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
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
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{item.title || item.donation_title}</td>
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
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title || req.donation_title}</h4>
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
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title || req.donation_title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Deliver to: <strong>{req.ngo_name}</strong> • Batch <strong style={{ color: '#7C3AED' }}>#{req.id}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.3rem' }}>Status: {req.status}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '50px', 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      background: req.status === 'Delivered' ? '#DCFCE7' : '#DBEAFE', 
                      color: req.status === 'Delivered' ? '#15803D' : '#1D4ED8' 
                    }}>
                      {req.status}
                    </span>
                  </div>
                </div>
                {req.status === 'In Transit' && (
                  <button 
                    className="btn-primary" 
                    style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
                    onClick={() => handleOpenOtpModal(req)}
                  >
                    <KeyRound size={16} /> Verify OTP & Deliver
                  </button>
                )}
                {req.status === 'Delivered' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803D', fontWeight: 800, fontSize: '0.85rem', background: '#DCFCE7', padding: '0.4rem 0.85rem', borderRadius: '50px' }}>
                    <CheckCircle2 size={16} /> Delivered
                  </span>
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

      {/* 🔐 Secure OTP Handshake Modal */}
      {showOtpModal && selectedTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '2.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => { setShowOtpModal(false); setSelectedTask(null); }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#ECFDF5',
                color: '#059669',
                display: 'grid',
                placeItems: 'center'
              }}>
                <KeyRound size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Secure OTP Handshake
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Verify handover with NGO
                </p>
              </div>
            </div>

            {/* Task Info Summary */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Food Item:</span>
                <strong style={{ color: '#0F172A' }}>{selectedTask.title || selectedTask.donation_title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Deliver To:</span>
                <strong style={{ color: '#0F172A' }}>{selectedTask.ngo_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Batch ID:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>#{selectedTask.id}</span>
              </div>
            </div>

            {/* Instruction Notice */}
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={22} style={{ flexShrink: 0, color: '#2563EB' }} />
              <div>
                <span>Please ask the recipient NGO for their <strong>4-digit secure handover OTP</strong> to verify physical delivery.</span>
                <span style={{ display: 'block', marginTop: '0.25rem', color: '#64748B', fontSize: '0.78rem' }}>
                  (The recipient NGO receives this private code on their dashboard & email).
                </span>
              </div>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textAlign: 'center' }}>
                  ENTER 4-DIGIT OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • •"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError('');
                  }}
                  style={{
                    width: '100%',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    letterSpacing: '0.35em',
                    textAlign: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '14px',
                    border: otpError ? '2px solid #EF4444' : '2px solid #CBD5E1',
                    outline: 'none',
                    background: '#FFFFFF',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  autoFocus
                />
                {otpError && (
                  <p style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertCircle size={14} /> {otpError}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                  onClick={() => { setShowOtpModal(false); setSelectedTask(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isVerifying || !otpInput.trim()}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    background: '#10B981',
                    border: 'none',
                    justifyContent: 'center',
                    opacity: isVerifying || !otpInput.trim() ? 0.6 : 1
                  }}
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Deliver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
