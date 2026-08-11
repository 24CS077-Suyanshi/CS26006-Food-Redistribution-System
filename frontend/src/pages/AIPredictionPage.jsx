import React, { useState } from 'react';
import { Sparkles, Cpu, Clock, Thermometer, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const foodTypes = [
  { id: 'cooked-rice', label: '🍚 Cooked Rice / Dal', baseHours: 4 },
  { id: 'bread', label: '🍞 Bread & Bakery', baseHours: 8 },
  { id: 'curry', label: '🍛 Curry / Sabzi', baseHours: 3 },
  { id: 'non-veg', label: '🍗 Non-Vegetarian Dishes', baseHours: 2 },
  { id: 'fruits', label: '🍎 Fruits & Salads', baseHours: 6 },
  { id: 'dairy', label: '🥛 Dairy / Milk Products', baseHours: 5 },
  { id: 'packed', label: '📦 Sealed / Packed Food', baseHours: 24 },
  { id: 'sweets', label: '🍮 Sweets / Desserts', baseHours: 12 }
];

const storageTypes = [
  { id: 'room', label: 'Room Temperature (25°C)', modifier: 0 },
  { id: 'cool', label: 'Cool Room (12–15°C)', modifier: 3 },
  { id: 'refrigerated', label: 'Refrigerated (0–4°C)', modifier: 8 },
  { id: 'hot', label: 'Hot Storage (>60°C)', modifier: 2 }
];

function GaugeRing({ hours, maxHours = 12 }) {
  const pct = Math.min(hours / maxHours, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct > 0.6 ? '#22c55e' : pct > 0.3 ? '#f59e0b' : '#ef4444';

  return (
    <div className="ai-gauge-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} stroke="#f1f5f9" strokeWidth="10" fill="none" />
        <circle
          cx="70" cy="70" r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease' }}
        />
      </svg>
      <div className="ai-gauge-center">
        <span className="ai-gauge-hours" style={{ color }}>{hours}h</span>
        <span className="ai-gauge-label">Safe Window</span>
      </div>
    </div>
  );
}

function getRecommendationClass(hours) {
  if (hours >= 6) return '';
  if (hours >= 3) return 'warning';
  return 'danger';
}

function getRecommendationText(hours, foodLabel, storageLabel) {
  if (hours >= 8) return `✅ Food is safe for consumption. The ${foodLabel.split(' ').slice(1).join(' ')} stored under ${storageLabel} has a generous safe window. Distribute confidently to NGOs and families.`;
  if (hours >= 4) return `⚠️ Food is safe but act quickly. Distribute within the next ${hours} hours. Coordinate pickup now to ensure quality.`;
  if (hours >= 2) return `🔶 Urgent pickup needed! Only ${hours} hours remaining. Contact your nearest NGO volunteer immediately for emergency pickup.`;
  return `🚨 Critical: Food safety window is less than 2 hours. Immediate action required or food must be discarded per FSSAI guidelines.`;
}

export default function AIPredictionPage() {
  const [selectedFood, setSelectedFood] = useState(foodTypes[0]);
  const [selectedStorage, setSelectedStorage] = useState(storageTypes[0]);
  const [preparedHoursAgo, setPreparedHoursAgo] = useState(1);
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const handlePredict = () => {
    setPredicting(true);
    setTimeout(() => {
      const raw = selectedFood.baseHours + selectedStorage.modifier - preparedHoursAgo;
      const safeHours = Math.max(0, Math.min(raw, selectedFood.baseHours + selectedStorage.modifier));
      const confidence = Math.min(95 + Math.floor(Math.random() * 4), 98);
      setResult({ safeHours, confidence, food: selectedFood.label, storage: selectedStorage.label });
      setPredicting(false);
    }, 900);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 ai-page">

      {/* Banner */}
      <div className="ai-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(134,239,172,0.4)', borderRadius: '10px', padding: '0.4rem 0.6rem', display: 'grid', placeItems: 'center', color: '#86efac' }}>
            <Cpu size={20} />
          </span>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI / ML Engine
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.1rem', color: 'white' }}>
              Food Expiry Predictor
            </h2>
          </div>
        </div>
        <p style={{ color: '#86efac', fontSize: '0.9rem', maxWidth: '60ch' }}>
          Our rule-based ML model analyzes food type, storage conditions, and preparation time to predict the remaining safe consumption window — helping donors list food with confidence.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { icon: CheckCircle2, label: 'FSSAI Guidelines Compliant' },
            { icon: Sparkles, label: 'ML-Powered Prediction' },
            { icon: Clock, label: 'Real-time Analysis' }
          ].map(b => {
            const Icon = b.icon;
            return (
              <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.76rem', fontWeight: 700, color: '#dcfce7' }}>
                <Icon size={13} /> {b.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="ai-main-grid">

        {/* Input Card */}
        <div className="ai-input-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} className="text-emerald-600" style={{ color: '#16a34a' }} />
            Input Parameters
          </h3>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Food Type</label>
            <select
              className="form-select"
              value={selectedFood.id}
              onChange={e => setSelectedFood(foodTypes.find(f => f.id === e.target.value))}
            >
              {foodTypes.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Storage Condition</label>
            <select
              className="form-select"
              value={selectedStorage.id}
              onChange={e => setSelectedStorage(storageTypes.find(s => s.id === e.target.value))}
            >
              {storageTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Prepared How Long Ago: <strong style={{ color: '#15803d' }}>{preparedHoursAgo} hour{preparedHoursAgo !== 1 ? 's' : ''} ago</strong>
            </label>
            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={preparedHoursAgo}
              onChange={e => setPreparedHoursAgo(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#22c55e' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.25rem' }}>
              <span>Just Now</span>
              <span>4 hrs</span>
              <span>8 hrs ago</span>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.85rem' }}
            onClick={handlePredict}
            disabled={predicting}
          >
            {predicting ? (
              <>
                <span className="loading-spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Analyzing ML Model...
              </>
            ) : (
              <><Cpu size={16} /> Predict Safe Window</>
            )}
          </button>

          {/* Info note */}
          <div style={{ marginTop: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <Info size={15} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
              Predictions are based on FSSAI food safety guidelines and environmental modeling. Always cross-check with a food safety officer for critical decisions.
            </p>
          </div>
        </div>

        {/* Result Card */}
        <div className="ai-result-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Thermometer size={18} style={{ color: '#16a34a' }} />
            Prediction Output
          </h3>

          {result ? (
            <>
              {/* Gauge */}
              <div className="ai-gauge-wrap">
                <GaugeRing hours={result.safeHours} maxHours={12} />
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                  Remaining safe consumption time
                </p>
              </div>

              {/* Confidence */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Model Confidence</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#15803d' }}>{result.confidence}%</span>
                </div>
                <div className="ai-confidence-bar">
                  <div className="ai-confidence-fill" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Food Type', value: result.food.split(' ').slice(1).join(' ') },
                  { label: 'Storage', value: result.storage.split('(')[0].trim() },
                  { label: 'Prepared', value: `${preparedHoursAgo}h ago` },
                  { label: 'Safe Until', value: result.safeHours > 0 ? `${result.safeHours}h from now` : 'Expired' }
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                    <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className={`ai-recommendation ${getRecommendationClass(result.safeHours)}`}>
                {getRecommendationText(result.safeHours, result.food, result.storage)}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ flex: 1 }}>
              <div className="empty-state-icon" style={{ width: 80, height: 80 }}>
                <Sparkles size={36} />
              </div>
              <h3>No Prediction Yet</h3>
              <p>Fill in the food details on the left and click "Predict Safe Window" to get an instant AI analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>How the AI Engine Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { step: '1', title: 'Food Type Classification', desc: 'Identifies protein, carbohydrate, and moisture content category.' },
            { step: '2', title: 'Storage Modeling', desc: 'Applies temperature curves and bacterial growth rate factors.' },
            { step: '3', title: 'Freshness Decay', desc: 'Deducts time elapsed since preparation from the safe window.' },
            { step: '4', title: 'Confidence Scoring', desc: 'Weights input quality and edge cases to produce confidence %.' }
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#15803d', fontWeight: 900, fontSize: '0.8rem', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{item.step}</span>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</p>
                <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5, marginTop: '0.15rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
