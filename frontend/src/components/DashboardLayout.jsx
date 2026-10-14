import React, { useState } from 'react';
import { LogOut, Search, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ 
  children, 
  sidebarTabs = [], 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery 
}) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid-layout">
        
        {/* --- DESKTOP SIDEBAR (visible on >= 1024px) --- */}
        <aside className="dashboard-sidebar-desktop">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                MAIN MENU
              </span>
            </div>

            {sidebarTabs.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
                    borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} color={active ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
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
              transition: 'var(--transition)',
              marginTop: '1.5rem',
              width: '100%'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </aside>

        {/* --- MAIN AREA --- */}
        <main className="dashboard-main-content">
          
          {/* TOP NAVIGATION BAR */}
          <div className="dashboard-topbar">
            {/* Search Bar */}
            <div className="dashboard-search-wrapper">
              {setSearchQuery && (
                <>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '3.5rem', fontSize: '0.88rem' }}
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <span className="hidden sm:inline-block" style={{
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
                </>
              )}
            </div>

            {/* Top Right Controls */}
            <div className="dashboard-topbar-controls">
              {/* Role Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#F8FAFC',
                padding: '0.35rem 0.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Role:
                </span>
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  color: user?.role === 'admin' ? '#7C3AED' : 'var(--primary-dark)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em'
                }}>
                  {user?.role === 'admin' ? '🛡️ Admin' : user?.role || 'User'}
                </span>
              </div>

              {/* Notification Bell */}
              <div style={{ position: 'relative', cursor: 'pointer', padding: '0.35rem' }} onClick={() => setActiveTab('notifications')}>
                <Bell size={20} color="var(--text-muted)" />
                <span style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
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

              {/* User Profile Badge */}
              <div className="user-profile-badge" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '0.82rem' }}>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden sm:block">
                  <div className="user-name" style={{ fontSize: '0.82rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                  <div className="user-role" style={{ fontSize: '0.65rem' }}>{user?.role?.toUpperCase() || 'USER'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* --- MOBILE NAVIGATION BAR (< 1024px) --- */}
          <div className="dashboard-mobile-nav">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dashboard Navigation
              </span>
              <button 
                type="button" 
                onClick={() => setMobileMenuOpen(prev => !prev)}
                style={{
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
                <span>{mobileMenuOpen ? 'Close Menu' : 'All Tabs'}</span>
              </button>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="dashboard-mobile-tabs-scroll">
              {sidebarTabs.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="dashboard-mobile-tab-btn"
                    style={{
                      background: active ? '#10B981' : '#F8FAFC',
                      color: active ? '#FFFFFF' : '#334155',
                      borderColor: active ? '#059669' : '#E2E8F0',
                      boxShadow: active ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  >
                    <Icon size={16} color={active ? '#FFFFFF' : '#64748B'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown Menu when user taps All Tabs */}
            {mobileMenuOpen && (
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                {sidebarTabs.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: active ? '#ECFDF5' : 'transparent',
                        color: active ? '#047857' : '#334155',
                        fontWeight: active ? 800 : 600,
                        fontSize: '0.88rem',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Icon size={18} color={active ? '#059669' : '#64748B'} />
                        {item.label}
                      </span>
                      {active && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />}
                    </button>
                  );
                })}

                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: '1px solid #FEE2E2',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Tab Content */}
          <div className="dashboard-content-area">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}
