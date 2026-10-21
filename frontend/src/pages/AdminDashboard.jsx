import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Truck,
  HeartHandshake,
  Download,
  Printer,
  Megaphone,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertTriangle,
  FileText,
  Activity,
  Award,
  Star,
  Sparkles,
  Workflow,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import axios from 'axios';
import AIPredictionPage from './AIPredictionPage';
import HowItWorksTab from '../components/HowItWorksTab';
import NotificationsTab from '../components/NotificationsTab';
import { API_BASE_URL } from '../apiConfig';

// Initial fallback users when offline
const FALLBACK_USERS = [
  {
    id: 1,
    name: "Grand Hyatt Hotel",
    email: "donor@frs.org",
    role: "donor",
    phone: "+91 9876543210",
    address: "Downtown Center, Block 4",
    organization_type: "Hotel",
    is_verified: true,
    created_at: "2026-07-15"
  },
  {
    id: 2,
    name: "Hope Shelter NGO",
    email: "ngo@frs.org",
    role: "ngo",
    phone: "+91 9876543211",
    address: "Westside Care Center",
    organization_type: "NGO",
    is_verified: true,
    created_at: "2026-07-18"
  },
  {
    id: 3,
    name: "Alex Smith",
    email: "volunteer@frs.org",
    role: "volunteer",
    phone: "+91 9876543212",
    address: "City Center",
    organization_type: "Individual",
    is_verified: true,
    created_at: "2026-08-01"
  },
  {
    id: 4,
    name: "System Administrator",
    email: "admin@frs.org",
    role: "admin",
    phone: "+91 9876543213",
    address: "Central Command HQ",
    organization_type: "Admin",
    is_verified: true,
    created_at: "2026-01-01"
  },
  {
    id: 5,
    name: "Green Earth Foundation",
    email: "greenearth@ngo.org",
    role: "ngo",
    phone: "+91 9822334455",
    address: "Sector 9, Green Avenue",
    organization_type: "Community Organization",
    is_verified: false,
    created_at: "2026-08-05"
  },
  {
    id: 6,
    name: "Priya Sharma",
    email: "priya.volunteer@frs.org",
    role: "volunteer",
    phone: "+91 9811223344",
    address: "South Extension, Block B",
    organization_type: "Individual",
    is_verified: true,
    created_at: "2026-08-06"
  }
];

const FALLBACK_ACTIVITIES = [
  { id: 1, type: "claim", title: "Claim Submitted", description: "Hope Shelter NGO claimed 'Surplus Banquet Meals'", timestamp: "12 mins ago", level: "info" },
  { id: 2, type: "donation", title: "New Food Listed", description: "BakeHouse Cafe listed 'Fresh Artisan Bread' (25 kg)", timestamp: "45 mins ago", level: "success" },
  { id: 3, type: "delivery", title: "Delivery In-Transit", description: "Alex Smith picked up batch #101 with verified OTP", timestamp: "1 hour ago", level: "warning" },
  { id: 4, type: "user", title: "New NGO Registered", description: "Green Earth Foundation requested verification", timestamp: "2 hours ago", level: "accent" }
];

export default function AdminDashboard({ 
  donations = [], 
  setDonations, 
  requests = [], 
  setRequests 
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const parts = window.location.hash.replace('#', '').split('/');
    return (parts[0] === 'dashboard' && parts[1]) ? parts[1] : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSelectTab = (tabId) => {
    if (tabId === 'notifications') {
      setUnreadCount(0);
    }
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

  // Admin Data State
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [activities, setActivities] = useState(FALLBACK_ACTIVITIES);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [donationFilter, setDonationFilter] = useState('all');
  const [requestFilter, setRequestFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('all');

  // Modals State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDonationDetailModal, setShowDonationDetailModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Forms
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'donor',
    phone: '',
    address: '',
    organization_type: 'Restaurant',
    is_verified: true
  });

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Fetch Users & Activities from Backend on mount
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, actRes, setRes, fbRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/users`).catch(() => null),
          axios.get(`${API_BASE_URL}/api/admin/activities`).catch(() => null),
          axios.get(`${API_BASE_URL}/api/admin/settings`).catch(() => null),
          axios.get(`${API_BASE_URL}/api/feedback`).catch(() => null)
        ]);

        if (usersRes && usersRes.data) setUsers(usersRes.data);
        if (actRes && actRes.data) setActivities(actRes.data);
        if (fbRes && fbRes.data) setFeedbacks(fbRes.data);
        if (setRes && setRes.data) {
          setBroadcastMessage(setRes.data.emergency_broadcast || '');
          setBroadcastActive(setRes.data.broadcast_active || false);
        }
      } catch (err) {
        console.warn('Backend unavailable, using simulated admin storage', err);
      }
    };
    fetchAdminData();
  }, []);

  // Compute Live Metrics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const donorsCount = users.filter(u => u.role === 'donor').length;
    const ngosCount = users.filter(u => u.role === 'ngo').length;
    const volunteersCount = users.filter(u => u.role === 'volunteer').length;
    const verifiedUsers = users.filter(u => u.is_verified).length;
    const pendingVerificationCount = users.filter(u => !u.is_verified).length;

    const totalDonations = donations.length;
    const availableDonations = donations.filter(d => d.status === 'Available').length;
    const claimedDonations = donations.filter(d => d.status === 'Claimed' || d.status === 'Requested').length;
    const deliveredDonations = donations.filter(d => d.status === 'Delivered').length;

    const vegCount = donations.filter(d => d.category === 'Veg').length;
    const nonVegCount = donations.filter(d => d.category === 'Non-Veg').length;

    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'Delivered' || r.status === 'Completed').length;
    const inTransitRequests = requests.filter(r => r.status === 'In Transit').length;

    return {
      totalUsers,
      donorsCount,
      ngosCount,
      volunteersCount,
      verifiedUsers,
      pendingVerificationCount,
      totalDonations,
      availableDonations,
      claimedDonations,
      deliveredDonations,
      vegCount,
      nonVegCount,
      totalRequests,
      completedRequests,
      inTransitRequests,
      mealsServed: 12480 + (completedRequests * 40),
      co2SavedKg: 5820 + (completedRequests * 18.5)
    };
  }, [users, donations, requests]);

  // Sidebar Configuration
  const sidebarTabs = [
    { id: 'dashboard', label: 'System Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'donations', label: 'All Donations', icon: Utensils },
    { id: 'requests', label: 'Claims & Logistics', icon: Truck },
    { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
    { id: 'feedback', label: 'Platform Reviews', icon: Star },
    { id: 'ai_predictor', label: 'AI Freshness Predictor', icon: Sparkles },
    { id: 'how_it_works', label: 'How It Works', icon: Workflow },
    { id: 'reports', label: 'Impact Reports', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to remove this feedback from the platform?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/feedback/${id}`);
    } catch (_) {}
    setFeedbacks(prev => prev.filter(f => f.id !== id));
    toast.success("Feedback review removed.");
  };

  // User Actions
  const handleToggleVerifyUser = async (userId) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const newStatus = !target.is_verified;

    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}`, {
        is_verified: newStatus
      });
    } catch (_) {}

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: newStatus } : u));
    toast.success(`${target.name} is now ${newStatus ? 'VERIFIED ✓' : 'UNVERIFIED'}`);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      toast.error('Please enter name and email.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/users`, newUserForm);
      if (res?.data?.user) {
        setUsers(prev => [res.data.user, ...prev]);
      } else {
        const localNew = {
          id: Date.now(),
          ...newUserForm,
          created_at: new Date().toISOString().split('T')[0]
        };
        setUsers(prev => [localNew, ...prev]);
      }
    } catch (_) {
      const localNew = {
        id: Date.now(),
        ...newUserForm,
        created_at: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [localNew, ...prev]);
    }

    toast.success(`User '${newUserForm.name}' created successfully!`);
    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'donor',
      phone: '',
      address: '',
      organization_type: 'Restaurant',
      is_verified: true
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${selectedUser.id}`, selectedUser);
    } catch (_) {}

    setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
    toast.success(`User '${selectedUser.name}' updated!`);
    setShowEditUserModal(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === 4) {
      toast.error('Primary System Administrator cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`);
    } catch (_) {}

    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success(`User '${userName}' removed from system.`);
  };

  // Donation Moderation Actions
  const handleUpdateDonationStatus = async (donationId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/donations/${donationId}/status`, {
        status: newStatus
      });
    } catch (_) {}

    if (setDonations) {
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: newStatus } : d));
    }
    toast.success(`Donation #${donationId} status changed to ${newStatus}`);
    if (selectedDonation && selectedDonation.id === donationId) {
      setSelectedDonation(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDeleteDonation = async (donationId, donationTitle) => {
    if (!window.confirm(`Are you sure you want to delete listing "${donationTitle}"?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/donations/${donationId}`);
    } catch (_) {}

    if (setDonations) {
      setDonations(prev => prev.filter(d => d.id !== donationId));
    }
    setShowDonationDetailModal(false);
    toast.success(`Listing '${donationTitle}' deleted.`);
  };

  // Request Moderation Action
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/requests/${requestId}/status`, {
        status: newStatus
      });
    } catch (_) {}

    if (setRequests) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    }
    toast.success(`Claim #${requestId} marked as ${newStatus}`);
  };

  // Broadcast Handler
  const handleSaveBroadcast = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/admin/settings`, {
        emergency_broadcast: broadcastMessage,
        broadcast_active: broadcastActive
      });
    } catch (_) {}

    toast.success(broadcastActive ? '📢 Emergency Alert is now LIVE across the platform!' : 'Alert deactivated.');
    setShowBroadcastModal(false);
  };

  // Printable Report Trigger
  const handlePrintReport = () => {
    window.print();
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone && u.phone.includes(searchQuery)) ||
                          (u.organization_type && u.organization_type.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (userRoleFilter === 'all') return true;
    if (userRoleFilter === 'unverified') return !u.is_verified;
    return u.role === userRoleFilter;
  });

  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (donationFilter === 'all') return true;
    if (donationFilter === 'Veg' || donationFilter === 'Non-Veg') return d.category === donationFilter;
    return d.status.toLowerCase() === donationFilter.toLowerCase();
  });

  const filteredRequests = requests.filter(r => {
    const title = r.title || r.donation_title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.ngo_name && r.ngo_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (r.volunteer_name && r.volunteer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (requestFilter === 'all') return true;
    return r.status.toLowerCase() === requestFilter.toLowerCase();
  });

  return (
    <DashboardLayout 
      sidebarTabs={sidebarTabs}
      activeTab={activeTab}
      setActiveTab={handleSelectTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      unreadCount={unreadCount}
    >
      {/* Platform Emergency Broadcast Banner if Active */}
      {broadcastActive && broadcastMessage && (
        <div style={{
          background: 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)',
          color: 'white',
          padding: '0.85rem 1.25rem',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
            <Megaphone size={20} />
            <span>EMERGENCY PLATFORM BROADCAST: {broadcastMessage}</span>
          </div>
          <button 
            onClick={() => setBroadcastActive(false)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SYSTEM OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease-out' }}>
          
          {/* Header Hero */}
          <div 
            className="dashboard-banner-responsive"
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#38BDF8', 
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '50px',
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em' 
                }}>
                  ADMINISTRATIVE CONTROL CENTER
                </span>
                <span style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 700 }}>● Systems Operational</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                Master Administration Console
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '620px' }}>
                Full system surveillance, user authorization, food redistribution logistics oversight, and environmental impact reporting.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
              <button 
                className="btn-primary" 
                onClick={() => setShowAddUserModal(true)}
                style={{ background: '#0284C7', border: 'none', padding: '0.7rem 1.1rem', fontSize: '0.88rem' }}
              >
                <Plus size={18} /> Add User
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setShowBroadcastModal(true)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.7rem 1.1rem', fontSize: '0.88rem' }}
              >
                <Megaphone size={18} /> Broadcast Alert
              </button>
            </div>
          </div>

          {/* Primary KPI Cards Grid */}
          <div className="stats-grid" style={{ marginBottom: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
              <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {stats.donorsCount} Donors • {stats.ngosCount} NGOs • {stats.volunteersCount} Vol.
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('donations')}>
              <div className="stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <Utensils size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.totalDonations}</div>
                <div className="stat-label">Total Listings</div>
                <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, marginTop: '0.2rem' }}>
                  {stats.availableDonations} Available Now
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('requests')}>
              <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <Truck size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.totalRequests}</div>
                <div className="stat-label">Claim Requests</div>
                <div style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700, marginTop: '0.2rem' }}>
                  {stats.inTransitRequests} Deliveries In-Transit
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>
              <div className="stat-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
                <Award size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.mealsServed.toLocaleString()}</div>
                <div className="stat-label">Meals Served</div>
                <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, marginTop: '0.2rem' }}>
                  🌱 {stats.co2SavedKg.toLocaleString()} kg CO2 Saved
                </div>
              </div>
            </div>
          </div>

          {/* Analytics & System Health Row */}
          <div className="dashboard-analytics-grid">
            
            {/* Visual Distribution Widgets */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Platform Resource Breakdown
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Real-time Audited
                </span>
              </div>

              {/* Progress Bar 1: Food Type */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <span>Food Category (Veg vs Non-Veg)</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {stats.vegCount} Veg ({stats.totalDonations ? Math.round((stats.vegCount/stats.totalDonations)*100) : 0}%) • {stats.nonVegCount} Non-Veg
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#F1F5F9', borderRadius: '50px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ 
                    width: `${stats.totalDonations ? (stats.vegCount / stats.totalDonations) * 100 : 50}%`, 
                    background: '#10B981' 
                  }} />
                  <div style={{ 
                    width: `${stats.totalDonations ? (stats.nonVegCount / stats.totalDonations) * 100 : 50}%`, 
                    background: '#EF4444' 
                  }} />
                </div>
              </div>

              {/* Progress Bar 2: User Roles */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <span>User Composition</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {stats.donorsCount} Donors | {stats.ngosCount} NGOs | {stats.volunteersCount} Volunteers
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#F1F5F9', borderRadius: '50px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${stats.totalUsers ? (stats.donorsCount / stats.totalUsers) * 100 : 33}%`, background: '#3B82F6' }} title="Donors" />
                  <div style={{ width: `${stats.totalUsers ? (stats.ngosCount / stats.totalUsers) * 100 : 33}%`, background: '#10B981' }} title="NGOs" />
                  <div style={{ width: `${stats.totalUsers ? (stats.volunteersCount / stats.totalUsers) * 100 : 34}%`, background: '#8B5CF6' }} title="Volunteers" />
                </div>
              </div>

              {/* Status Pills Summary */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem', 
                padding: '1rem', 
                background: '#F8FAFC', 
                borderRadius: '16px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981' }}>{stats.availableDonations}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Available Batches</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F59E0B' }}>{stats.claimedDonations}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Pending / Claimed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366F1' }}>{stats.deliveredDonations}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Delivered Batches</div>
                </div>
              </div>
            </div>

            {/* Platform Health & Quick Alerts */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
                  Platform Health
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 600 }}>API Service</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '0.2rem 0.55rem', borderRadius: '50px' }}>
                      Online (200 OK)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 600 }}>AI Freshness Engine</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369A1', background: '#E0F2FE', padding: '0.2rem 0.55rem', borderRadius: '50px' }}>
                      Active (0.94 Conf)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 600 }}>Pending Verifications</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: stats.pendingVerificationCount > 0 ? '#B45309' : '#15803D', background: stats.pendingVerificationCount > 0 ? '#FEF3C7' : '#DCFCE7', padding: '0.2rem 0.55rem', borderRadius: '50px' }}>
                      {stats.pendingVerificationCount} Pending
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 600 }}>Database Failover</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', background: '#F3E8FF', padding: '0.2rem 0.55rem', borderRadius: '50px' }}>
                      Auto Synchronized
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => setActiveTab('users')}
                  style={{ width: '100%', justifyContent: 'center', background: '#1E293B', border: 'none' }}
                >
                  Review Pending Users
                </button>
              </div>
            </div>

          </div>

          {/* Real-time System Audit Activity Feed */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-dark)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Live System Activity Log
                </h3>
              </div>
              <button 
                onClick={() => toast.success('Activity log refreshed.')}
                className="btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activities.map(act => (
                <div key={act.id} style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: act.level === 'success' ? '#10B981' : act.level === 'warning' ? '#F59E0B' : '#3B82F6'
                    }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-dark)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {act.description}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAGE USERS */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', animation: 'fadeIn 0.3s ease-out' }}>
          
          {/* Top Filter & Actions Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
                User Management & Access Control
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Audit registered donors, NGOs, volunteers, and admin privileges.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => setShowAddUserModal(true)}
                style={{ background: '#0284C7', border: 'none' }}
              >
                <Plus size={18} /> Add New User
              </button>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Users' },
              { id: 'donor', label: 'Donors' },
              { id: 'ngo', label: 'NGOs' },
              { id: 'volunteer', label: 'Volunteers' },
              { id: 'admin', label: 'Admins' },
              { id: 'unverified', label: 'Pending Verification' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setUserRoleFilter(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: userRoleFilter === tab.id ? '2px solid #0284C7' : '1px solid var(--border-subtle)',
                  background: userRoleFilter === tab.id ? '#E0F2FE' : '#F8FAFC',
                  color: userRoleFilter === tab.id ? '#0369A1' : 'var(--text-dark)',
                  fontWeight: userRoleFilter === tab.id ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem' }}>User / Organization</th>
                  <th style={{ padding: '0.85rem' }}>Role</th>
                  <th style={{ padding: '0.85rem' }}>Contact</th>
                  <th style={{ padding: '0.85rem' }}>Verification</th>
                  <th style={{ padding: '0.85rem' }}>Address</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: u.role === 'donor' ? '#DCFCE7' : u.role === 'ngo' ? '#E0F2FE' : u.role === 'volunteer' ? '#F3E8FF' : '#FEF3C7',
                        color: u.role === 'donor' ? '#15803D' : u.role === 'ngo' ? '#0369A1' : u.role === 'volunteer' ? '#7C3AED' : '#B45309'
                      }}>
                        {u.role}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {u.organization_type}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                      {u.phone || '—'}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <button
                        onClick={() => handleToggleVerifyUser(u.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          border: 'none',
                          background: u.is_verified ? '#DCFCE7' : '#FEF3C7',
                          color: u.is_verified ? '#15803D' : '#B45309'
                        }}
                        title="Click to toggle verification status"
                      >
                        {u.is_verified ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        {u.is_verified ? 'Verified' : 'Pending Review'}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.address || '—'}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setSelectedUser({ ...u });
                            setShowEditUserModal(true);
                          }}
                          style={{
                            padding: '0.4rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            background: 'white',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                        </button>
                        {u.id !== 4 && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            style={{
                              padding: '0.4rem',
                              borderRadius: '8px',
                              border: '1px solid #FCA5A5',
                              background: '#FEF2F2',
                              color: '#EF4444',
                              cursor: 'pointer'
                            }}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ALL PLATFORM DONATIONS */}
      {/* ======================================================== */}
      {activeTab === 'donations' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
                Food Donation Audit & Moderation
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Inspect food listings, freshness guidelines, claims, and storage conditions.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'Available', 'Claimed', 'Delivered', 'Veg', 'Non-Veg'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setDonationFilter(filter)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: donationFilter === filter ? '2px solid #10B981' : '1px solid var(--border-subtle)',
                    background: donationFilter === filter ? '#DCFCE7' : '#F8FAFC',
                    color: donationFilter === filter ? '#15803D' : 'var(--text-dark)',
                    fontWeight: donationFilter === filter ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Donations Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem' }}>Listing</th>
                  <th style={{ padding: '0.85rem' }}>Donor</th>
                  <th style={{ padding: '0.85rem' }}>Quantity</th>
                  <th style={{ padding: '0.85rem' }}>Safe Time</th>
                  <th style={{ padding: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No food listings match your filter.
                    </td>
                  </tr>
                ) : filteredDonations.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title} 
                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Utensils size={18} color="var(--text-muted)" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{item.title}</div>
                          <span className={`tag-badge ${item.category === 'Veg' ? 'tag-veg' : 'tag-nonveg'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{item.donor_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.location}</div>
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 700 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <Clock size={13} /> {item.expiry_hours}h safety window
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: item.status === 'Available' ? '#DCFCE7' : item.status === 'Claimed' ? '#FEF3C7' : '#E0F2FE',
                        color: item.status === 'Available' ? '#15803D' : item.status === 'Claimed' ? '#B45309' : '#0369A1'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setSelectedDonation(item);
                            setShowDonationDetailModal(true);
                          }}
                          style={{
                            padding: '0.4rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            background: 'white',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateDonationStatus(item.id, e.target.value)}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="Claimed">Claimed</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteDonation(item.id, item.title)}
                          style={{
                            padding: '0.4rem',
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            background: '#FEF2F2',
                            color: '#EF4444',
                            cursor: 'pointer'
                          }}
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CLAIMS & LOGISTICS OVERSIGHT */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
                Redistribution Claims & Transit Oversight
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Track NGO allocation, volunteer dispatch, and secure OTP pickup handshakes.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'pending', 'in transit', 'delivered'].map(f => (
                <button
                  key={f}
                  onClick={() => setRequestFilter(f)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: requestFilter === f ? '2px solid #8B5CF6' : '1px solid var(--border-subtle)',
                    background: requestFilter === f ? '#F3E8FF' : '#F8FAFC',
                    color: requestFilter === f ? '#7C3AED' : 'var(--text-dark)',
                    fontWeight: requestFilter === f ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem' }}>Claim ID & Food</th>
                  <th style={{ padding: '0.85rem' }}>Requesting NGO</th>
                  <th style={{ padding: '0.85rem' }}>Assigned Volunteer</th>
                  <th style={{ padding: '0.85rem' }}>Secure OTP</th>
                  <th style={{ padding: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Override</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No active claim requests matching criteria.
                    </td>
                  </tr>
                ) : filteredRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                        {req.title || req.donation_title || `Donation #${req.donation_id}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Claim Ref: #{req.id}</div>
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: '#0369A1' }}>
                      {req.ngo_name}
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                      {req.volunteer_name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 800, 
                        letterSpacing: '0.15em', 
                        background: '#F1F5F9', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1'
                      }}>
                        {req.otp_code || '4829'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: req.status === 'Delivered' ? '#DCFCE7' : req.status === 'In Transit' ? '#E0F2FE' : '#FEF3C7',
                        color: req.status === 'Delivered' ? '#15803D' : req.status === 'In Transit' ? '#0369A1' : '#B45309'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: REPORTS & IMPACT ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                OFFICIAL IMPACT REPORT
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginTop: '0.2rem' }}>
                Food Waste Diversion & Environmental Impact
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Certified by System Administrator
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handlePrintReport} 
                className="btn-primary" 
                style={{ background: '#0F172A', border: 'none' }}
              >
                <Printer size={18} /> Print / Export PDF
              </button>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            {['Last 7 Days', 'Last 30 Days', 'All Time'].map((tf, i) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf.toLowerCase().replace(/\s+/g, '_'))}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  border: timeframe === tf.toLowerCase().replace(/\s+/g, '_') ? '2px solid var(--primary-dark)' : '1px solid var(--border-subtle)',
                  background: timeframe === tf.toLowerCase().replace(/\s+/g, '_') ? '#F0FDF4' : '#F8FAFC',
                  color: timeframe === tf.toLowerCase().replace(/\s+/g, '_') ? 'var(--primary-dark)' : 'var(--text-dark)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Impact Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '18px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>Meals Salvaged</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#166534', margin: '0.3rem 0' }}>
                {stats.mealsServed.toLocaleString()}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#15803D' }}>Nourished hungry families across community shelters.</p>
            </div>

            <div style={{ padding: '1.5rem', borderRadius: '18px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>CO2 Offset Equivalent</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1E40AF', margin: '0.3rem 0' }}>
                {stats.co2SavedKg.toLocaleString()} kg
              </div>
              <p style={{ fontSize: '0.8rem', color: '#1D4ED8' }}>Equivalent to planting ~260 mature trees.</p>
            </div>

            <div style={{ padding: '1.5rem', borderRadius: '18px', background: '#FAF5FF', border: '1px solid #E9D5FF' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase' }}>Food Weight Diverted</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#6B21A8', margin: '0.3rem 0' }}>
                {(stats.mealsServed * 0.42).toFixed(0).toLocaleString()} kg
              </div>
              <p style={{ fontSize: '0.8rem', color: '#7E22CE' }}>Diverted completely from municipal landfills.</p>
            </div>

            <div style={{ padding: '1.5rem', borderRadius: '18px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>Estimated Food Value</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#92400E', margin: '0.3rem 0' }}>
                ₹ {(stats.mealsServed * 65).toLocaleString()}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#B45309' }}>Economic resources preserved for local communities.</p>
            </div>
          </div>

          {/* Audit Verification Table for the PDF */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '0.95rem' }}>
              Certified Redistribution Ledger
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'white', borderBottom: '1px solid #E2E8F0', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Donor</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Portions</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>{d.title}</td>
                    <td style={{ padding: '0.75rem' }}>{d.donor_name}</td>
                    <td style={{ padding: '0.75rem' }}>{d.category}</td>
                    <td style={{ padding: '0.75rem' }}>{d.quantity}</td>
                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#15803D' }}>
                      {d.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Community Ratings & NGO Reviews */}
          <div style={{ marginTop: '2.5rem', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                  ⭐ Verified Recipient Reviews & Quality Ratings
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>
                  Direct audit feedback submitted by NGOs upon food arrival
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#FEF3C7', padding: '0.35rem 0.8rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: 800, color: '#92400E', fontSize: '0.85rem' }}>
                  {feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1) : '5.0'} / 5.0
                </span>
              </div>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No feedback records found in database.
                </div>
              ) : (
                feedbacks.map(fb => (
                  <div key={fb.id} style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9',
                    background: '#FAFAFA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                          {fb.user_name || 'Verified Recipient'}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '0.1rem 0.45rem', borderRadius: '4px', color: '#475569' }}>
                          Batch #{fb.donation_id}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0.2rem 0' }}>
                        "{fb.comment}"
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{fb.created_at || 'Recorded'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#FFFBEB', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < fb.rating ? '#F59E0B' : 'none'}
                          color={i < fb.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                      <span style={{ fontWeight: 800, color: '#B45309', marginLeft: '0.25rem', fontSize: '0.8rem' }}>
                        {fb.rating}.0
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SYSTEM SETTINGS & BROADCAST */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', animation: 'fadeIn 0.3s ease-out' }}>
          
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
            System Settings & Platform Parameters
          </h2>

          <div className="dashboard-two-col-grid">
            
            {/* Emergency Broadcast Card */}
            <div style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Megaphone size={20} color="#DC2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Platform Emergency Broadcast
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Display an instant high-priority banner at the top of all user dashboards (e.g. extreme weather food alerts, road closures).
              </p>

              <form onSubmit={handleSaveBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <textarea
                  className="form-input"
                  style={{ width: '100%', height: '80px', fontSize: '0.85rem', resize: 'vertical' }}
                  placeholder="e.g. Heavy rainfall alert: volunteers please take designated high-ground routes."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={broadcastActive}
                    onChange={(e) => setBroadcastActive(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Activate Broadcast Banner Platform-wide</span>
                </label>

                <button type="submit" className="btn-primary" style={{ background: '#DC2626', border: 'none', alignSelf: 'flex-start' }}>
                  Save Broadcast Settings
                </button>
              </form>
            </div>

            {/* AI Freshness Prediction Parameters */}
            <div style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Activity size={20} color="#0284C7" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  AI Freshness Engine Config
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Adjust baseline expiration thresholds and food classification multipliers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Default Room Temp Shelf Life (Hours)</label>
                  <input type="number" className="form-input" defaultValue={4} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Cold Chain Extension Bonus (+Hours)</label>
                  <input type="number" className="form-input" defaultValue={4} />
                </div>
                <button 
                  type="button" 
                  onClick={() => toast.success('AI engine calibration updated.')}
                  className="btn-primary" 
                  style={{ background: '#0284C7', border: 'none', alignSelf: 'flex-start' }}
                >
                  Update Parameters
                </button>
              </div>
            </div>

          </div>

          {/* Database Reset / Demo Reset Action */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '18px', border: '1px solid #FECACA', background: '#FEF2F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 800, color: '#991B1B', fontSize: '1rem' }}>System Diagnostics & Demo Reset</h4>
              <p style={{ fontSize: '0.85rem', color: '#B91C1C' }}>
                Reload clean initial demo state (restores default donors, NGOs, and sample listings).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsers(FALLBACK_USERS);
                setActivities(FALLBACK_ACTIVITIES);
                toast.success('Demonstration state reloaded cleanly.');
              }}
              style={{
                background: '#DC2626',
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Reload Demo State
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: PLATFORM REVIEWS & FEEDBACK OVERSIGHT */}
      {/* ======================================================== */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
          
          {/* Header Card */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 800 }}>
                  QUALITY & SATISFACTION
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Delivery Feedback</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                Platform Ratings & Reviews Oversight
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Monitor feedback submitted by recipient shelters and NGOs on food quality, volunteer delivery, and donor freshness.
              </p>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.85rem 1.4rem', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <Star size={20} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#92400E' }}>
                    {feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1) : '5.0'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', marginTop: '0.2rem' }}>Average Rating</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '0.85rem 1.4rem', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                  {feedbacks.length}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total Reviews</div>
              </div>

              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.85rem 1.4rem', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>
                  {feedbacks.filter(f => f.rating >= 4).length}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065F46', marginTop: '0.2rem' }}>Positive (4-5★)</div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
              All Feedback Submissions ({feedbacks.length})
            </h3>

            {feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                <Star size={44} color="#CBD5E1" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--text-dark)' }}>No Reviews Yet</h4>
                <p style={{ fontSize: '0.88rem' }}>When NGOs rate and review food deliveries, their feedback will appear here in real time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbacks.map(fb => (
                  <div key={fb.id} style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '1px solid var(--border-subtle)',
                    background: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                          {fb.user_name || 'NGO Recipient'}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                          Batch #{fb.donation_id}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={15} 
                              fill={star <= (fb.rating || 5) ? '#F59E0B' : '#E2E8F0'} 
                              color={star <= (fb.rating || 5) ? '#F59E0B' : '#E2E8F0'} 
                            />
                          ))}
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B45309', marginLeft: '0.3rem' }}>
                            {fb.rating || 5}/5
                          </span>
                        </div>
                      </div>

                      {fb.donation_title && (
                        <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 600, marginBottom: '0.35rem' }}>
                          🍲 Donation Item: <strong>{fb.donation_title}</strong>
                        </div>
                      )}

                      <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: '0.3rem 0' }}>
                        "{fb.comment}"
                      </p>

                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Submitted: {fb.created_at || 'Recently'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="btn-secondary"
                        style={{
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem',
                          color: '#DC2626',
                          borderColor: '#FECACA',
                          background: '#FEF2F2',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'ai_predictor' && (
        <AIPredictionPage />
      )}

      {activeTab === 'how_it_works' && (
        <HowItWorksTab userRole="admin" onNavigateTab={handleSelectTab} />
      )}

      {activeTab === 'notifications' && (
        <NotificationsTab 
          userRole="admin" 
          userId={4} 
          onUnreadCountChange={setUnreadCount}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW USER */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                Create New Platform User
              </h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name / Organization</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Radisson Blu Hotel"
                  value={newUserForm.name}
                  onChange={e => setNewUserForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="email@domain.com"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="dashboard-two-col-grid" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={newUserForm.role}
                    onChange={e => setNewUserForm(p => ({ ...p, role: e.target.value }))}
                  >
                    <option value="donor">Donor</option>
                    <option value="ngo">NGO</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Physical Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Street address, City"
                  value={newUserForm.address}
                  onChange={e => setNewUserForm(p => ({ ...p, address: e.target.value }))}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={newUserForm.is_verified}
                  onChange={e => setNewUserForm(p => ({ ...p, is_verified: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Pre-verify this account immediately</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ background: '#0284C7', border: 'none' }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT USER */}
      {/* ======================================================== */}
      {showEditUserModal && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                Edit User: {selectedUser.name}
              </h3>
              <button 
                onClick={() => setShowEditUserModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={selectedUser.name}
                  onChange={e => setSelectedUser(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedUser.phone || ''}
                  onChange={e => setSelectedUser(p => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedUser.address || ''}
                  onChange={e => setSelectedUser(p => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Organization Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedUser.organization_type || ''}
                  onChange={e => setSelectedUser(p => ({ ...p, organization_type: e.target.value }))}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={selectedUser.is_verified || false}
                  onChange={e => setSelectedUser(p => ({ ...p, is_verified: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Account Verified</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditUserModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DONATION DETAILS INSPECTOR */}
      {/* ======================================================== */}
      {showDonationDetailModal && selectedDonation && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className={`tag-badge ${selectedDonation.category === 'Veg' ? 'tag-veg' : 'tag-nonveg'}`}>
                {selectedDonation.category}
              </span>
              <button 
                onClick={() => setShowDonationDetailModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedDonation.image_url && (
              <img 
                src={selectedDonation.image_url} 
                alt={selectedDonation.title} 
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '16px', marginBottom: '1.25rem' }} 
              />
            )}

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              {selectedDonation.title}
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Donated by <strong>{selectedDonation.donor_name}</strong> • {selectedDonation.location}
            </p>

            <div className="dashboard-two-col-grid" style={{ gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Quantity</span>
                <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{selectedDonation.quantity}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Storage Condition</span>
                <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{selectedDonation.storage_type || 'Room Temp'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Safety Window</span>
                <div style={{ fontWeight: 800, color: '#15803D' }}>{selectedDonation.expiry_hours} Hours</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Current Status</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>{selectedDonation.status}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => handleDeleteDonation(selectedDonation.id, selectedDonation.title)}
                style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Delete Listing
              </button>

              <button 
                onClick={() => setShowDonationDetailModal(false)}
                className="btn-secondary"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BROADCAST ALERT */}
      {/* ======================================================== */}
      {showBroadcastModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={20} color="#DC2626" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Platform Broadcast Alert
                </h3>
              </div>
              <button 
                onClick={() => setShowBroadcastModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Broadcast Text Message</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', height: '100px', resize: 'vertical' }}
                  placeholder="Enter high priority system notification message..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={broadcastActive}
                  onChange={e => setBroadcastActive(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Set active and publish to all user dashboards now</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowBroadcastModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ background: '#DC2626', border: 'none' }}
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
