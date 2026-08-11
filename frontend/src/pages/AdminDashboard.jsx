import React, { useState } from 'react';
import { ShieldCheck, UserCheck, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ donations }) {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Grand Hyatt Hotel", role: "Donor", status: "Verified", license: "FSSAI-849201" },
    { id: 2, name: "Hope Shelter NGO", role: "NGO", status: "Pending Verification", license: "NGO-12A-9402" },
    { id: 3, name: "BakeHouse Cafe", role: "Donor", status: "Verified", license: "FSSAI-392012" },
    { id: 4, name: "City Care Relief", role: "NGO", status: "Verified", license: "NGO-80G-1102" }
  ]);

  const handleApprove = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: 'Verified' } : u));
  };

  return (
    <div>
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <span style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ADMINISTRATOR CONTROL PANEL
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
          System Overview & Moderation
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
          Manage user verification, oversee platform transactions, and monitor real-time redistribution metrics.
        </p>
      </div>

      {/* Admin Quick Metrics */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon"><ShieldCheck size={24} /></div>
          <div>
            <div className="stat-value">{usersList.length}</div>
            <div className="stat-label">Total Registered Accounts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}><TrendingUp size={24} /></div>
          <div>
            <div className="stat-value">12,480</div>
            <div className="stat-label">Total Meals Served</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}><Building2 size={24} /></div>
          <div>
            <div className="stat-value">5.8 Tons</div>
            <div className="stat-label">CO₂ Prevented</div>
          </div>
        </div>
      </div>

      {/* User Verification Table */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--secondary)' }}>
          User & Partner Organization Verification Queue
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Organization Name</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>License / Reg. No.</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem', fontWeight: 700 }}>{u.name}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{u.license}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: u.status === 'Verified' ? '#ecfdf5' : '#fef3c7',
                      color: u.status === 'Verified' ? '#047857' : '#b45309'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                    {u.status !== 'Verified' && (
                      <button className="btn-primary" onClick={() => handleApprove(u.id)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                        Approve Partner
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
