import React, { useState } from 'react';
import { Menu, UserPlus, Utensils, X, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', id: 'home-section' },
  { label: 'About Us', id: 'about-section' },
  { label: 'How It Works', id: 'how-it-works-section' },
  { label: 'Features', id: 'features-section' },
  { label: 'Contact', id: 'contact-section' }
];

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (item) => {
    setMenuOpen(false);
    if (item.tab) {
      setActiveTab(item.tab);
      return;
    }
    setActiveTab('home');

    window.requestAnimationFrame(() => {
      const section = document.getElementById(item.id);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
      {/* 100% Full-Bleed Screen Width Container */}
      <div className="flex w-full items-center justify-between px-3 py-3 sm:px-6 md:px-12 lg:px-16">
        {/* Brand Logo - Responsive */}
        <button
          type="button"
          onClick={() => goTo({ id: 'home-section' })}
          className="inline-flex items-center gap-2.5 sm:gap-3.5 text-left focus:outline-none"
        >
          <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/30 flex-shrink-0">
            <Utensils size={22} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 leading-tight truncate">Food Redistribution System</span>
            <span className="mt-0.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-emerald-600">Connecting Food With People</span>
          </span>
        </button>

        {/* Desktop Nav Links - Hidden inside Dashboards, only visible on Home / Landing page */}
        {activeTab !== 'dashboard' && (
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => goTo(item)}
                className={`rounded-full px-5 py-2.5 text-base font-extrabold transition ${
                  activeTab === item.tab 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-800 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Action Buttons - Large & Bold */}
        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <>
              {activeTab === 'dashboard' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-xs transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  ← Back to Home
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-50 px-5 py-2.5 text-base font-black text-emerald-800 shadow-xs transition hover:bg-emerald-100 cursor-pointer"
                >
                  <LayoutDashboard size={18} /> {user.role === 'admin' ? 'Admin Dashboard' : `${user.role.toUpperCase()} Dashboard`}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setActiveTab('home');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-5 py-2.5 text-base font-bold text-rose-600 transition hover:bg-rose-100 cursor-pointer"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth?.('login', 'donor')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-300 bg-white px-6 py-2.5 text-base font-black text-emerald-700 shadow-xs transition hover:bg-emerald-50 cursor-pointer"
              >
                <LogIn size={18} /> Login
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('register', 'donor')}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-2.5 text-base font-black text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 cursor-pointer"
              >
                <UserPlus size={18} /> Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-800 lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 lg:hidden">
          {activeTab !== 'dashboard' && (
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goTo(item)}
                  className="rounded-xl px-4 py-3 text-left text-base font-extrabold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            {user ? (
              <>
                {activeTab === 'dashboard' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveTab('home');
                    }}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-800"
                  >
                    ← Back to Home
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800"
                  >
                    Dashboard ({user.role.toUpperCase()})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    setActiveTab('home');
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-black text-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAuth?.('login', 'donor');
                  }}
                  className="rounded-xl border-2 border-emerald-300 px-4 py-3 text-center text-base font-black text-emerald-700"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAuth?.('register', 'donor');
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-base font-black text-white shadow-md shadow-emerald-600/30"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}