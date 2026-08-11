import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle2, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VolunteerDashboard({ requests, setRequests }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    {
      id: 201,
      donationTitle: "Surplus Banquet Meals (Buffet)",
      donorName: "Grand Hyatt Hotel",
      pickupAddress: "Downtown Center, Block 4",
      ngoName: "Hope Shelter NGO",
      deliveryAddress: "Westside Care Center",
      status: "Assigned", // 'Assigned' | 'Picked Up' | 'Delivered'
      distance: "2.4 km",
      otpCode: "4829"
    },
    {
      id: 202,
      donationTitle: "Fresh Artisan Bread & Pastries",
      donorName: "BakeHouse Cafe",
      pickupAddress: "Westside Market Street",
      ngoName: "Community Food Bank",
      deliveryAddress: "North Avenue 12",
      status: "Available",
      distance: "3.1 km",
      otpCode: "9102"
    }
  ]);

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            VOLUNTEER & LOGISTICS PORTAL
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Welcome, {user?.name || 'Alex Smith'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Accept pickup tasks, navigate routes, and deliver fresh food safely to shelters.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem 1.2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Status: Active & Online</span>
        </div>
      </div>

      {/* Task Cards */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--secondary)' }}>
        Active Food Pickup & Delivery Tasks
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  TASK #{task.id} • {task.distance} Away
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.2rem' }}>
                  {task.donationTitle}
                </h4>
              </div>

              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: task.status === 'Delivered' ? '#ecfdf5' : '#fef3c7',
                color: task.status === 'Delivered' ? '#047857' : '#b45309'
              }}>
                Status: {task.status}
              </span>
            </div>

            {/* Route Map Steps */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              borderLeft: '4px solid var(--primary)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PICKUP POINT (DONOR)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{task.donorName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={12} /> {task.pickupAddress}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DROP-OFF POINT (NGO)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{task.ngoName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><Navigation size={12} /> {task.deliveryAddress}</div>
              </div>
            </div>

            {/* Actions Stepper */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
              {task.status === 'Available' && (
                <button className="btn-primary" onClick={() => handleUpdateStatus(task.id, 'Assigned')}>
                  Accept Task
                </button>
              )}

              {task.status === 'Assigned' && (
                <button className="btn-primary" onClick={() => handleUpdateStatus(task.id, 'Picked Up')}>
                  Confirm Pickup (OTP: {task.otpCode})
                </button>
              )}

              {task.status === 'Picked Up' && (
                <button className="btn-primary" style={{ background: '#059669' }} onClick={() => handleUpdateStatus(task.id, 'Delivered')}>
                  <CheckCircle2 size={18} /> Complete Delivery at NGO
                </button>
              )}

              {task.status === 'Delivered' && (
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={18} /> Task Completed Successfully!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
