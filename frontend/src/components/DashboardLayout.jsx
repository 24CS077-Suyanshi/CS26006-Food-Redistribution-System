import React from 'react';
import { LogOut, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ 
  children, 
  sidebarTabs, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery 
}) {
  const { user, logout } = useAuth();

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
            {setSearchQuery && (
              <>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '4rem', fontSize: '0.88rem' }}
                  placeholder="Search..."
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
              </>
            )}
          </div>

          {/* Top Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('notifications')}>
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

            <div className="user-profile-badge" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
              <div className="avatar">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div>
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role?.toUpperCase() || 'USER'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {children}

      </main>
    </div>
  );
}
