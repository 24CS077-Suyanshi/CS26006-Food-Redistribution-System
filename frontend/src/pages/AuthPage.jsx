import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'donor', label: 'Donor', hint: 'Restaurants, hotels, caterers', icon: Building2 },
  { id: 'ngo', label: 'NGO', hint: 'Shelters and social groups', icon: HeartHandshake },
  { id: 'volunteer', label: 'Volunteer', hint: 'Pickup and delivery support', icon: Truck }
];

const donorOrgTypes = ['Restaurant', 'Hotel', 'Caterer', 'Household', 'Other'];
const ngoOrgTypes = ['NGO', 'Shelter', 'Community Organization', 'Other'];

export default function AuthPage({ onLoginSuccess, initialMode = 'login', initialRole = 'donor', onModeChange }) {
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    organizationType: 'Restaurant',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  useEffect(() => {
    setRole(initialRole);
    if (initialRole === 'donor') setFormData(p => ({ ...p, organizationType: 'Restaurant' }));
    if (initialRole === 'ngo') setFormData(p => ({ ...p, organizationType: 'NGO' }));
  }, [initialRole]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError('');

    if (!isLogin) {
      if (formData.password.length < 6) {
        setValidationError('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    let savedName = '';
    if (isLogin) {
      try {
        const saved = JSON.parse(localStorage.getItem('frs_user') || '{}');
        if (saved.name && saved.role === role) {
          savedName = saved.name;
        }
      } catch (_) { }
    }

    const mockUser = {
      id: Date.now(),
      name:
        formData.name ||
        savedName ||
        (role === 'donor' ? 'Grand Hyatt Hotel' : role === 'ngo' ? 'Hope Shelter NGO' : 'Alex Smith'),
      email: formData.email || `${role}@foodshare.org`,
      role,
      phone: formData.phone || '+91 9876543210',
      address: formData.address || 'Downtown City Center, Block 4',
      organizationType: formData.organizationType
    };

    login(mockUser, 'mock_jwt_token_2026');
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleDemoAccess = () => {
    const demoUser = {
      id: 1,
      name:
        role === 'donor'
          ? 'Grand Hyatt Hotel'
          : role === 'ngo'
            ? 'Hope Shelter NGO'
            : 'Alex Smith',
      email: `${role}@foodshare.org`,
      role,
      phone: '+91 9876543210',
      address: 'Downtown City Center'
    };

    login(demoUser, 'demo_jwt_token_2026');
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Utensils size={20} />
          </span>
          <span className="text-lg font-black tracking-tight text-slate-900">Food Redistribution System</span>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
            {isLogin ? 'Login' : 'Create Account'}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {isLogin
              ? 'Login to your Food Redistribution System account.'
              : 'Join the Food Redistribution System.'}
          </p>
        </header>

        {/* Role Selector */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Select Role</p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((item) => {
              const Icon = item.icon;
              const active = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all ${
                    active
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-emerald-600' : 'text-slate-500'} />
                  <span className="mt-1.5 text-sm font-extrabold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {validationError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 border border-red-200">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Full Name</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
                <User size={18} className="text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  placeholder={role === 'donor' ? 'e.g. Grand Hyatt Hotel' : role === 'ngo' ? 'e.g. Hope Shelter NGO' : 'e.g. Alex Smith'}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </label>
          )}

          {!isLogin && role === 'donor' && (
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Organization Type</span>
              <select
                value={formData.organizationType}
                onChange={(e) => updateField('organizationType', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {donorOrgTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}

          {!isLogin && role === 'ngo' && (
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Organization Type</span>
              <select
                value={formData.organizationType}
                onChange={(e) => updateField('organizationType', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {ngoOrgTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>Email Address</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
              <Mail size={18} className="text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                placeholder="name@email.com"
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </label>

          {!isLogin && (
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Phone Number</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Phone size={18} className="text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  placeholder="+91 98765 43210"
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </label>
          )}

          {!isLogin && (
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Address</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
                <MapPin size={18} className="text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  placeholder="Enter full address"
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
              <Lock size={18} className="text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                placeholder="Enter password"
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {!isLogin && (
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Confirm Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Lock size={18} className="text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  placeholder="Re-enter password"
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </label>
          )}

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="font-bold text-emerald-600 hover:underline"
                onClick={() => window.alert('Password reset link sent to your email.')}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700"
          >
            {isLogin ? 'Login' : 'Create Account'} <ArrowRight size={18} />
          </button>

          <div className="mt-2 text-center text-sm font-semibold text-slate-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="font-bold text-emerald-600 hover:underline"
              onClick={() => {
                const newMode = !isLogin;
                setIsLogin(newMode);
                if (onModeChange) onModeChange(newMode ? 'login' : 'register');
                setValidationError('');
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}