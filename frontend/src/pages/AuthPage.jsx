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
  Utensils,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const roles = [
  { id: 'donor', label: 'Donor', hint: 'Restaurants, hotels, caterers', icon: Building2 },
  { id: 'ngo', label: 'NGO', hint: 'Shelters and social groups', icon: HeartHandshake },
  { id: 'volunteer', label: 'Volunteer', hint: 'Pickup and delivery support', icon: Truck },
  { id: 'admin', label: 'Admin', hint: 'Platform control & audit', icon: ShieldCheck }
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
  const [loading, setLoading] = useState(false);

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

  const getLocalRegisteredUsers = () => {
    try {
      const stored = localStorage.getItem('frs_registered_users');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [
      { id: 1, name: "Grand Hyatt Hotel", email: "donor@frs.org", password: "password123", role: "donor", address: "Downtown Center, Block 4", organizationType: "Hotel" },
      { id: 2, name: "Hope Shelter NGO", email: "ngo@frs.org", password: "password123", role: "ngo", address: "Westside Care Center", organizationType: "NGO" },
      { id: 3, name: "Alex Smith", email: "volunteer@frs.org", password: "password123", role: "volunteer", address: "City Center", organizationType: "Individual" },
      { id: 4, name: "System Administrator", email: "admin@frs.org", password: "password123", role: "admin", address: "Central Command HQ", organizationType: "Admin" }
    ];
  };

  const saveLocalUser = (newUser) => {
    try {
      const users = getLocalRegisteredUsers();
      users.push(newUser);
      localStorage.setItem('frs_registered_users', JSON.stringify(users));
    } catch (_) {}
  };

  const handleLocalFallbackLogin = (email, password, requestedRole) => {
    const allUsers = getLocalRegisteredUsers();
    const userMatch = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userMatch) {
      setValidationError('Invalid email or password. Account not found.');
      return;
    }

    if (userMatch.password !== password) {
      setValidationError('Invalid email or password.');
      return;
    }

    // Strict Role Validation
    if (userMatch.role.toLowerCase() !== requestedRole.toLowerCase()) {
      setValidationError(`Role Mismatch! This account is registered as '${userMatch.role.toUpperCase()}'. You cannot log in under the '${requestedRole.toUpperCase()}' role. Please select the '${userMatch.role.toUpperCase()}' tab.`);
      return;
    }

    login(userMatch, 'local_jwt_token_2026');
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleLocalFallbackRegister = (name, email, password, targetRole) => {
    const allUsers = getLocalRegisteredUsers();
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setValidationError('User with this email already exists. Please login instead.');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name || 'User',
      email: email,
      password: password,
      role: targetRole,
      phone: formData.phone || '',
      address: formData.address || '',
      organizationType: formData.organizationType || targetRole.toUpperCase()
    };

    saveLocalUser(newUser);
    login(newUser, 'local_jwt_token_2026');
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError('');

    const normalizedEmail = (formData.email || '').trim().toLowerCase();
    const password = formData.password;

    if (!normalizedEmail) {
      setValidationError('Email is required.');
      return;
    }

    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== formData.confirmPassword) {
        setValidationError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    if (isLogin) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: normalizedEmail,
          password: password,
          role: role
        });

        const loggedInUser = response.data.user;
        login(loggedInUser, response.data.token);
        if (onLoginSuccess) onLoginSuccess();
      } catch (err) {
        if (err.response) {
          const errMsg = err.response.data?.error || 'Login failed. Please check your credentials.';
          setValidationError(errMsg);
        } else {
          // Backend offline or unreachable - use local fallback with role enforcement
          handleLocalFallbackLogin(normalizedEmail, password, role);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          name: formData.name.trim() || 'User',
          email: normalizedEmail,
          password: password,
          role: role,
          phone: formData.phone,
          address: formData.address,
          organization_type: formData.organizationType
        });

        const newUser = response.data.user;
        saveLocalUser({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: password,
          role: newUser.role,
          phone: formData.phone,
          address: formData.address,
          organizationType: formData.organizationType
        });

        login(newUser, response.data.token);
        if (onLoginSuccess) onLoginSuccess();
      } catch (err) {
        if (err.response) {
          const errMsg = err.response.data?.error || 'Registration failed.';
          setValidationError(errMsg);
        } else {
          handleLocalFallbackRegister(formData.name.trim(), normalizedEmail, password, role);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoAccess = () => {
    const demoProfiles = {
      donor: { id: 1, name: 'Grand Hyatt Hotel', email: 'donor@frs.org', role: 'donor', phone: '+91 9876543210', address: 'Downtown Center, Block 4', organizationType: 'Hotel' },
      ngo: { id: 2, name: 'Hope Shelter NGO', email: 'ngo@frs.org', role: 'ngo', phone: '+91 9876543211', address: 'Westside Care Center', organizationType: 'NGO' },
      volunteer: { id: 3, name: 'Alex Smith', email: 'volunteer@frs.org', role: 'volunteer', phone: '+91 9876543212', address: 'City Center', organizationType: 'Individual' },
      admin: { id: 4, name: 'System Administrator', email: 'admin@frs.org', role: 'admin', phone: '+91 9876543213', address: 'Central Command HQ', organizationType: 'Admin' }
    };

    const demoUser = demoProfiles[role] || demoProfiles.donor;
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isLogin ? 'Login' : 'Create Account'} <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDemoAccess}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/80 px-4 py-2.5 text-sm font-black text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
          >
            ⚡ 1-Click Demo Login as {role.toUpperCase()}
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