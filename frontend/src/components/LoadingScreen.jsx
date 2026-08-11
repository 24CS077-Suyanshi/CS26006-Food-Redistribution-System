import React, { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1400);
    const timer2 = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1700);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="loading-screen"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.35s ease-out',
        animation: 'none'
      }}
    >
      <div className="loading-logo">
        <Utensils size={34} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'white', fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
          FRS
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Food Redistribution System
        </p>
      </div>
      <div className="loading-spinner" />
      <p className="loading-text">Loading...</p>
    </div>
  );
}
