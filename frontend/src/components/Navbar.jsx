import React, { useState } from 'react';
import { Menu, UserPlus, Utensils, X, LogIn } from 'lucide-react';

const navItems = [
  { label: 'Home', id: 'home-section' },
  { label: 'About Us', id: 'about-section' },
  { label: 'How It Works', id: 'how-it-works-section' },
  { label: 'Features', id: 'features-section' },
  { label: 'Contact', id: 'contact-section' }
];

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (sectionId) => {
    setActiveTab('home');
    setMenuOpen(false);

    window.requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
      {/* 100% Full-Bleed Screen Width Container */}
      <div className="flex w-full items-center justify-between px-6 py-4 md:px-12 lg:px-16">
        {/* Brand Logo - Big & Bold */}
        <button
          type="button"
          onClick={() => goTo('home-section')}
          className="inline-flex items-center gap-3.5 text-left focus:outline-none"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/30">
            <Utensils size={24} />
          </span>
          <span className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">Food Redistribution System</span>
            <span className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-600">Connecting Food With People</span>
          </span>
        </button>

        {/* Desktop Nav Links - Extra Wide Spacing & Bold Large Text */}
        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className="rounded-full px-5 py-2.5 text-base font-extrabold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons - Large & Bold */}
        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            onClick={() => onOpenAuth?.('login', 'donor')}
            className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-300 bg-white px-6 py-2.5 text-base font-black text-emerald-700 shadow-xs transition hover:bg-emerald-50"
          >
            <LogIn size={18} /> Login
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth?.('register', 'donor')}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-2.5 text-base font-black text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700"
          >
            <UserPlus size={18} /> Register
          </button>
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
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                className="rounded-xl px-4 py-3 text-left text-base font-extrabold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
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
          </div>
        </div>
      )}
    </header>
  );
}