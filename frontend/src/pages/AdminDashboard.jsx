import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function AdminDashboard({ donations = [], requests = [] }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarTabs = [
    { id: 'dashboard', label: 'System Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'donations', label: 'All Donations', icon: Utensils },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

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
            background: 'linear-gradient(135deg, #18181B 0%, #3F3F46 100%)',
            borderRadius: '20px',
            padding: '2.25rem 2.5rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#D4D4D8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ADMIN CONSOLE
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.4rem' }}>
                System Administrator
              </h2>
              <p style={{ color: '#A1A1AA', fontSize: '0.95rem' }}>
                Monitor system health, manage users, and view platform statistics.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => setActiveTab('reports')} style={{ background: '#52525B', border: 'none' }}>
                <BarChart3 size={18} /> Generate Report
              </button>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <Utensils size={24} />
              </div>
              <div>
                <div className="stat-value">{donations.length}</div>
                <div className="stat-label">Total Donations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">124</div>
                <div className="stat-label">Registered Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="stat-value">3</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="stat-value">100%</div>
                <div className="stat-label">System Uptime</div>
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
                Recent Platform Activity
              </h3>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Detailed activity logs will appear here.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Manage Users</h2>
          <p style={{ color: 'var(--text-muted)' }}>List of all Donors, NGOs, and Volunteers will be shown here.</p>
        </div>
      )}

      {activeTab === 'donations' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>All Platform Donations</h2>
          <p style={{ color: 'var(--text-muted)' }}>Complete audit log of all food donations across the platform.</p>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>System Reports & Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }}>Generate PDF reports for platform impact.</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>System Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure global platform settings.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
