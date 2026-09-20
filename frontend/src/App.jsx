import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

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
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('frs_activeTab') || 'home');
  const [authMode, setAuthMode] = useState(() => localStorage.getItem('frs_authMode') || 'login');
  const [authRole, setAuthRole] = useState(() => localStorage.getItem('frs_authRole') || 'donor');

  useEffect(() => {
    sessionStorage.setItem('frs_activeTab', activeTab);
    localStorage.setItem('frs_authMode', authMode);
    localStorage.setItem('frs_authRole', authRole);
  }, [activeTab, authMode, authRole]);

  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch data from backend API
    const fetchData = async () => {
      try {
        const [donationsRes, requestsRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/donations'),
          axios.get('http://127.0.0.1:5000/api/requests')
        ]);
        setDonations(donationsRes.data);
        setRequests(requestsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  //when someone click on login or signup in navbar open auth page 
  const handleOpenAuth = (mode = 'login', role = 'donor') => {
    setAuthMode(mode);//which mode it is login or signup
    setAuthRole(role);//which role it is donor or ngo or volunteer
    setActiveTab('auth');//which tab it is home or auth or dashboard
  };

  //use of conditional rending
  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
                setActiveTab('dashboard');
              }
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            initialMode={authMode}
            initialRole={authRole}
            onLoginSuccess={() => setActiveTab('dashboard')}
            onModeChange={setAuthMode}
          />
        )}

        {activeTab === 'dashboard' && !user && (
          <AuthPage
            initialMode="login"
            onLoginSuccess={() => setActiveTab('dashboard')}
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



