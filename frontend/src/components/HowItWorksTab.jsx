import React from 'react';
import { 
  Workflow, 
  Sparkles, 
  Utensils, 
  Building2, 
  Truck, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Server,
  Monitor
} from 'lucide-react';

export default function HowItWorksTab({ userRole = 'donor', onNavigateTab }) {
  const steps = [
    {
      number: '01',
      title: 'Donor Lists Surplus Food',
      role: 'Donor',
      roleColor: '#10B981',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      icon: Utensils,
      desc: 'Restaurants, hotels, or banquet halls list surplus food with details: category, quantity, preparation time, and storage type.'
    },
    {
      number: '02',
      title: 'AI Freshness Prediction',
      role: 'System / AI',
      roleColor: '#059669',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      icon: Sparkles,
      desc: 'Machine Learning engine (trained on 1,500+ records) computes safe consumption hours, freshness score, and degradation warnings.'
    },
    {
      number: '03',
      title: 'NGO Claims Listing & Gets OTP',
      role: 'Recipient NGO',
      roleColor: '#0284C7',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      icon: Building2,
      desc: 'Verified shelter homes and NGOs browse real-time food listings and claim them. A private 4-digit Handshake OTP is issued to the NGO.'
    },
    {
      number: '04',
      title: 'Volunteer Executes Pickup',
      role: 'Volunteer',
      roleColor: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      icon: Truck,
      desc: 'Local delivery volunteers discover pending batches, accept delivery task ("In Transit"), and transport food safely to the NGO.'
    },
    {
      number: '05',
      title: 'Secure OTP Handshake Handover',
      role: 'Handover & Security',
      roleColor: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
      icon: ShieldCheck,
      desc: 'Volunteer asks NGO for the 4-digit code. Submitting it authenticates physical delivery, marking status as "Delivered" with reviews.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #065F46 100%)',
        borderRadius: '24px',
        padding: '2.5rem',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Workflow size={16} /> End-to-End Operational Lifecycle
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            How Food Redistribution System Works
          </h2>
          <p style={{ fontSize: '1rem', color: '#E2E8F0', lineHeight: 1.6 }}>
            Our platform connects food donors, NGOs, volunteers, and administrators in a zero-trust, automated redistribution pipeline powered by real-time ML freshness validation and secure OTP handshakes.
          </p>
        </div>
      </div>

      {/* 5-Step Visual Process */}
      <div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={22} color="#059669" /> 5-Step Zero-Trust Lifecycle
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.number}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: `1px solid ${s.borderColor}`,
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: s.roleColor,
                    letterSpacing: '-0.05em'
                  }}>
                    {s.number}
                  </span>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: s.bgColor,
                    color: s.roleColor,
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    <Icon size={22} />
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: s.roleColor,
                    background: s.bgColor,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px'
                  }}>
                    {s.role}
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', marginTop: '0.5rem', marginBottom: '0.4rem' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Three-Tier Architecture Spotlight */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle)',
        padding: '2rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={22} color="#0284C7" /> Three-Tier System Architecture
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                <Monitor size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>Presentation Tier</h4>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>React 18 • Vite • Responsive CSS</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Dedicated, responsive dashboards for Donors, NGOs, Volunteers, and Admins with live status synchronization and micro-animations.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'grid', placeItems: 'center' }}>
                <Server size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>Application Tier</h4>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Python • Flask REST APIs • JWT</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Handles business logic, stateless token authentication, ML freshness prediction algorithms, and secure OTP handshake generation.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}>
                <Database size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>Data Tier</h4>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>MySQL • Resilient JSON Fallback</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              ACID-compliant storage for users, food listings, claims, delivery status, and feedback with automatic schema synchronization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
