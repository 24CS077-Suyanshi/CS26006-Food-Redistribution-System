import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AIPredictionPage from './pages/AIPredictionPage';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

//Java script object
const INITIAL_DONATIONS = [
  {
    id: 101,
    donor_id: 1,
    donor_name: 'Grand Hyatt Hotel',
    title: 'Surplus Banquet Meals (Buffet)',
    category: 'Veg',
    quantity: '45 Portions',
    prepared_time: '2 hours ago',
    expiry_hours: 3,
    location: 'Downtown Center, Block 4',
    storage_type: 'Refrigerated',
    status: 'Available',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 102,
    donor_id: 1,
    donor_name: 'BakeHouse Cafe',
    title: 'Fresh Artisan Bread & Pastries',
    category: 'Veg',
    quantity: '25 kg',
    prepared_time: '1 hour ago',
    expiry_hours: 8,
    location: 'Westside Market Street',
    storage_type: 'Room Temperature',
    status: 'Available',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 103,
    donor_id: 2,
    donor_name: 'TechPark Cafeteria',
    title: 'Catered Packed Meals',
    category: 'Non-Veg',
    quantity: '60 Boxes',
    prepared_time: '30 mins ago',
    expiry_hours: 4,
    location: 'Innovation Hub, Building B',
    storage_type: 'Hot Storage',
    status: 'Claimed',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
  }
];

//when user login set the user in local storage
function MainAppContent() {
  const { user } = useAuth();
  
  // Default to 'dashboard' if user is already logged in, otherwise 'home'
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      const topTab = hash.split('/')[0];
      if (topTab === 'dashboard' && user) {
        return 'dashboard';
      }
      if (['ai-predictor', 'auth', 'home'].includes(topTab)) {
        return topTab;
      }
    }
    // If user is already logged in, open their dashboard directly
    if (user) {
      return 'dashboard';
    }
    return 'home';
  });
  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('donor');

  // If user logs out or is not logged in while activeTab is dashboard, redirect to home
  useEffect(() => {
    if (!user && activeTab === 'dashboard') {
      setActiveTab('home');
      window.history.replaceState({ tab: 'home' }, '', window.location.pathname);
    }
  }, [user, activeTab]);

  useEffect(() => {
    localStorage.setItem('frs_authMode', authMode);
    localStorage.setItem('frs_authRole', authRole);

    if (activeTab === 'dashboard') {
      // Keep sub-tab in hash (e.g. #dashboard/notifications) intact on refresh
      if (!window.location.hash.startsWith('#dashboard')) {
        window.history.replaceState({ tab: 'dashboard' }, '', '#dashboard');
      }
    } else if (activeTab === 'home') {
      if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#home') {
        window.history.replaceState({ tab: 'home' }, '', window.location.pathname);
      }
    } else {
      if (!window.location.hash.startsWith(`#${activeTab}`)) {
        window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
      }
    }
  }, [activeTab, authMode, authRole]);

  // Sync with browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        const hash = window.location.hash.replace('#', '').trim();
        if (hash) {
          const topTab = hash.split('/')[0];
          if (['home', 'dashboard', 'ai-predictor', 'auth'].includes(topTab)) {
            setActiveTab(topTab);
            return;
          }
        }
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'home') {
      window.history.pushState({ tab: 'home' }, '', window.location.pathname);
    } else {
      window.history.pushState({ tab: newTab }, '', `#${newTab}`);
    }
  };

  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch data from backend API
    const fetchData = async () => {
      try {
        const [donationsRes, requestsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/donations`),
          axios.get(`${API_BASE_URL}/api/requests`)
        ]);
        const cleanedDonations = (donationsRes.data || []).filter(d => d.id !== 106);
        setDonations(cleanedDonations);
        setRequests(requestsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user, activeTab]);

  //when someone click on login or signup in navbar open auth page 
  const handleOpenAuth = (mode = 'login', role = 'donor') => {
    setAuthMode(mode);//which mode it is login or signup
    setAuthRole(role);//which role it is donor or ngo or volunteer
    changeTab('auth');//which tab it is home or auth or dashboard
  };

  //use of conditional rending
  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        onOpenAuth={handleOpenAuth}
      />

      <main className="main-content">
        {/*Javascript logical statement */}
        {activeTab === 'home' && (
          <HomePage
            donations={donations}
            onNavigateToTab={(tab) => {
              if (tab === 'login' || !user) {
                handleOpenAuth('login');
              } else {
                changeTab('dashboard');
              }
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            initialMode={authMode}
            initialRole={authRole}
            onLoginSuccess={() => changeTab('dashboard')}
            onModeChange={setAuthMode}
          />
        )}

        {activeTab === 'dashboard' && !user && (
          <AuthPage
            initialMode="login"
            onLoginSuccess={() => changeTab('dashboard')}
            onModeChange={setAuthMode}
          />
        )}

        {activeTab === 'dashboard' && user && (
          <Dashboard
            donations={donations}
            setDonations={setDonations}
            requests={requests}
            setRequests={setRequests}
          />
        )}

        {activeTab === 'ai-predictor' && (
          <AIPredictionPage />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}



