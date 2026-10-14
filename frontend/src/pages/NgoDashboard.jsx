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
  Utensils,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function NGODashboard({ donations = [], setDonations, requests = [], setRequests }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const parts = window.location.hash.replace('#', '').split('/');
    return (parts[0] === 'dashboard' && parts[1]) ? parts[1] : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
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

  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'available_food', label: 'Browse Food', icon: Search },
    { id: 'my_claims', label: 'My Claims', icon: HeartHandshake },
    { id: 'feedback', label: 'Feedback & Ratings', icon: Star },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    address: user?.address || ''
  });

  // Feedback State
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackClaim, setFeedbackClaim] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/feedback')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setFeedbackList(res.data);
          const map = {};
          res.data.forEach(item => {
            if (item.donation_id) {
              map[item.donation_id] = item;
            }
          });
          setSubmittedFeedbacks(map);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenFeedback = (claim) => {
    setFeedbackClaim(claim);
    setFeedbackRating(5);
    setFeedbackComment('');
    setFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackClaim) return;

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/feedback', {
        donation_id: feedbackClaim.donation_id,
        from_user_id: user?.id || 2,
        user_name: user?.name || 'Hope Shelter NGO',
        rating: feedbackRating,
        comment: feedbackComment.trim() || 'Food was delivered in good condition.'
      });

      const newFb = res.data?.feedback || { 
        donation_id: feedbackClaim.donation_id,
        donation_title: feedbackClaim.title,
        from_user_id: user?.id || 2,
        from_user_name: user?.name || 'Hope Shelter NGO',
        rating: feedbackRating, 
        comment: feedbackComment.trim() || 'Food was delivered in good condition.',
        created_at: new Date().toISOString()
      };
      setSubmittedFeedbacks(prev => ({
        ...prev,
        [feedbackClaim.donation_id]: newFb,
        [feedbackClaim.id]: newFb
      }));
      setFeedbackList(prev => [newFb, ...prev.filter(f => f.donation_id !== feedbackClaim.donation_id)]);
      toast.success('Thank you! Rating and feedback saved to database.');
      setFeedbackModal(false);
    } catch (err) {
      toast.error('Failed to save feedback.');
    }
  };

  useEffect(() => {
    setProfileForm({ name: user?.name || '', address: user?.address || '' });
  }, [user?.name, user?.address]);

  const availableDonations = donations.filter(d => d.status === 'Available');
  const myClaims = requests.filter(r => 
    (user?.id && (r.ngo_id === user.id || String(r.ngo_id) === String(user.id))) ||
    (user?.name && r.ngo_name && r.ngo_name.toLowerCase() === user.name.toLowerCase())
  );

  const activeClaimsCount = myClaims.filter(r => r.status !== 'Completed' && r.status !== 'Delivered').length;
  const completedPickupsCount = myClaims.filter(r => r.status === 'Completed' || r.status === 'Delivered').length;
  const mealsReceivedCount = myClaims.reduce((sum, r) => {
    const don = donations.find(d => d.id === r.donation_id);
    const match = String(don?.quantity || r.quantity || '').match(/\d+/);
    return sum + (match ? parseInt(match[0], 10) : 0);
  }, 0);

  const filteredAvailable = availableDonations.filter(d => 
    (d.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (d.location || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleClaimFood = async (donationId, title) => {
    if (!setRequests) return;
    
    // Optimistic UI update or loading toast
    const loadingToast = toast.loading(`Submitting claim for ${title}...`);
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/requests', {
        donation_id: donationId,
        ngo_name: user?.name || 'NGO User',
        ngo_id: user?.id || 2,
        ngo_email: user?.email || 'ngo@frs.org'
      });
      
      const newRequest = response.data.request;
      
      setRequests(prev => [newRequest, ...prev]);
      if (setDonations) {
        setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'Requested' } : d));
      }
      toast.success(`Claim submitted! Pickup OTP sent to ${user?.email || 'your email'}.`, { id: loadingToast });
    } catch (error) {
      console.error('Error claiming food:', error);
      toast.error(`Failed to claim ${title}. Please try again.`, { id: loadingToast });
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
              <button className="btn-primary" onClick={() => handleSelectTab('available_food')} style={{ background: '#0EA5E9', border: 'none' }}>
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
                <div className="stat-value">{activeClaimsCount}</div>
                <div className="stat-label">My Active Claims</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFEDD5', color: '#C2410C' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-value">{completedPickupsCount}</div>
                <div className="stat-label">Completed Pickups</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E8FF', color: '#6D28D9' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-value">{mealsReceivedCount.toLocaleString()}</div>
                <div className="stat-label">Meals Received</div>
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
                Recently Added Food
              </h3>
              <button className="btn-secondary" onClick={() => handleSelectTab('available_food')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
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
            {myClaims.map(req => {
              const fb = submittedFeedbacks[req.donation_id] || submittedFeedbacks[req.id];
              return (
              <div key={req.id} style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{req.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Batch ID: <strong style={{ color: '#0F172A' }}>#{req.id}</strong></span>
                    <span>•</span>
                    <span>
                      🚚 Volunteer: <strong style={{ color: req.volunteer_name ? '#059669' : '#D97706' }}>
                        {req.volunteer_name || 'Assigning volunteer...'}
                      </strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.4rem' }}>
                    Share this OTP with Volunteer: <span style={{ letterSpacing: '0.1em', background: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>{req.otp_code}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                      ✉️ Sent to email: <strong>{req.ngo_email || user?.email}</strong>
                    </span>
                  </div>
                  {fb && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        ⭐ Rated {fb.rating || fb}/5 Stars
                      </span>
                      {fb.comment && <span style={{ color: '#64748B', fontWeight: 400 }}>— "{fb.comment}"</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.4rem 0.85rem', 
                    borderRadius: '50px', 
                    background: req.status === 'Delivered' ? '#DCFCE7' : req.status === 'In Transit' ? '#DBEAFE' : '#FEF3C7', 
                    color: req.status === 'Delivered' ? '#15803D' : req.status === 'In Transit' ? '#1D4ED8' : '#B45309', 
                    fontWeight: 800, 
                    fontSize: '0.8rem' 
                  }}>
                    {req.status}
                  </span>
                  {(req.status === 'Delivered' || req.status === 'Completed') && (
                    <button
                      onClick={() => handleOpenFeedback(req)}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', background: fb ? '#059669' : '#F59E0B', borderColor: fb ? '#059669' : '#F59E0B' }}
                    >
                      ⭐ {fb ? 'Edit Rating' : 'Rate Delivery'}
                    </button>
                  )}
                </div>
              </div>
            );})}
            {myClaims.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>You haven't made any claims yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Star size={24} color="#F59E0B" fill="#F59E0B" />
                Feedback & Ratings
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                Rate your received food batches and share comments with donors to help maintain food safety and trust.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.6rem 1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B45309' }}>
                  {Object.keys(submittedFeedbacks).length}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#78350F' }}>Feedbacks Given</div>
              </div>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.6rem 1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                  {completedPickupsCount}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065F46' }}>Deliveries Completed</div>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1rem' }}>
            Your Claimed Batches & Reviews
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myClaims.map(req => {
              const fb = submittedFeedbacks[req.donation_id] || submittedFeedbacks[req.id];
              const isFinished = req.status === 'Delivered' || req.status === 'Completed';
              return (
                <div key={req.id} style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-dark)' }}>{req.title}</h4>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Batch ID: <strong style={{ color: '#0F172A' }}>#{req.id}</strong></span>
                      <span>•</span>
                      <span>Status: <strong style={{ color: req.status === 'Delivered' ? '#15803D' : '#D97706' }}>{req.status}</strong></span>
                    </div>

                    {fb ? (
                      <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={15} 
                              fill={star <= (fb.rating || fb) ? '#F59E0B' : '#CBD5E1'} 
                              color={star <= (fb.rating || fb) ? '#F59E0B' : '#CBD5E1'} 
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>
                          Rated {fb.rating || fb}/5 Stars
                        </span>
                        {fb.comment && (
                          <span style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>
                            — "{fb.comment}"
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#64748B' }}>
                        {isFinished 
                          ? '✨ Food delivery is completed! Please rate your experience.' 
                          : '⏳ Rating will be available once the delivery is marked Delivered.'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isFinished ? (
                      <button
                        onClick={() => handleOpenFeedback(req)}
                        className="btn-primary"
                        style={{
                          padding: '0.45rem 1rem',
                          fontSize: '0.85rem',
                          background: fb ? '#059669' : '#F59E0B',
                          borderColor: fb ? '#059669' : '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Star size={16} fill="white" />
                        {fb ? 'Edit Review' : 'Rate Delivery'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                        In progress ({req.status})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {myClaims.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Star size={42} color="#CBD5E1" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>No claimed food batches yet</h4>
                <p style={{ fontSize: '0.88rem' }}>Claim food from the "Browse Food" tab first. Once delivered, you can submit feedback & ratings here!</p>
              </div>
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
                toast.success('Profile updated successfully!');
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

      {/* Interactive Feedback & Rating Modal */}
      {feedbackModal && feedbackClaim && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              ⭐ Rate Food & Delivery
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.25rem' }}>
              How was the delivery for <strong>{feedbackClaim.title}</strong>? Your rating and comments will be saved directly into the database.
            </p>

            <form onSubmit={handleSubmitFeedback}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        transform: star <= feedbackRating ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Star
                        size={32}
                        fill={star <= feedbackRating ? '#F59E0B' : 'none'}
                        color={star <= feedbackRating ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                  <span style={{ marginLeft: '0.5rem', fontWeight: 800, color: '#D97706', fontSize: '1.05rem' }}>
                    {feedbackRating} / 5
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Feedback / Comments
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Food was fresh and packaged very neatly. It helped feed 40 people!"
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#059669', borderColor: '#059669' }}
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
